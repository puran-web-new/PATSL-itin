-- Client Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  
  -- Personal Information (W-7 / 1040)
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  country_of_citizenship VARCHAR(100) NOT NULL,
  
  -- Contact & Addresses
  local_street VARCHAR(255),
  local_city VARCHAR(100),
  local_state VARCHAR(50),
  local_zip VARCHAR(20),
  foreign_street VARCHAR(255),
  foreign_city VARCHAR(100),
  foreign_country VARCHAR(100),
  
  -- IRS Specifics
  reason_for_applying CHAR(1), -- 'a' through 'h' as per W-7 instructions
  treaty_country VARCHAR(100),
  treaty_article VARCHAR(50),
  visa_type VARCHAR(50),
  
  -- Certification of Accuracy (W-7 COA / CAA Specifics)
  caa_sign_date DATE,
  doc_presented VARCHAR(100), -- Passport, Birth Certificate, etc.
  doc_expiry DATE,
  doc_ref_number VARCHAR(100),

  -- Billing & Status
  payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, paid, refunded
  application_status VARCHAR(50) DEFAULT 'pending_review',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branded Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount_due NUMERIC(10, 2) NOT NULL,
  amount_paid NUMERIC(10, 2) DEFAULT 0.00,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);