-- v7.60 additive migration: never change current exam/payment/YKCR rules
CREATE TABLE IF NOT EXISTS yk_learning_mistakes (
 id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, exam_type TEXT NOT NULL,
 question_key TEXT NOT NULL, question_text TEXT NOT NULL,
 correct_answer TEXT NOT NULL, user_answer TEXT, explanation_ja TEXT,
 explanation_my TEXT, missed_count INTEGER NOT NULL DEFAULT 1,
 last_missed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(user_id,exam_type,question_key)
);
CREATE INDEX IF NOT EXISTS yk_learning_mistakes_user_idx ON yk_learning_mistakes(user_id,last_missed DESC);
CREATE TABLE IF NOT EXISTS yk_announcements (
 id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL,
 language TEXT NOT NULL DEFAULT 'all' CHECK (language IN ('all','my','ja','en')),
 published BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
