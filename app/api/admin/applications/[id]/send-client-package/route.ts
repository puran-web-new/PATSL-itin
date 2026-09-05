import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../../lib/db';
import { notifyPackageReady } from '../../../../../../lib/notify';
import { requireAdmin } from '../../../../../../lib/security';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const pool = getPool();
    const db = await pool.connect();
    let client: { email: string; first_name: string; amount_cents: number | null; amount_paid_cents: number | null; square_payment_link: string | null } | undefined;
    try {
      await db.query('BEGIN');
      const result = await db.query(
        `SELECT c.email, c.first_name, i.amount_cents, i.amount_paid_cents, i.square_payment_link
         FROM applications a
         JOIN clients c ON c.id = a.client_id
         LEFT JOIN LATERAL (
           SELECT amount_cents, amount_paid_cents, square_payment_link
           FROM invoices
           WHERE (application_id = a.id OR (application_id IS NULL AND client_id = c.id))
             AND payment_status <> 'PAID'
           ORDER BY CASE WHEN application_id = a.id THEN 0 ELSE 1 END, created_at DESC
           LIMIT 1
         ) i ON TRUE
         WHERE a.id = $1`,
        [id]
      );
      client = result.rows[0];
      if (!client) {
        await db.query('ROLLBACK');
        return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
      }
      await db.query(`UPDATE applications SET status = 'PACKAGE_READY', updated_at = NOW() WHERE id = $1`, [id]);
      await db.query(
        `INSERT INTO audit_events (application_id, event_type, actor, metadata)
         VALUES ($1, 'PACKAGE_READY_EMAIL_SENT', 'admin', $2)`,
        [id, JSON.stringify({ email: client.email })]
      );
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }

    const balanceCents = Math.max(0, Number(client!.amount_cents || 0) - Number(client!.amount_paid_cents || 0));
    const emailSent = await notifyPackageReady({ email: client!.email, firstName: client!.first_name, applicationId: id, amountCents: balanceCents || null, paymentLink: balanceCents ? client!.square_payment_link : null });
    return NextResponse.json({ success: true, emailSent });
  } catch (error: any) {
    console.error('Client package notification failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to notify the client.' }, { status: 500 });
  }
}
