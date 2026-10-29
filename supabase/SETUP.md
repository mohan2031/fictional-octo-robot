# Supabase setup — Gather & Grain Restaurant

This setup is for the restaurant platform only. **Never use the Care Solt Supabase project.**

## Current status

- The SQL schema draft is in `schema.sql`.
- The separate Supabase project has **not** been created.
- The schema has **not** been applied to any database.
- The current Supabase Free organization has reached its 2 active-project limit.
- Attempting to pause `supabase-coquelicot-plank` failed because Supabase reports it is hibernating. Do not delete it just to free a slot.

## Unblock project creation

1. Open https://supabase.com/dashboard and select the organization `mohansingnk781-6686's projects`.
2. Either resolve the hibernating project's status with Supabase Support, or choose a plan that allows another project.
3. Create a new project named `gather-grain-restaurant` in `ap-south-1` (Mumbai).
4. Confirm the actual project creation and billing status in the dashboard before proceeding.

The connected tool's creation quote was $0/month, but that quote does not bypass the free-project quota and is not a promise that all future usage is free.

## After the project exists

1. Review `schema.sql` before applying it. Treat it as a draft; validate RLS policies and test with anon, authenticated owner, and restaurant staff roles.
2. Apply the approved schema only to the new restaurant project.
3. Verify RLS is enabled and test cross-restaurant isolation.
4. Configure the Vercel project environment with the new project's URL and publishable key. Never put a service-role/secret key in browser code.
5. Implement a server-side/Edge Function order endpoint that validates the QR/table token, checks current menu prices and availability, calculates totals on the server, and writes orders transactionally. Do not allow anonymous clients to insert or update orders directly.
6. Add payment processing only after order creation/status flows work, using verified payment webhooks; never trust a client-side "paid" flag.
7. Run end-to-end tests before merging or promoting the deployment.

## Safety rules

- Keep Care Solt untouched.
- Do not merge the restaurant branch or switch production traffic without a separate review.
- Do not use mock orders as real production data.
- Do not add any secret keys to GitHub.
