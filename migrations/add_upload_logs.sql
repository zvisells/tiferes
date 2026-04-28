CREATE TABLE IF NOT EXISTS upload_logs (
  id SERIAL PRIMARY KEY,
  shiur_title TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  media_type VARCHAR(10),
  status VARCHAR(20) NOT NULL DEFAULT 'started',
  error_message TEXT,
  upload_method VARCHAR(20),
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  connection_type TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upload_logs_status ON upload_logs (status);
CREATE INDEX IF NOT EXISTS idx_upload_logs_created ON upload_logs (created_at DESC);
