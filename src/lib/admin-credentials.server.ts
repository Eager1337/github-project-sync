// Server-only: never import this from client code.
//
// The built-in admin account. It can be overridden with the ADMIN_USERNAME /
// ADMIN_PASSWORD environment variables (Lovable Cloud secrets). The password is
// only ever compared on the server, so it is not shipped in the browser bundle.
//
// IMPORTANT: the configured admin password is only the credential the operator
// types into the login form; it is used solely for the constant-time gate in
// `ensureAdminAccount`. It is NEVER stored as the account's Supabase password.
// The real Supabase password is derived internally (see `deriveInternalPassword`)
// so it can be strong, rotate with the service role key, and never leak.

import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { ADMIN_EMAIL_DOMAIN } from './admin-config';

export function getAdminCredentials() {
  const username = (process.env['ADMIN_USERNAME'] || 'Eagerbeaver').trim();
  const password = process.env['ADMIN_PASSWORD'] || 'Eagerbeaver123';
  return {
    username,
    password,
    email: `${username.toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`,
  };
}

/**
 * Derives the admin account's *actual* Supabase password.
 *
 * It is an HMAC-SHA256 keyed by `SUPABASE_SERVICE_ROLE_KEY` over the account's
 * email, so it is:
 *   - strong (256 bits of entropy, well past any password policy),
 *   - deterministic (the server can always re-derive it to sign in),
 *   - secret (never shipped to the browser; tied to the service role key),
 *   - rotating (changes automatically if the service role key is rotated).
 *
 * The `Aa1!` prefix guarantees it satisfies any upper/lower/digit/symbol
 * complexity policy Supabase Auth might enforce.
 */
export function deriveInternalPassword(seed: string): string {
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set on the server.');
  }
  const digest = createHmac('sha256', serviceKey)
    .update(`admin-account:${seed}`)
    .digest('hex');
  return `Aa1!${digest}`;
}

/**
 * A server-side Supabase client that uses the publishable (anon) key so it can
 * perform a real password sign-in and hand back session tokens. It never
 * persists a session, so it does not interfere with the service-role admin
 * client used for privileged writes.
 */
export function createAdminSignInClient() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) {
    const missing = [
      ...(!url ? ['SUPABASE_URL'] : []),
      ...(!key ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
    ];
    throw new Error(`Missing Supabase environment variable(s): ${missing.join(', ')}.`);
  }

  const isNewApiKey = key.startsWith('sb_publishable_') || key.startsWith('sb_secret_');

  return createClient<Database>(url, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(
          typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
        );
        if (init?.headers) {
          new Headers(init.headers).forEach((value, k) => headers.set(k, value));
        }
        // New Supabase API keys are opaque strings, not bearer JWTs.
        if (isNewApiKey && headers.get('Authorization') === `Bearer ${key}`) {
          headers.delete('Authorization');
        }
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/** Constant-time string comparison so the check does not leak timing info. */
export function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}
