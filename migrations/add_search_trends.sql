CREATE TABLE IF NOT EXISTS search_trends (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL UNIQUE,
  count INTEGER DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_trends_count ON search_trends (count DESC);
