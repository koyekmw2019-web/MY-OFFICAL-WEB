-- v7.58: safe administrative removal inside the existing Netlify database.
-- Do not delete payment or paid-access rows: preserve audit and granted subscriptions.
ALTER TABLE exam_payment_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE exam_payment_requests ADD COLUMN IF NOT EXISTS deleted_by TEXT;
ALTER TABLE exam_payment_requests ADD COLUMN IF NOT EXISTS delete_reason TEXT;
CREATE INDEX IF NOT EXISTS exam_payment_visible_status_idx ON exam_payment_requests(status, submitted_at DESC) WHERE deleted_at IS NULL;
