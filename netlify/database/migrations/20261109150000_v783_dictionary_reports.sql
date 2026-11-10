-- v7.83: additive dictionary feedback; no schema changes to YKCR, identity, exams or payment.
CREATE TABLE IF NOT EXISTS yk_dictionary_reports (
 id BIGSERIAL PRIMARY KEY,
 word_id TEXT NOT NULL,
 jp TEXT NOT NULL,
 reading TEXT NOT NULL DEFAULT '',
 reported_meaning TEXT NOT NULL DEFAULT '',
 issue_type TEXT NOT NULL CHECK (issue_type IN ('wrong_meaning','missing_meaning','reading','example','other')),
 suggested_meaning TEXT NOT NULL DEFAULT '',
 details TEXT NOT NULL DEFAULT '',
 reporter_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','needs_review')),
 reviewer_id TEXT,
 review_note TEXT NOT NULL DEFAULT '',
 reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS yk_dictionary_reports_status_idx ON yk_dictionary_reports(status,reported_at DESC);
CREATE INDEX IF NOT EXISTS yk_dictionary_reports_rate_idx ON yk_dictionary_reports(reporter_hash,reported_at DESC);
CREATE TABLE IF NOT EXISTS yk_dictionary_overrides (
 word_id TEXT PRIMARY KEY,
 jp TEXT NOT NULL,
 reading TEXT NOT NULL DEFAULT '',
 mm TEXT NOT NULL,
 source_report_id BIGINT REFERENCES yk_dictionary_reports(id),
 approved_by TEXT NOT NULL,
 approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
