-- v7.82: additive, isolated from exam attempts, access rules, payments and YKCR.
CREATE TABLE IF NOT EXISTS yk_jlpt_learning_progress (
  user_id TEXT PRIMARY KEY,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_updated_at BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
