import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/security';
import { notifyStatusChange } from '../../../../../lib/notify';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const pool = getPool();
    const db = await pool.connect();
    let application: any;
    let documents: any[] = [];
    let timeline: any[] = [];
    let invoices: any[] = [];
    try {
      const result = await db.query(
        `SELECT a.*, c.first_name, c.last_name, c.email, c.phone
         FROM applications a
         JOIN clients c ON c.id = a.client_id
         WHERE a.id = $1`,
        [id]
      );
      application = result.rows[0];

      if (application) {
        const [docsResult, timelineResult, invoicesResult] = await Promise.all([
          db.query(
            `SELECT id, doc_type, document_number, issuing_country, expiration_date,
                    ocr_confidence, storage_path, verification_status, is_scrubbed, created_at
             FROM identity_documents WHERE application_id = $1 ORDER BY created_at DESC`,
            [id]
          ),
          db.query(
            `SELECT id, event_type, actor, metadata, created_at
             FROM audit_events WHERE application_id = $1 ORDER BY created_at DESC LIMIT 50`,
            [id]
          ),
          db.query(
            `SELECT id, square_order_id, square_payment_link, amount_cents, currency, payment_status, created_at
             FROM invoices WHERE application_id = $1 ORDER BY created_at DESC`,
            [id]
          ),
        ]);
        documents = docsResult.rows;
        timeline = timelineResult.rows;
        invoices = invoicesResult.rows;
      }
    } finally {
      db.release();
    }

    if (!application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    return NextResponse.json({ application, documents, timeline, invoices });
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
    let clientInfo: any = null;
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
      const clientResult = await db.query(
        `SELECT c.email, c.phone, c.first_name FROM applications a JOIN clients c ON c.id = a.client_id WHERE a.id = $1`,
        [id]
      );
      clientInfo = clientResult.rows[0] || null;
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }

    if (clientInfo) {
      notifyStatusChange({ email: clientInfo.email, phone: clientInfo.phone, firstName: clientInfo.first_name, applicationId: id, status }).catch((err) =>
        console.error('Status-change notification failed:', err)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin status update failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to update status.' }, { status: 500 });
  }
}
