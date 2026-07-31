# PATSL ITIN Platform

Tagline: **Where Accuracy Meets Integrity**

A secure ITIN intake, identity verification, payment, admin review, and IRS package automation platform for
professional Certified Acceptance Agent (CAA) workflows, built on Next.js (App Router), Neon Postgres, and
Square payments.

## What is implemented

- Unified site shell — sticky header/nav, mobile menu, footer, consistent design system, 404 and error pages
  (`components/layout`, `app/not-found.tsx`, `app/error.tsx`).
- Public landing page (`/`) with a "how it works" flow and trust section.
- Service-tier pricing page (`/marketing`) with FAQ and tier-preselecting links into intake.
- A four-step guided client intake wizard (`/itin-intake`): personal info → case details → identity document
  upload → review & Square checkout, with in-progress draft saved to `sessionStorage` and a confirmation screen
  on return from payment.
- Identity document uploads stored in Vercel Blob (`app/api/documents/upload`) and registered against the
  application (`app/api/documents/register`).
- A public case-status lookup (`/status`) so clients can track progress with their reference ID + last name,
  without needing the admin token.
- A token-protected admin console (`/admin`) with a dedicated sign-in screen, search/status filtering, inline
  status updates, identity document review links, and one-click IRS package generation.
- Neon-backed schema for clients, applications, identity documents, invoices, and audit events
  (`db/migrations/schema.sql`).
- Square payment link API and signed webhook handler.
- PDF package generation endpoint with fallback pages until IRS templates are uploaded.
- Vercel Cron endpoint for 90-day PII scrubbing.
- PDF field discovery utility for real IRS template mapping (`scripts/extract-fields.mjs`).

## Setup

1. Create a Neon database and run `db/migrations/schema.sql`.
2. Copy `.env.local.example` to `.env.local` and fill in the environment variables.
3. Create a Vercel Blob store (Vercel dashboard → Storage → Create → Blob) and connect it to this project —
   it auto-populates `BLOB_READ_WRITE_TOKEN` in Production/Preview. Copy the token into `.env.local` for local dev.
4. Upload fillable IRS templates to `public/templates/`:
   - `fW7.pdf`
   - `fw7coa.pdf`
   - `f1040.pdf`
5. Run `npm run pdf:fields` to inspect the official template field names, then tighten the field mappings in
   `app/api/generate-packages/route.ts`.
6. Run `npm run build` before deploying.

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

Required for identity document uploads:

- `BLOB_READ_WRITE_TOKEN`

Required for scheduled PII scrubbing protection:

- `CRON_SECRET`

## Important compliance note on document storage

Identity documents (passport, national ID) are uploaded to Vercel Blob with `access: 'public'` — the URL is
long and unguessable, but it is **not access-controlled**. Anyone who obtains a document's exact URL could view
it. For a production CAA workflow handling government ID images, evaluate before go-live:

- Vercel Blob private/signed-URL access (if available on your plan), or
- Supabase Storage with Row Level Security (private bucket + signed URLs), or
- Amazon S3 with a private ACL and short-lived signed URLs.

Whichever you choose, also confirm your data retention and breach-notification obligations for storing
government-issued ID images before handling real client documents in production.

## Notes

The PDF compiler intentionally supports fallback pages so the app can build and test before the official IRS
PDFs are added. Once the real templates are uploaded, run `npm run pdf:fields` and tighten the field mappings
inside `app/api/generate-packages/route.ts`.
