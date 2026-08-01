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
- Full admin portal (`/admin/dashboard`, `/admin/clients` with table + Kanban views, `/admin/clients/[id]`,
  `/admin/documents`, `/admin/settings`) built on real data, not a mockup.
- One case file (`components/admin/CaseDataEditor.tsx`) auto-populates the real official W-7, Certificate of
  Accuracy, and Form 1040 PDFs, plus a generated itemized invoice and detailed client cover letter — assembled
  into IRS-mail, client-copy, and CAA-record packages, or downloaded individually.
- Dual-mode application entry: staff can fill a walk-in's full case themselves, or generate a shareable
  `/itin-intake?applicationId=...` link for the client to complete remotely (`app/api/admin/applications/create-draft`,
  `app/api/applications/resume`).
- Client authentication and portal (`/portal`) — passwordless magic-link sign-in, status tracker, document
  upload/view, and client-copy package download, scoped to that client's own data only.
- Email/SMS notifications on status and payment changes (`lib/notify.ts`), and authenticated document access
  proxying (`app/api/documents/[id]/file`) so raw storage URLs are never exposed to the browser.

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

Required for the client portal (magic-link sign-in):

- `CLIENT_SESSION_SECRET` — signs magic-link and session tokens. Without it, the app falls back to an
  insecure development key and logs a warning; set a real random value before real clients sign in.

Required for email/SMS notifications (optional, but nothing sends without them):

- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — email delivery, also used for the client portal's magic links.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` — SMS delivery (only sent if the client has
  a phone number on file).

## Document storage and access control

Identity documents (passport, national ID) upload to Vercel Blob. The raw Blob URL is never exposed to the
browser: every view/download goes through `app/api/documents/[id]/file`, which requires either a valid admin
session (staff) or a signed-in client session that owns the application, fetches the file server-side, and
streams it back. This closes the original gap where the bare Blob URL — long and unguessable, but not actually
access-controlled — could be viewed by anyone who obtained it.

This is a meaningful improvement, but it is not full encryption-at-rest with bucket-level IAM. If that level of
assurance is required for your compliance posture, the next step is migrating the underlying storage to
Supabase Storage (private bucket + Row Level Security) or Amazon S3 (private ACL + short-lived presigned URLs)
behind this same proxy — the proxy's authorization logic wouldn't need to change, only where it fetches from.

## Notes

The PDF compiler intentionally supports fallback pages so the app can build and test before the official IRS
PDFs are added. Once the real templates are uploaded, run `npm run pdf:fields` and tighten the field mappings
inside `app/api/generate-packages/route.ts`.
