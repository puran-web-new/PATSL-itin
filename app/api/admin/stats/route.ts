import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/security';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const [
      clients,
      active,
      paymentPending,
      packagesThisMonth,
      applicationsByStatus,
      applicationsBySource,
      documentsByVerification,
      paymentsSummary,
    ] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM clients`),
      query(`SELECT COUNT(*)::int AS count FROM applications WHERE status NOT IN ('SUBMITTED_IRS', 'ARCHIVED_PII_SCRUBBED')`),
      query(`SELECT COUNT(*)::int AS count FROM applications WHERE status = 'PAYMENT_PENDING'`),
      query(
        `SELECT COUNT(*)::int AS count FROM audit_events
         WHERE event_type = 'PACKAGE_GENERATED' AND created_at >= date_trunc('month', NOW())`
      ),
      // Every pipeline status, even ones with zero applications right now.
      query(
        `SELECT status, COUNT(*)::int AS count
         FROM applications
         GROUP BY status`
      ),
      // "Online" = the client self-submitted via the public intake form.
      // "In-house" = staff created the draft themselves (walk-in or phone case).
      // Determined from each application's own INTAKE_CREATED audit event.
      query(
        `SELECT ae.actor, COUNT(*)::int AS count
         FROM (
           SELECT DISTINCT ON (application_id) application_id, actor
           FROM audit_events
           WHERE event_type = 'INTAKE_CREATED'
           ORDER BY application_id, created_at ASC
         ) ae
         GROUP BY ae.actor`
      ),
      query(
        `SELECT verification_status, COUNT(*)::int AS count
         FROM identity_documents
         WHERE is_scrubbed = FALSE
         GROUP BY verification_status`
      ),
      query(
        `SELECT payment_status, COUNT(*)::int AS count, COALESCE(SUM(amount_cents), 0)::int AS total_cents
         FROM invoices
         GROUP BY payment_status`
      ),
    ]);

    const sourceCounts = { online: 0, inHouse: 0 };
    for (const row of applicationsBySource.rows) {
      if (row.actor === 'client') sourceCounts.online = row.count;
      else if (row.actor === 'staff') sourceCounts.inHouse = row.count;
    }

    return NextResponse.json({
      totalClients: clients.rows[0].count,
      activeCases: active.rows[0].count,
      paymentPending: paymentPending.rows[0].count,
      packagesThisMonth: packagesThisMonth.rows[0].count,
      applicationsByStatus: applicationsByStatus.rows,
      applicationsBySource: sourceCounts,
      documentsByVerification: documentsByVerification.rows,
      paymentsSummary: paymentsSummary.rows,
    });
  } catch (error: any) {
    console.error('Admin stats fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to load stats.' }, { status: 500 });
  }
}
