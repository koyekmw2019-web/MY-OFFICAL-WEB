CREATE TABLE IF NOT EXISTS exam_students (
  id BIGSERIAL PRIMARY KEY,
  student_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  class_name TEXT,
  class_start DATE NOT NULL,
  expire_date DATE NOT NULL,
  verification_code_hash TEXT NOT NULL,
  linked_user_id TEXT UNIQUE,
  linked_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('truck','taxi','bus','car','motorcycle','moped')),
  access_mode TEXT NOT NULL CHECK (access_mode IN ('student','free','paid')),
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started','submitted','abandoned')),
  score INTEGER,
  passed BOOLEAN,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS exam_one_free_attempt_per_user
  ON exam_attempts(user_id) WHERE access_mode='free';

CREATE TABLE IF NOT EXISTS exam_payment_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  payer_name TEXT NOT NULL,
  plan_code TEXT NOT NULL CHECK (plan_code IN ('week','month','3months','year')),
  amount_yen INTEGER NOT NULL,
  bank_key TEXT,
  transfer_date DATE,
  receipt_blob_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  reviewed_by TEXT,
  admin_note TEXT
);

CREATE TABLE IF NOT EXISTS exam_paid_access (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  payment_request_id BIGINT UNIQUE REFERENCES exam_payment_requests(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS exam_paid_access_user_idx ON exam_paid_access(user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS exam_students_linked_user_idx ON exam_students(linked_user_id);
CREATE INDEX IF NOT EXISTS exam_payments_status_idx ON exam_payment_requests(status, submitted_at DESC);
