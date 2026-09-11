import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../../lib/db';
import { notifyPackageReady } from '../../../../../../lib/notify';
import { requireAdmin } from '../../../../../../lib/security';

const DELIVERABLE_STATUSES = new Set(['PACKAGE_READY', 'SUBMITTED_IRS']);

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const pool = getPool();
    const db = await pool.connect();
    let application: { email: string; first_name: string; status: string } | undefined;
    try {
      const result = await db.query(
        `SELECT c.email, c.first_name, a.status
         FROM applications a
         JOIN clients c ON c.id = a.client_id
         WHERE a.id = $1`,
        [id]
      );
      application = result.rows[0];
    } finally {
      db.release();
    }

    if (!application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }
    if (!DELIVERABLE_STATUSES.has(application.status)) {
      return NextResponse.json({ error: 'Set this case to Package ready before sending the client package.' }, { status: 409 });
    }

    const sent = await notifyPackageReady({
      email: application.email,
      firstName: application.first_name,
      applicationId: id,
    });

    await pool.query(
      `INSERT INTO audit_events (application_id, event_type, actor, metadata)
       VALUES ($1, 'PACKAGE_DELIVERY_REQUESTED', 'admin', $2)`,
      [id, JSON.stringify({ accepted: sent })]
    ).catch((error) => console.error('Package delivery audit logging failed:', error));

    if (!sent) {
      return NextResponse.json({ error: 'The package is ready in the portal, but the delivery email was not accepted. Confirm the client email and Resend configuration.' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Package delivery request failed:', error);
    return NextResponse.json({ error: error.message || 'Unable to send the package email.' }, { status: 500 });
  }
}
