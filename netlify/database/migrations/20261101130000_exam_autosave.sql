-- v7.61: additive, preserves prior student/paid data and exam history.
-- Admin attempts are recorded so that their work can also resume.
ALTER TABLE exam_attempts DROP CONSTRAINT IF EXISTS exam_attempts_access_mode_check;
ALTER TABLE exam_attempts ADD CONSTRAINT exam_attempts_access_mode_check
  CHECK (access_mode IN ('student','free','paid','admin'));

CREATE TABLE IF NOT EXISTS exam_attempt_checkpoints (
  attempt_id BIGINT PRIMARY KEY REFERENCES exam_attempts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  phase_index INTEGER NOT NULL DEFAULT 0 CHECK (phase_index BETWEEN 0 AND 2),
  ends_at TIMESTAMPTZ NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS exam_attempt_checkpoints_user_idx
  ON exam_attempt_checkpoints(user_id, saved_at DESC);
