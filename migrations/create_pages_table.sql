-- Create pages table for admin-editable content pages
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(2048),
  button_text VARCHAR(255),
  button_link VARCHAR(2048),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages(slug);

-- Seed with default pages
INSERT INTO pages (slug, title, content) VALUES
  ('about-shul', 'About Shul', 'Default content for About Shul page'),
  ('seforim', 'Seforim', 'Default content for Seforim page')
ON CONFLICT (slug) DO NOTHING;

