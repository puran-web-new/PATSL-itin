ALTER TABLE applications ADD COLUMN IF NOT EXISTS assigned_staff VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS archived_reason TEXT;

CREATE TABLE IF NOT EXISTS application_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  visibility VARCHAR(20) NOT NULL DEFAULT 'INTERNAL' CHECK (visibility IN ('INTERNAL', 'CLIENT')),
  author VARCHAR(120) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_application_notes_application ON application_notes(application_id, created_at DESC);

CREATE TABLE IF NOT EXISTS application_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  previous_status VARCHAR(80),
  next_status VARCHAR(80) NOT NULL,
  changed_by VARCHAR(120) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_application_status_history_application ON application_status_history(application_id, created_at DESC);
