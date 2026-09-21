# Rebuild Haamkay on Lovable Cloud

## Goal
Move the Haamkay storefront and admin system into this project so the database, accounts, uploads, orders, and AI tools no longer depend on the old project or its failing deployment token.

## What will be built

1. **Recreate the store database safely**
   - Rebuild products, categories, orders, order items, notifications, media, scheduled changes, price history, AI drafts, FAQs, testimonials, site settings, team members, and admin roles.
   - Keep public catalog reads open while restricting every admin action to verified admin accounts.
   - Create the public product-media storage area with file type and size limits.
   - Preserve the useful default categories and settings already present in the old project.

2. **Move the website into this project**
   - Bring over the current Haamkay visual design, public shopping pages, cart, wishlist, order lookup, contact/story pages, and category landing pages.
   - Rebuild navigation using this project's page system rather than copying the old incompatible router.
   - Preserve mobile behavior, product imagery, and store branding.

3. **Rebuild the admin area**
   - Restore admin sign-in and role checks.
   - Bring over product, category, inventory, orders, customers, analytics, notifications, media, schedules, pricing, site content, team, and AI management screens.
   - Protect both the screens and the underlying data operations; hiding a screen alone will not count as protection.

4. **Replace the fragile AI deployment**
   - Replace the old Gemini-key Edge Functions with Lovable Cloud server functions and the built-in AI gateway.
   - Rebuild product drafting, image studio, image upscaling, and team bio generation.
   - Validate requests, verify admin access on the server, preserve clear error messages, and remove the need for `GEMINI_API_KEY`, GitHub deployment secrets, or manual function redeploys.

5. **Restore ordering and live updates**
   - Rebuild guest order submission and secure order lookup.
   - Restore admin order management, product/notification updates, and any live subscriptions the interface relies on.

6. **Verify the rebuilt system**
   - Check the storefront on desktop and mobile.
   - Sign in as an admin and test a real catalog edit, upload, order flow, and each AI tool end to end.
   - Confirm every page has correct Haamkay sharing and search metadata.

## Important limitation
The GitHub repository contains the app structure and default seed rows, but not the old project’s private database rows, user accounts, or uploaded files. This rebuild will be fully wired and ready for use, but existing products, orders, users, and uploads can only be copied if an export from the old project is provided.

## Technical approach
- Use one clean migration instead of replaying the old migration history, which contains obsolete phone-login tables and earlier permissive access rules.
- Store roles only in a dedicated `user_roles` table and enforce access through row-level policies.
- Use TanStack Start routes and server functions; do not copy React Router or create new Edge Functions.
- Use the generated Lovable Cloud clients and existing project authentication middleware.
- Keep provider errors visible to admins while never exposing credentials to the browser.
