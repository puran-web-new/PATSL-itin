# PATSL ITIN Platform

Tagline: **Where Accuracy Meets Integrity**

This is the foundation for the PATSL ITIN intake, admin review, payment, and IRS package automation platform.

## What is implemented

- Public landing page at `/`
- Service-tier page at `/marketing`
- Client intake flow at `/itin-intake`
- Protected admin queue at `/admin`
- Neon-backed schema for clients, applications, identity documents, invoices, and audit events
- Square payment link API and signed webhook handler
- PDF package generation endpoint with fallback pages until IRS templates are uploaded
- Vercel Cron endpoint for 90-day PII scrubbing
- PDF field discovery utility for real IRS template mapping

## Setup

1. Create a Neon database and run `db/migrations/schema.sql`.
2. Copy `.env.local.example` to `.env.local` and fill in the environment variables.
3. Upload fillable IRS templates to `public/templates/`:
   - `fW7.pdf`
   - `fw7coa.pdf`
   - `f1040.pdf`
4. Run `npm run pdf:fields` to inspect the official template field names.
5. Run `npm run build` before deploying.

## Vercel environment variables

Required for the first working deployment:

- `DATABASE_URL`
- `ADMIN_ACCESS_TOKEN`
- `NEXT_PUBLIC_APP_URL`

Required for payment automation:

- `SQUARE_ACCESS_TOKEN`
- `SQUARE_LOCATION_ID`
- `SQUARE_ENVIRONMENT`
- `SQUARE_WEBHOOK_SIGNATURE_KEY`
- `SQUARE_WEBHOOK_URL`

Required for scheduled PII scrubbing protection:

- `CRON_SECRET`

## Notes

The PDF compiler intentionally supports fallback pages so the app can build and test before the official IRS PDFs are added. Once the real templates are uploaded, run `npm run pdf:fields` and tighten the field mappings inside `app/api/generate-packages/route.ts`.
