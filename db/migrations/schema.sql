CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  exception_type VARCHAR(80) DEFAULT 'STANDARD_RETURN',
  service_tier VARCHAR(80) DEFAULT 'CAA_CONCIERGE',
  status VARCHAR(80) DEFAULT 'INTAKE_STARTED',
  date_of_birth DATE,
  country_of_citizenship VARCHAR(100),
  mailing_address TEXT,
  foreign_address TEXT,
  w7_data JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS identity_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  doc_type VARCHAR(80) DEFAULT 'PASSPORT',
  document_number VARCHAR(120),
  issuing_country VARCHAR(120),
  expiration_date DATE,
  ocr_confidence NUMERIC(5, 4),
  storage_path TEXT,
  verification_status VARCHAR(80) DEFAULT 'PENDING_REVIEW',
  is_scrubbed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  square_order_id VARCHAR(255) UNIQUE,
  square_payment_link TEXT,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_status VARCHAR(80) DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  event_type VARCHAR(120) NOT NULL,
  actor VARCHAR(120) DEFAULT 'system',
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_client_id ON applications(client_id);
CREATE INDEX IF NOT EXISTS idx_identity_documents_app_id ON identity_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_identity_documents_retention ON identity_documents(is_scrubbed, created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_app_id ON invoices(application_id);
CREATE INDEX IF NOT EXISTS idx_invoices_square_order_id ON invoices(square_order_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_app_id ON audit_events(application_id);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  preferred_date DATE,
  preferred_time TIME,
  service_tier VARCHAR(80),
  status VARCHAR(40) DEFAULT 'REQUESTED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);
