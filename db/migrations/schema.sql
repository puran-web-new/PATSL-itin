CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  reason_for_applying CHAR(1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
