# INFINUX NEXUX

Business workspace by Aarushi Infotech. The app uses Next.js App Router, NextAuth, Prisma, PostgreSQL, and server-side role checks.

## Local setup

1. Keep OAuth and database secrets in `frontend/.env.local`. The required variable names and sample formats are in `.env.example`.
2. Add the Google OAuth redirect URI `http://localhost:3000/api/auth/callback/google` to the Google OAuth client. Production must use the matching deployed callback URL.
3. `OWNER_EMAILS` is the comma-separated list of authorized owners. The local setup has `info.myid@gmail.com` configured; change it if you use another owner account.
4. Set `NEXUX_COMPANY_ID` to the exact ID the owner will enter (`@aarushiinfotech` is the current local value). Set a strong private `NEXUX_COMPANY_PASSWORD` before owner setup.
5. For join request email, connect an email service in EmailJS and create the matching template. Set `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, and `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` in `.env.local`. The template's **To Email** should be the owner inbox, **Reply To** should be `{{requester_email}}`, and its content should use `requester_name`, `requester_email`, `contact_number`, `whatsapp_number`, `company_name`, `company_code`, `message`, `request_id`, and `review_url`. If EmailJS private-key authorization is enabled, also set `EMAILJS_PRIVATE_KEY`. Requests are stored in the owner dashboard even if notification delivery fails.
6. Apply the additive database migrations and regenerate the Prisma client:

   ```powershell
   cd frontend
   npx prisma migrate deploy
   npx prisma generate
   ```

7. Start the app:

   ```powershell
   npm run dev
   ```

The entry key is generated and stored locally as `NEXUX_ENTRY_SECRET`. It is not sent to the browser. Replace it with a new random value before production deployment.

Set `APP_URL` to the deployed application origin so owner notification links point to the correct workspace.

## Access model

- Google OAuth and email/password create accounts with an unselected role.
- Join requests include the applicant name, signed-in email, contact and WhatsApp numbers, and an optional message. The Boss reviews requests in the admin panel.
- Bosses create staff credentials in the admin panel. Staff sign in with Google, pass the workspace entry key, and verify their INFX name, staff ID, password, and private code before reaching the workspace.
- Owner setup requires an address in `OWNER_EMAILS`, the configured company ID, and the company password. Selecting Owner alone never grants administration.
- The entry gate uses an HTTP-only signed cookie and database-backed failed-attempt limits. Login throttling is also stored in PostgreSQL.
- Owner and staff routes load current role and status from the database. Authorization is checked again on write APIs.

The migrations only add NextAuth account/session tables, security-attempt tables, company IDs, and staff request details. They do not reset existing users, companies, requests, or migration history.
