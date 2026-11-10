-- v7.86.5 — private, account-scoped exam coaching evidence and personal target dates.
-- No change to exam access, payments, student verification or old result records.
CREATE TABLE IF NOT EXISTS exam_coach_topic_results (
  attempt_id BIGINT PRIMARY KEY REFERENCES exam_attempts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  topic_stats JSONB NOT NULL,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS exam_coach_results_user_exam_idx
  ON exam_coach_topic_results(user_id,exam_type,analyzed_at DESC);
CREATE TABLE IF NOT EXISTS exam_coach_target_dates (
  user_id TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  target_date DATE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(user_id,exam_type)
);
-- Backend functions enforce current signed-in user. Never publish these as frontend data.
