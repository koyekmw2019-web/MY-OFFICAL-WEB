-- v7.63: switch from global free quota to one free attempt PER EXAM TYPE.
-- No attempt rows or student/payment records are deleted. A started/abandoned free
-- attempt still consumes the quota for its own exam type.
DROP INDEX IF EXISTS exam_one_free_attempt_per_user;
CREATE UNIQUE INDEX IF NOT EXISTS exam_one_free_attempt_per_user_type
  ON exam_attempts(user_id,exam_type) WHERE access_mode='free';
