ALTER TABLE exam_attempts DROP CONSTRAINT IF EXISTS exam_attempts_exam_type_check;
ALTER TABLE exam_attempts ADD CONSTRAINT exam_attempts_exam_type_check CHECK (exam_type IN ('truck','taxi','bus','maintenance','car','motorcycle','moped'));
