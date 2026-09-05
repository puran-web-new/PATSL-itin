import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../../lib/db';
import { requireAdmin } from '../../../../../../lib/security';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await context.params;
    const body = await req.json();
    const amountCents = Math.round(Number(body.amount) * 100);
    const method = String(body.method || 'Manual').trim().slice(0, 80);
    const note = String(body.note || '').trim().slice(0, 500);
    if (!Number.isSafeInteger(amountCents) || amountCents < 1) return NextResponse.json({ error: 'Enter a payment amount.' }, { status: 400 });

    const db = await getPool().connect();
    try {
      await db.query('BEGIN');
      const invoiceResult = await db.query(`SELECT id, amount_cents, amount_paid_cents FROM invoices WHERE id = $1 FOR UPDATE`, [id]);
      const invoice = invoiceResult.rows[0];
      if (!invoice) { await db.query('ROLLBACK'); return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 }); }
      const outstanding = invoice.amount_cents - invoice.amount_paid_cents;
      if (amountCents > outstanding) { await db.query('ROLLBACK'); return NextResponse.json({ error: `Payment exceeds the outstanding balance of $${(outstanding / 100).toFixed(2)}.` }, { status: 400 }); }
      const newPaid = invoice.amount_paid_cents + amountCents;
      const status = newPaid >= invoice.amount_cents ? 'PAID' : 'PARTIAL';
      await db.query(`INSERT INTO payment_transactions (invoice_id, amount_cents, payment_method, note) VALUES ($1, $2, $3, $4)`, [id, amountCents, method, note || null]);
      await db.query(`UPDATE invoices SET amount_paid_cents = $1, payment_status = $2, paid_at = CASE WHEN $2 = 'PAID' THEN COALESCE(paid_at, NOW()) ELSE paid_at END WHERE id = $3`, [newPaid, status, id]);
      await db.query('COMMIT');
      return NextResponse.json({ amountPaidCents: newPaid, paymentStatus: status });
    } catch (error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
  } catch (error: any) { return NextResponse.json({ error: error.message || 'Failed to record payment.' }, { status: 500 }); }
}
