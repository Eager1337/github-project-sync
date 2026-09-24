// Server-only: never import this from client code.
//
// The built-in admin account. It can be overridden with the ADMIN_USERNAME /
// ADMIN_PASSWORD environment variables (Lovable Cloud secrets). The password is
// only ever compared on the server, so it is not shipped in the browser bundle.

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
