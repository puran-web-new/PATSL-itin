import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/security';

const categories = new Set(['Advertising', 'Bank fees', 'Contractors', 'Insurance', 'Office', 'Payroll', 'Professional services', 'Software', 'Taxes', 'Travel', 'Other']);

function windowFor(req: NextRequest) {
  const from = req.nextUrl.searchParams.get('from') || '2000-01-01';
  const to = req.nextUrl.searchParams.get('to') || '2999-12-31';
  return { from, to };
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req); if (denied) return denied;
  try {
    const { from, to } = windowFor(req);
    const db = getPool();
    const [invoices, expenses, transactions] = await Promise.all([
      db.query(`SELECT i.id, i.description, i.amount_cents, i.amount_paid_cents, i.payment_status, i.created_at, i.paid_at, i.voided_at, i.void_reason, c.first_name, c.last_name FROM invoices i LEFT JOIN clients c ON c.id = i.client_id WHERE i.created_at >= $1 AND i.created_at < ($2::date + INTERVAL '1 day') ORDER BY i.created_at DESC`, [from, to]),
      db.query(`SELECT id, expense_date, category, description, amount_cents, created_at FROM expenses WHERE archived_at IS NULL AND expense_date >= $1 AND expense_date <= $2 ORDER BY expense_date DESC`, [from, to]),
      db.query(`SELECT pt.id, pt.invoice_id, pt.amount_cents, pt.payment_method, pt.note, pt.received_at, i.description, c.first_name, c.last_name FROM payment_transactions pt JOIN invoices i ON i.id = pt.invoice_id LEFT JOIN clients c ON c.id = i.client_id WHERE pt.received_at >= $1 AND pt.received_at < ($2::date + INTERVAL '1 day') ORDER BY pt.received_at DESC`, [from, to]),
    ]);
    const activeInvoices = invoices.rows.filter((i) => !i.voided_at);
    const invoicedCents = activeInvoices.reduce((sum, i) => sum + i.amount_cents, 0);
    const collectedCents = transactions.rows.reduce((sum, p) => sum + p.amount_cents, 0);
    const receivableCents = activeInvoices.reduce((sum, i) => sum + Math.max(0, i.amount_cents - i.amount_paid_cents), 0);
    const expenseCents = expenses.rows.reduce((sum, e) => sum + e.amount_cents, 0);
    return NextResponse.json({ summary: { invoicedCents, collectedCents, receivableCents, expenseCents, netIncomeCents: collectedCents - expenseCents }, invoices: invoices.rows, expenses: expenses.rows, transactions: transactions.rows });
  } catch (error: any) { return NextResponse.json({ error: error.message || 'Accounting data unavailable. Run the accounting migration first.' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req); if (denied) return denied;
  try {
    const body = await req.json(); const category = String(body.category || 'Other').trim(); const description = String(body.description || '').trim().slice(0, 255); const amountCents = Math.round(Number(body.amount) * 100); const expenseDate = String(body.expenseDate || new Date().toISOString().slice(0, 10));
    if (!categories.has(category) || !description || !Number.isSafeInteger(amountCents) || amountCents < 1) return NextResponse.json({ error: 'Valid date, category, description, and amount are required.' }, { status: 400 });
    const { rows } = await getPool().query(`INSERT INTO expenses (expense_date, category, description, amount_cents) VALUES ($1, $2, $3, $4) RETURNING *`, [expenseDate, category, description, amountCents]);
    return NextResponse.json({ expense: rows[0] }, { status: 201 });
  } catch (error: any) { return NextResponse.json({ error: error.message || 'Failed to record expense.' }, { status: 500 }); }
}
