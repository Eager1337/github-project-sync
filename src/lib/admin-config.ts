/**
 * Admin usernames are turned into Supabase auth emails as
 * `${username}@${ADMIN_EMAIL_DOMAIN}` by the admin login form.
 */
export const ADMIN_EMAIL_DOMAIN = 'haamkay.app';

export const adminEmailFor = (username: string) =>
  `${username.trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;
