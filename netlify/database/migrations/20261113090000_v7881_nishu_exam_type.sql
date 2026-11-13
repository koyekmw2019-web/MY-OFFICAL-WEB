-- v7.88.1 RC1: allow the separately-metered 第二種免許 practice exam type.
-- Non-destructive; retains all 12 existing types, accounts, attempts and payments.
-- Apply ONLY to isolated Netlify preview / test DB until production release is approved.
BEGIN;
ALTER TABLE exam_attempts DROP CONSTRAINT IF EXISTS exam_attempts_exam_type_check;
ALTER TABLE exam_attempts ADD CONSTRAINT exam_attempts_exam_type_check
 CHECK (exam_type IN ('truck','taxi','bus','maintenance','car','motorcycle','moped',
 'jlpt_n1','jlpt_n2','jlpt_n3','jlpt_n4','jlpt_n5','nishu'));
COMMIT;
