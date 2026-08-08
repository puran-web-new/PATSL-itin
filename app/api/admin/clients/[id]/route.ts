import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/security';

// Full client profile: the client's own info, every application they've ever
// filed, and every document/invoice/timeline event across all of those
// applications -- grouped by application_id so the UI can show "this document
// belongs to this case" rather than one flat undifferentiated list.
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const pool = getPool();
    const db = await pool.connect();
    let client: any;
    let applications: any[] = [];
    let documents: any[] = [];
    let invoices: any[] = [];
    let timeline: any[] = [];
    try {
      const clientResult = await db.query(`SELECT * FROM clients WHERE id = $1`, [id]);
      client = clientResult.rows[0];

      if (client) {
        const appsResult = await db.query(
          `SELECT id, status, service_tier, exception_type, created_at, updated_at
           FROM applications WHERE client_id = $1 ORDER BY created_at DESC`,
          [id]
        );
        applications = appsResult.rows;
        const applicationIds = applications.map((a) => a.id);

        if (applicationIds.length > 0) {
          const [docsResult, invoicesResult, timelineResult] = await Promise.all([
            db.query(
              `SELECT id, application_id, doc_type, document_number, issuing_country, expiration_date,
                      ocr_confidence, storage_path, verification_status, is_scrubbed, created_at
               FROM identity_documents WHERE application_id = ANY($1) ORDER BY created_at DESC`,
              [applicationIds]
            ),
            db.query(
              `SELECT id, application_id, square_order_id, square_payment_link, amount_cents, currency,
                      payment_status, paid_at, created_at
               FROM invoices WHERE application_id = ANY($1) ORDER BY created_at DESC`,
              [applicationIds]
            ),
            db.query(
              `SELECT id, application_id, event_type, actor, metadata, created_at
               FROM audit_events WHERE application_id = ANY($1) ORDER BY created_at DESC LIMIT 100`,
              [applicationIds]
            ),
          ]);
          documents = docsResult.rows;
          invoices = invoicesResult.rows;
          timeline = timelineResult.rows;
        }
      }
    } finally {
      db.release();
    }

    if (!client) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    }

    return NextResponse.json({ client, applications, documents, invoices, timeline });
  } catch (error: any) {
    console.error('Admin client detail fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to load client.' }, { status: 500 });
  }
}
