import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/security';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await context.params;
    const db = await getPool().connect();
    let client: any;
    let applications: any[] = [];
    let documents: any[] = [];
    let invoices: any[] = [];
    let timeline: any[] = [];
    try {
      client = (await db.query(`SELECT * FROM clients WHERE id = $1`, [id])).rows[0];
      if (client) {
        applications = (await db.query(`SELECT id, status, service_tier, exception_type, created_at, updated_at FROM applications WHERE client_id = $1 ORDER BY created_at DESC`, [id])).rows;
        const applicationIds = applications.map((a) => a.id);
        invoices = (await db.query(`SELECT id, application_id, square_order_id, square_payment_link, amount_cents, amount_paid_cents, currency, payment_status, paid_at, created_at FROM invoices WHERE client_id = $1 OR application_id = ANY($2::uuid[]) ORDER BY created_at DESC`, [id, applicationIds])).rows;
        if (applicationIds.length) {
          const [docsResult, timelineResult] = await Promise.all([
            db.query(`SELECT id, application_id, doc_type, document_number, issuing_country, expiration_date, ocr_confidence, storage_path, verification_status, is_scrubbed, created_at FROM identity_documents WHERE application_id = ANY($1) ORDER BY created_at DESC`, [applicationIds]),
            db.query(`SELECT id, application_id, event_type, actor, metadata, created_at FROM audit_events WHERE application_id = ANY($1) ORDER BY created_at DESC LIMIT 100`, [applicationIds]),
          ]);
          documents = docsResult.rows; timeline = timelineResult.rows;
        }
      }
    } finally { db.release(); }
    if (!client) return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    return NextResponse.json({ client, applications, documents, invoices, timeline });
  } catch (error: any) {
    console.error('Admin client detail fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to load client.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await context.params;
    const body = await req.json();
    const firstName = String(body.firstName || '').trim().slice(0, 100);
    const lastName = String(body.lastName || '').trim().slice(0, 100);
    const email = String(body.email || '').trim().toLowerCase().slice(0, 255);
    const phone = String(body.phone || '').trim().slice(0, 50);
    if (!firstName || !lastName || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'First name, last name, and a valid email are required.' }, { status: 400 });
    const result = await getPool().query(
      `UPDATE clients SET first_name = $1, last_name = $2, email = $3, phone = $4, updated_at = NOW() WHERE id = $5 RETURNING *`,
      [firstName, lastName, email, phone || null, id]
    );
    if (!result.rows[0]) return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    return NextResponse.json({ client: result.rows[0] });
  } catch (error: any) {
    if (error?.code === '23505') return NextResponse.json({ error: 'That email address already belongs to another client.' }, { status: 409 });
    console.error('Client update failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to update client.' }, { status: 500 });
  }
}
