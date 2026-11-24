-- STUDYING WITH YE KUN v7.89.0: STAGED ONLY, DO NOT AUTO DEPLOY.
-- Move to netlify/database/migrations only with the complete server-backed release.
-- Does not rewrite or delete existing student, payment, YKCR or exam history rows.
DO $ykoc_v7890$
DECLARE
  existing_def TEXT;
  existing_valid BOOLEAN;
  old_types TEXT[];
  expected_types TEXT[] := ARRAY[
    'bus','car','jlpt_n1','jlpt_n2','jlpt_n3','jlpt_n4','jlpt_n5',
    'maintenance','moped','motorcycle','taxi','truck'
  ]::TEXT[];
BEGIN
  PERFORM set_config('lock_timeout', '3000', true);
  PERFORM set_config('statement_timeout', '30000', true);
  IF to_regclass('public.exam_attempts') IS NULL THEN
    RAISE EXCEPTION 'YKOC v7.89: exam_attempts missing';
  END IF;
  IF to_regclass('public.exam_attempt_question_sets') IS NOT NULL THEN
    RAISE EXCEPTION 'YKOC v7.89: question set table already exists; inspect first';
  END IF;
  SELECT pg_get_constraintdef(c.oid), c.convalidated
  INTO existing_def, existing_valid
  FROM pg_constraint c
  JOIN pg_class t ON t.oid=c.conrelid
  JOIN pg_namespace n ON n.oid=t.relnamespace
  WHERE n.nspname='public' AND t.relname='exam_attempts'
    AND c.conname='exam_attempts_exam_type_check' AND c.contype='c';
  IF existing_def IS NULL OR existing_valid IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'YKOC v7.89: old check missing or invalid';
  END IF;
  SELECT ARRAY(SELECT m[1] FROM regexp_matches(existing_def, '''([^'']+)''', 'g') AS m ORDER BY m[1]) INTO old_types;
  IF old_types IS DISTINCT FROM expected_types THEN
    RAISE EXCEPTION 'YKOC v7.89: exam type values differ from audited main';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='exam_attempts'
      AND indexname='exam_one_free_attempt_per_user_type'
  ) THEN
    RAISE EXCEPTION 'YKOC v7.89: free attempt index not found';
  END IF;
  ALTER TABLE public.exam_attempts
    DROP CONSTRAINT exam_attempts_exam_type_check,
    ADD CONSTRAINT exam_attempts_exam_type_check CHECK (exam_type IN
      ('truck','taxi','bus','maintenance','car','motorcycle','moped',
       'jlpt_n1','jlpt_n2','jlpt_n3','jlpt_n4','jlpt_n5','ordinary_second'));
  CREATE TABLE public.exam_attempt_question_sets (
    attempt_id BIGINT PRIMARY KEY REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    bank_version TEXT NOT NULL CHECK (length(bank_version) BETWEEN 1 AND 128),
    question_ids JSONB NOT NULL,
    illustration_ids JSONB NOT NULL,
    statement_orders JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT exam_second_question_ids_shape CHECK
      (jsonb_typeof(question_ids)='array' AND jsonb_array_length(question_ids)=90),
    CONSTRAINT exam_second_illustration_ids_shape CHECK
      (jsonb_typeof(illustration_ids)='array' AND jsonb_array_length(illustration_ids)=5),
    CONSTRAINT exam_second_statement_orders_shape CHECK
      (jsonb_typeof(statement_orders)='array' AND jsonb_array_length(statement_orders)=5)
  );
END
$ykoc_v7890$;
