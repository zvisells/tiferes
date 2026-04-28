CREATE TABLE IF NOT EXISTS media_views (
  id SERIAL PRIMARY KEY,
  shiur_id UUID NOT NULL REFERENCES shiurim(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_views_shiur ON media_views (shiur_id);
CREATE INDEX IF NOT EXISTS idx_media_views_date ON media_views (viewed_at DESC);
