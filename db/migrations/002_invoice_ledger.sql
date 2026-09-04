-- Run once against the PATSL Neon database before deploying the invoice-ledger release.
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS description VARCHAR(120);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid_cents INTEGER NOT NULL DEFAULT 0;

UPDATE invoices i
SET client_id = a.client_id,
    amount_paid_cents = CASE WHEN i.payment_status = 'PAID' THEN i.amount_cents ELSE i.amount_paid_cents END
FROM applications a
WHERE i.application_id = a.id AND i.client_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  payment_method VARCHAR(80) NOT NULL,
  external_reference VARCHAR(255) UNIQUE,
  note TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
