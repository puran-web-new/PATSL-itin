import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/security';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const pool = getPool();
    const db = await pool.connect();
    let application: any;
    try {
      const result = await db.query(
        `SELECT a.*, c.first_name, c.last_name, c.email, c.phone
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

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error('Admin application fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to load application.' }, { status: 500 });
  }
}

const ALLOWED_STATUSES = [
  'INTAKE_STARTED',
  'DOCUMENTS_RECEIVED',
  'PAYMENT_PENDING',
  'CAA_REVIEW',
  'SUBMITTED_IRS',
  'ARCHIVED_PII_SCRUBBED',
];

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const status = String(body.status || '');

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    const pool = getPool();
    const db = await pool.connect();
    try {
      await db.query('BEGIN');
      const result = await db.query(
        `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
        [status, id]
      );
      if (!result.rows[0]) {
        await db.query('ROLLBACK');
        return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
      }
      await db.query(
        `INSERT INTO audit_events (application_id, event_type, actor, metadata)
         VALUES ($1, 'STATUS_UPDATED', 'admin', $2)`,
        [id, JSON.stringify({ status })]
      );
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin status update failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to update status.' }, { status: 500 });
  }
}
