-- v7.62: additive + idempotent. Owner policy TOTAL_ONE; retain original unique index.
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS score_verified BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS exam_attempts_user_status_idx ON exam_attempts(user_id,status,started_at DESC);
CREATE INDEX IF NOT EXISTS exam_attempts_user_type_idx ON exam_attempts(user_id,exam_type);
CREATE INDEX IF NOT EXISTS exam_checkpoint_user_phase_idx ON exam_attempt_checkpoints(user_id,phase_index);
-- This index intentionally remains: exam_one_free_attempt_per_user.
