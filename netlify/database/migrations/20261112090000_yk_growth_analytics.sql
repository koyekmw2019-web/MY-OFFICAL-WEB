-- v7.87.7: Separate, non-PII business growth events and manually confirmed totals.
-- Existing students, attempts, identities, payment and YKCR tables are untouched.
CREATE TABLE IF NOT EXISTS yk_growth_click_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL DEFAULT 'class_cta_click' CHECK (event_type = 'class_cta_click'),
  course TEXT NOT NULL CHECK (course IN ('truck','taxi','bus','general')),
  event_source VARCHAR(48) NOT NULL DEFAULT 'direct',
  event_medium VARCHAR(48) NOT NULL DEFAULT 'none',
  event_campaign VARCHAR(64) NOT NULL DEFAULT 'none',
  page_path VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS yk_growth_click_day_idx ON yk_growth_click_events (created_at DESC);
CREATE INDEX IF NOT EXISTS yk_growth_click_course_idx ON yk_growth_click_events (course, event_source, created_at DESC);

CREATE TABLE IF NOT EXISTS yk_growth_manual_entries (
  id BIGSERIAL PRIMARY KEY,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('confirmed_inquiries','enrollment_revenue','marketing_expense')),
  course TEXT NOT NULL CHECK (course IN ('truck','taxi','bus','general')),
  event_source VARCHAR(48) NOT NULL DEFAULT 'unknown',
  units INTEGER NOT NULL DEFAULT 1 CHECK (units BETWEEN 1 AND 100),
  amount_yen BIGINT NOT NULL DEFAULT 0 CHECK (amount_yen BETWEEN 0 AND 100000000),
  entry_day DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT yk_growth_manual_entry_type_chk CHECK (
    (entry_type = 'confirmed_inquiries' AND amount_yen=0) OR
    (entry_type IN ('enrollment_revenue','marketing_expense') AND units=1)
  )
);
CREATE INDEX IF NOT EXISTS yk_growth_manual_day_idx ON yk_growth_manual_entries (entry_day DESC);
