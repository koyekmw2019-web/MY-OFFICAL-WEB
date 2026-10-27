ALTER TABLE exam_students ADD COLUMN IF NOT EXISTS ykcr_student_id TEXT;
ALTER TABLE exam_students ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE exam_students ADD COLUMN IF NOT EXISTS ykcr_updated_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS exam_students_ykcr_student_id_uidx
  ON exam_students(ykcr_student_id)
  WHERE ykcr_student_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS exam_students_status_idx
  ON exam_students(status, expire_date);

CREATE TABLE IF NOT EXISTS ykcr_sync_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  ykcr_student_id TEXT,
  student_code TEXT,
  payload_hash TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ykcr_sync_events_received_idx
  ON ykcr_sync_events(received_at DESC);
