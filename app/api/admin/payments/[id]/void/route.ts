import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../../lib/db';
import { requireAdmin } from '../../../../../../lib/security';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req); if (denied) return denied;
  try {
    const { id } = await context.params; const { reason } = await req.json(); const note = String(reason || '').trim().slice(0, 500);
    if (!note) return NextResponse.json({ error: 'A void reason is required.' }, { status: 400 });
    const db = await getPool().connect();
    try {
      await db.query('BEGIN');
      const invoice = (await db.query(`SELECT id, application_id, voided_at FROM invoices WHERE id = $1 FOR UPDATE`, [id])).rows[0];
      if (!invoice) { await db.query('ROLLBACK'); return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 }); }
      if (invoice.voided_at) { await db.query('ROLLBACK'); return NextResponse.json({ error: 'Invoice is already voided.' }, { status: 409 }); }
      await db.query(`UPDATE invoices SET voided_at = NOW(), void_reason = $1, payment_status = 'VOID' WHERE id = $2`, [note, id]);
      if (invoice.application_id) await db.query(`INSERT INTO audit_events (application_id, event_type, actor, metadata) VALUES ($1, 'INVOICE_VOIDED', 'admin', $2)`, [invoice.application_id, JSON.stringify({ invoiceId: id, reason: note })]);
      await db.query('COMMIT'); return NextResponse.json({ success: true });
    } catch (error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
  } catch (error: any) { return NextResponse.json({ error: error.message || 'Failed to void invoice.' }, { status: 500 }); }
}
