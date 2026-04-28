-- Seed data for Tiferes L'Moshe

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS shiurim (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  image_url text,
  audio_url text NOT NULL,
  timestamps jsonb DEFAULT '[]'::jsonb,
  allow_download boolean DEFAULT false,
  transcript text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discourse_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday text NOT NULL,
  time text NOT NULL,
  location text,
  next_occurrence timestamptz
);

-- Insert sample shiur with real MP3 file
INSERT INTO shiurim (slug, title, description, tags, image_url, audio_url, timestamps, allow_download, created_at)
VALUES (
  'torah-commentary-parashat-bereishit',
  'Torah Commentary: Parashat Bereishit',
  'A comprehensive exploration of the opening chapters of Genesis, examining the creation narrative, Adam and Eve, and the early history of mankind. This discourse delves into the philosophical implications and ethical lessons embedded in these foundational verses. This is a sample shiur to demonstrate the audio player functionality and timestamped topics.',
  ARRAY['Torah', 'Genesis', 'Commentary', 'Philosophy'],
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&h=500&fit=crop',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  '[
    {"topic": "Introduction & Overview", "time": "0:00:00"},
    {"topic": "Creation and the Universe", "time": "0:15:00"},
    {"topic": "Adam and Eve", "time": "0:30:00"},
    {"topic": "The First Sin", "time": "0:45:00"},
    {"topic": "Cain and Abel", "time": "1:00:00"},
    {"topic": "The Flood and Noah", "time": "1:15:00"},
    {"topic": "Conclusion", "time": "1:35:00"}
  ]'::jsonb,
  true,
  now() - interval '7 days'
);

-- Insert more sample shiurim
INSERT INTO shiurim (slug, title, description, tags, image_url, audio_url, timestamps, allow_download, created_at)
VALUES (
  'ethics-and-morality-jewish-tradition',
  'Ethics and Morality in Jewish Tradition',
  'An exploration of Jewish ethical teachings and their application to modern life. This discourse examines the principles of justice, compassion, and righteousness as embodied in Torah and Talmudic sources.',
  ARRAY['Ethics', 'Talmud', 'Morality', 'Practical Teaching'],
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=500&fit=crop',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  '[
    {"topic": "Opening Remarks", "time": "0:00:00"},
    {"topic": "Justice and Mercy", "time": "0:10:00"},
    {"topic": "Compassion in Practice", "time": "0:25:00"},
    {"topic": "Modern Applications", "time": "0:40:00"},
    {"topic": "Q&A Session", "time": "1:00:00"}
  ]'::jsonb,
  true,
  now() - interval '14 days'
);

INSERT INTO shiurim (slug, title, description, tags, image_url, audio_url, timestamps, allow_download, created_at)
VALUES (
  'understanding-jewish-prayer',
  'Understanding Jewish Prayer: Structure and Meaning',
  'A detailed analysis of the Jewish prayer service, exploring the history, structure, and spiritual significance of the liturgy. This session covers the three daily prayers and their meanings.',
  ARRAY['Prayer', 'Liturgy', 'Spirituality', 'Weekday Service'],
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  '[
    {"topic": "Introduction to Prayer", "time": "0:00:00"},
    {"topic": "Shacharit (Morning Prayer)", "time": "0:12:00"},
    {"topic": "Mincha (Afternoon Prayer)", "time": "0:28:00"},
    {"topic": "Maariv (Evening Prayer)", "time": "0:42:00"},
    {"topic": "Meditative Aspects", "time": "0:55:00"},
    {"topic": "Discussion", "time": "1:10:00"}
  ]'::jsonb,
  false,
  now() - interval '3 days'
);

-- Insert sample discourse schedule
INSERT INTO discourse_schedule (weekday, time, location, next_occurrence)
VALUES (
  'Monday',
  '8:00 PM',
  'Tiferes L''Moshe Shul, 123 Main Street',
  now() + interval '7 days'
)
ON CONFLICT DO NOTHING;

