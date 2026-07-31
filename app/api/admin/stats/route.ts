import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/security';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const [clients, active, paymentPending, packagesThisMonth] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM clients`),
      query(`SELECT COUNT(*)::int AS count FROM applications WHERE status NOT IN ('SUBMITTED_IRS', 'ARCHIVED_PII_SCRUBBED')`),
      query(`SELECT COUNT(*)::int AS count FROM applications WHERE status = 'PAYMENT_PENDING'`),
      query(
        `SELECT COUNT(*)::int AS count FROM audit_events
         WHERE event_type = 'PACKAGE_GENERATED' AND created_at >= date_trunc('month', NOW())`
      ),
    ]);

    return NextResponse.json({
      totalClients: clients.rows[0].count,
      activeCases: active.rows[0].count,
      paymentPending: paymentPending.rows[0].count,
      packagesThisMonth: packagesThisMonth.rows[0].count,
    });
  } catch (error: any) {
    console.error('Admin stats fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to load stats.' }, { status: 500 });
  }
}
