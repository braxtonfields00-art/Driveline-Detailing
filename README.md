# Driveline Detailing website

A responsive React/Vite website for Driveline Detailing in Flemingsburg, Kentucky.

## Includes
- Dark, premium automotive design with lime accent
- Mobile-friendly services and quote request form
- Supabase database storage
- Supabase Edge Function for server-side SMS alerts via Twilio
- Optional owner email alerts and customer confirmation via Resend
- Setup instructions in `supabase/SETUP.md`

## Start locally
1. Install Node.js LTS.
2. Copy `.env.example` to `.env.local` and add your Supabase URL and anon key.
3. Run `npm install`
4. Run `npm run dev`

The form will not submit until the Supabase project and Edge Function are configured. Do not deploy with secrets missing and do not place service-role keys or Twilio credentials in frontend environment variables.
