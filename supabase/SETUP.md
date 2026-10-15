# Backend setup: reliable quote submissions + text notifications

This project saves every request to Supabase first. The customer only sees success after the database insert succeeds. SMS/email notifications are best-effort; a provider failure does not erase the saved lead.

## 1) Create the database
1. Create a project at https://supabase.com/
2. Open **SQL Editor** and run `schema.sql`.
3. In **Project Settings → API**, copy the Project URL and anon/public key.

## 2) Connect the frontend
1. Copy `.env.example` to `.env.local`.
2. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. For local testing: `npm install`, then `npm run dev`.

## 3) Deploy the secure quote function
Install the Supabase CLI and sign in, then from the project root:
- `supabase login`
- `supabase link --project-ref YOUR_PROJECT_REF`
- `supabase functions deploy submit-quote --no-verify-jwt`

Set server secrets in the Supabase dashboard under **Edge Functions → Secrets** (or via `supabase secrets set`):
- `SUPABASE_URL` — project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only; never put in VITE_ variables or browser code)
- `SITE_ORIGIN` — your deployed website origin, e.g. `https://yourdomain.com`

The endpoint is public because customers submit without logging in. Add rate limiting / CAPTCHA before promoting the site widely.

## 4) Turn on text notifications (Twilio)
Create a Twilio account and configure an SMS-capable number. Set these secrets:
- `OWNER_PHONE` — your phone in E.164 format, e.g. `+15025550123`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` — your Twilio number in E.164 format

Twilio may require account verification and/or approved messaging setup. Costs may apply. Keep all credentials server-side.

## 5) Email alerts and customer confirmation (recommended backup)
Create a Resend account and verify a sending domain. Set:
- `RESEND_API_KEY`
- `OWNER_EMAIL`
- `RESEND_FROM_EMAIL` — a verified sender, e.g. `Driveline Detailing <quotes@yourdomain.com>`

Owner email notifications are a backup to SMS. If a customer supplies an email, they also receive a confirmation email. The customer form does not promise an email confirmation unless that provider is configured.

## 6) Check leads
Open Supabase **Table Editor → quote_requests**. This is the backup if SMS or email delivery fails. Do not expose the service role key or make this table publicly readable.

## 7) Deploy the website
Import the folder into a private GitHub repository and connect it to Vercel. Add the two `VITE_` environment variables in Vercel's project settings, then deploy. Add your custom domain later when ready.

## Before launch
- Submit a test request and verify it appears in `quote_requests`.
- Confirm owner SMS arrives.
- Confirm owner email arrives.
- Confirm customer confirmation email arrives when an email is supplied.
- Test invalid inputs and phone-sized screens.
- Configure rate limiting / CAPTCHA and review your privacy policy before advertising the form.
