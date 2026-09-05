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
    let client: { email: string; first_name: string } | undefined;
    try {
      await db.query('BEGIN');
      const result = await db.query(
        `SELECT c.email, c.first_name
         FROM applications a
         JOIN clients c ON c.id = a.client_id
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

    const emailSent = await notifyPackageReady({ email: client!.email, firstName: client!.first_name, applicationId: id });
    return NextResponse.json({ success: true, emailSent });
  } catch (error: any) {
    console.error('Client package notification failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to notify the client.' }, { status: 500 });
  }
}
