import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

/**
 * Makes sure the built-in admin account exists as a real Supabase user with the
 * `admin` role, so the browser can sign in with a genuine session.
 *
 * A real session matters: storage uploads and every admin table are protected
 * by row-level security (`has_role(auth.uid(), 'admin')`). Without a signed-in
 * Supabase user, every upload and admin write is rejected.
 *
 * This only does anything when the submitted credentials match the configured
 * admin credentials, which are checked on the server.
 */
export const ensureAdminAccount = createServerFn({ method: 'POST' })
  .validator((d: unknown) =>
    z.object({ email: z.string().trim().max(200), password: z.string().max(200) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; error: string | null }> => {
    const { getAdminCredentials, safeEqual } = await import('./admin-credentials.server');
    const admin = getAdminCredentials();

    const emailOk = safeEqual(data.email.toLowerCase(), admin.email);
    const passwordOk = safeEqual(data.password, admin.password);
    if (!emailOk || !passwordOk) return { ok: false, error: null };

    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

      // Find the existing auth user (small admin user base, so paging is cheap).
      let userId: string | null = null;
      for (let page = 1; page <= 20 && !userId; page++) {
        const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) throw error;
        const match = list.users.find((u) => u.email?.toLowerCase() === admin.email);
        if (match) userId = match.id;
        if (list.users.length < 200) break;
      }

      if (userId) {
        // Keep the account in sync with the configured password and make sure
        // it can sign in (confirmed email).
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: admin.password,
          email_confirm: true,
        });
        if (error) throw error;
      } else {
        const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true,
          user_metadata: { username: admin.username },
        });
        if (error || !created.user) throw error ?? new Error('Could not create the admin user');
        userId = created.user.id;
      }

      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role', ignoreDuplicates: true });
      if (roleError) throw roleError;

      return { ok: true, error: null };
    } catch (err) {
      console.error('[admin-auth] Could not set up the admin account:', err);
      return {
        ok: false,
        error: 'The admin account could not be set up on the server. Please try again in a moment.',
      };
    }
  });
