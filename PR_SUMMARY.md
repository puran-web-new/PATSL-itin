Summary of changes in this branch (fix/pr-9-blocking-fixes):

- Added lib/resolveApplicationId to accept PATSL-... references or UUIDs and resolve to application UUID.
- Fixed create-link route to return invoiceId and validate application IDs via resolver.
- Added fileExists helper and fs/path imports to generate-packages route to avoid runtime errors when assets are missing.
- Implemented outgoing guard for sendEmail/sendSms (DISABLE_OUTGOING env var) to prevent accidental emails/SMS during testing.
- Added payment receipt notification (notifyPaymentReceipt) and wired webhook to send client receipts and staff notifications after successful payment.
- Added ledger migration DB script (db/migrations/006_ledger_entries.sql) to record receipts/refunds for accounting.
- Added smoke-test script (scripts/smoke/test-invoice-workflow.js) to simulate create-link + webhook flow locally.
- Updated lib/firmProfile.ts defaults with the preparer and firm details you provided so generated documents use:
  - reviewerName: PURAN RAMRATAN
  - reviewerTitle: TAX PREPARER
  - phone: 3474803527
  - email: ramratan@puranaccountin.com
  - PTIN: P03318364
  - EIN: 333131861

Next steps for you (manual actions I cannot perform for you):
1) In GitHub, open a Pull Request from fix/pr-9-blocking-fixes into the branch for PR #9 (or into main if you prefer). Use the PR title and description below.
2) In Vercel (production), set DISABLE_OUTGOING=1 to block outgoing emails/SMS and Square calls while we validate. I recommend doing this before merging. To re-enable, set DISABLE_OUTGOING=0.
3) Run the DB migration db/migrations/006_ledger_entries.sql in your database environment after reviewing the migration.
4) Run the smoke test locally (set TEST_ADMIN_TOKEN and TEST_APPLICATION_ID in your env and run the script at scripts/smoke/test-invoice-workflow.js). With DISABLE_OUTGOING=1 enabled, emails will be logged rather than sent.

Paste-ready PR title and description:

Title: Fix/payment + invoice flow: app id resolver, receipt emails, ledger, outgoing guard

Description:
This branch fixes multiple blocking issues and wires end-to-end invoice/payment/receipt flows:

- Accept PATSL-... references and UUIDs for application lookup (lib/resolveApplicationId).
- Return invoiceId when creating a payment link and persist the invoice row.
- Make webhook idempotent and produce payment receipt emails to clients and notifications to staff.
- Add DISABLE_OUTGOING env guard so we can safely test without sending emails/SMS or hitting live payment gateways.
- Add a ledger migration to record receipts/refunds for accounting reconciliation.
- Add a smoke-test script to simulate create-link + webhook flows locally.

Please review and merge after CI passes. Recommended immediate actions after merge:
- Set DISABLE_OUTGOING=1 in Vercel before merging or deploy with it active.
- Run the migration db/migrations/006_ledger_entries.sql.
- Run the smoke test and verify logged email content to confirm receipt templates.

If you want, I can prepare a follow-up PR to add the ledger migration runner and a small admin UI to view ledger entries.
