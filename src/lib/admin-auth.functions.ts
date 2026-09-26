import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

/**
 * Session tokens handed back to the browser so it can adopt the real Supabase
 * session via `supabase.auth.setSession(tokens)`.
 */
export interface AdminSessionTokens {
  access_token: string;
  refresh_token: string;
}

export interface EnsureAdminAccountResult {
  ok: boolean;
  /** A human-readable error (real Supabase message + the step that failed). */
  error: string | null;
  /** The step that failed, for diagnostics. */
  step: string | null;
  /** Present only when `ok` is true. */
  tokens: AdminSessionTokens | null;
}

/**
 * Makes sure the built-in admin account exists as a real Supabase user with the
 * `admin` role, signs it in on the server, and returns the resulting session
 * tokens so the browser can adopt them.
 *
 * A real session matters: storage uploads and every admin table are protected
 * by row-level security (`has_role(auth.uid(), 'admin')`). Without a signed-in
 * Supabase user, every upload and admin write is rejected.
 *
 * The account's Supabase password is NOT the password the operator types. It is
 * a strong value derived with HMAC-SHA256 from `SUPABASE_SERVICE_ROLE_KEY`
 * (see `deriveInternalPassword`). The typed password is only used for the
 * constant-time gate below, so this function does nothing unless the submitted
 * credentials match the configured admin credentials.
 */
export const ensureAdminAccount = createServerFn({ method: 'POST' })
  .validator((d: unknown) =>
    z.object({ email: z.string().trim().max(200), password: z.string().max(200) }).parse(d),
  )
  .handler(async ({ data }): Promise<EnsureAdminAccountResult> => {
    const { getAdminCredentials, safeEqual, deriveInternalPassword, createAdminSignInClient } =
      await import('./admin-credentials.server');
    const admin = getAdminCredentials();

    const emailOk = safeEqual(data.email.toLowerCase(), admin.email);
    const passwordOk = safeEqual(data.password, admin.password);
    if (!emailOk || !passwordOk) {
      return { ok: false, error: null, step: null, tokens: null };
    }

    let step = 'init';
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

      step = 'derive-internal-password';
      const internalPassword = deriveInternalPassword(admin.email);

      step = 'create-sign-in-client';
      const signInClient = createAdminSignInClient();

      // 1. Try to sign in on the server with the derived password.
      step = 'sign-in';
      let signIn = await signInClient.auth.signInWithPassword({
        email: admin.email,
        password: internalPassword,
      });

      // 2. If sign-in fails, create the user with the derived password, or if
      //    the email already exists, reset the existing user's password to it
      //    and confirm the email.
      if (signIn.error) {
        step = 'create-user';
        const { error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: admin.email,
          password: internalPassword,
          email_confirm: true,
          user_metadata: { username: admin.username },
        });

        if (createError) {
          // The email likely already exists — locate it and reset its password.
          step = 'find-existing-user';
          let userId: string | null = null;
          for (let page = 1; page <= 20 && !userId; page++) {
            const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
              page,
              perPage: 200,
            });
            if (error) throw error;
            const match = list.users.find((u) => u.email?.toLowerCase() === admin.email);
            if (match) userId = match.id;
            if (list.users.length < 200) break;
          }

          // The account did not exist and could not be created — surface the
          // real create error.
          if (!userId) throw createError;

          step = 'reset-password';
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: internalPassword,
            email_confirm: true,
          });
          if (updateError) throw updateError;
        }

        // 3. Sign in again now that the account exists with the derived password.
        step = 'sign-in-after-setup';
        signIn = await signInClient.auth.signInWithPassword({
          email: admin.email,
          password: internalPassword,
        });
        if (signIn.error) throw signIn.error;
      }

      const session = signIn.data.session;
      const userId = signIn.data.user?.id;
      if (!session || !userId) {
        throw new Error('Supabase returned no session after sign-in.');
      }

      // 4. Give the user the `admin` role in `user_roles`.
      step = 'grant-admin-role';
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert(
          { user_id: userId, role: 'admin' },
          { onConflict: 'user_id,role', ignoreDuplicates: true },
        );
      if (roleError) throw roleError;

      // 5. Return the session tokens for the browser to adopt.
      return {
        ok: true,
        error: null,
        step: null,
        tokens: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        },
      };
    } catch (err) {
      console.error(`[admin-auth] Admin setup failed at step "${step}":`, err);
      const detail = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: `Admin setup failed at step "${step}": ${detail}`,
        step,
        tokens: null,
      };
    }
  });
