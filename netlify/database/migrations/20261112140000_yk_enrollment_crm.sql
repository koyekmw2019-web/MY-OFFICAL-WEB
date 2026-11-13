-- v7.87.8: Admin-only prospective inquiry pipeline. NOT an identity or student table.
-- Keep separate from YKCR exam_students and v7.87.7 anonymous marketing ledger.
CREATE TABLE IF NOT EXISTS yk_enrollment_leads (
  id BIGSERIAL PRIMARY KEY,
  prospect_name VARCHAR(120) NOT NULL CHECK (length(btrim(prospect_name)) BETWEEN 1 AND 120),
  contact_channel VARCHAR(16) NOT NULL CHECK (contact_channel IN ('messenger','email','phone','other')),
  contact_reference VARCHAR(180) NOT NULL CHECK (length(btrim(contact_reference)) BETWEEN 1 AND 180),
  course VARCHAR(20) NOT NULL CHECK (course IN ('truck','taxi','bus','general')),
  lead_source VARCHAR(20) NOT NULL CHECK (lead_source IN ('facebook','youtube','google','website','referral','manual','other')),
  status VARCHAR(16) NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','interested','enrolled','closed')),
  followup_date DATE,
  notes VARCHAR(1000) NOT NULL DEFAULT '',
  student_code VARCHAR(80), -- Admin-entered reference only; NOT an authoritative YKCR link.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS yk_enrollment_leads_followup_idx ON yk_enrollment_leads(status,followup_date);
CREATE INDEX IF NOT EXISTS yk_enrollment_leads_updated_idx ON yk_enrollment_leads(updated_at DESC,id DESC);
-- No public SELECT grants/policies. Netlify Function always checks admin role.
