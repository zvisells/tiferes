# Setup Guide - Database Seeding

## Step 1: Create Tables & Insert Sample Data

To populate your database with real MP3 audio files and sample shiurim:

### Option A: Via Supabase Dashboard (Recommended for first-time setup)

1. **Log in to your Supabase project**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste the SQL**
   - Open `seed.sql` in your project
   - Copy ALL the contents
   - Paste into the Supabase SQL editor

4. **Run the query**
   - Click "Run" (or press Ctrl+Enter)
   - You should see: "Query executed successfully"

5. **Verify tables were created**
   - Click "Table Editor" in the sidebar
   - You should see `shiurim` and `discourse_schedule` tables
   - Click `shiurim` to see the 3 sample discourses

### Option B: Via Command Line (psql)

```bash
# If you have psql installed, run:
psql YOUR_SUPABASE_DATABASE_URL -f seed.sql
```

## Step 2: Test the Application

Once seeded, your database will have:

✅ **3 Sample Shiurim:**
1. Torah Commentary: Parashat Bereishit
2. Ethics and Morality in Jewish Tradition
3. Understanding Jewish Prayer

Each with:
- Real MP3 audio files (from SoundHelix)
- Real cover images (from Unsplash)
- Timestamped topics for navigation
- Tags for filtering

### Test the Features:

1. **Homepage**
   - Visit http://localhost:3000
   - See the 3 shiurim cards displayed

2. **Search & Filters**
   - Type "Torah" or "Ethics" to search
   - See results filtered in real-time

3. **Audio Player**
   - Click on any shiur to open detail page
   - Click "Listen" button
   - Use the audio player controls:
     - Play/Pause
     - Scrub timeline
     - Volume control
     - Download (enabled for 2 of them)

4. **Timestamps Navigation**
   - See the "Topics" section below the player
   - Click any topic (e.g., "Adam and Eve")
   - Audio player jumps to that timestamp ⏱️

5. **Mobile Menu**
   - On mobile or small screen, click hamburger menu
   - Scroll to bottom to see "Next Discourse" widget
   - Shows Monday at 8PM at Tiferes L'Moshe Shul

## Audio Files Used

The sample data uses these public audio files:

| Audio File | Duration |
|------------|----------|
| SoundHelix-Song-1.mp3 | ~1:56 |
| SoundHelix-Song-2.mp3 | ~1:56 |
| SoundHelix-Song-3.mp3 | ~1:56 |

They're publicly available at: https://www.soundhelix.com/examples/mp3/

## Images Used

Sample cover images from Unsplash (free stock photos):
- Torah: Blue gradient
- Ethics: Ocean/waves
- Prayer: Light abstract

## Next Steps

### To Add Your Own Audio:

1. **Upload via Admin Dashboard:**
   - Go to http://localhost:3000/admin
   - Login with your Supabase credentials
   - Fill in the form and upload your MP3 + image
   - Files will be uploaded to Cloudflare R2 (when configured)

2. **Or edit seed.sql:**
   - Update `audio_url` with your MP3 URL
   - Update `image_url` with your image URL
   - Run the SQL again

### To Configure Cloudflare R2:

1. Create a Cloudflare account and set up R2 bucket
2. Get your API credentials
3. Add to `.env.local`:
   ```
   CLOUDFLARE_ACCOUNT_ID=xxx
   CLOUDFLARE_ACCESS_KEY_ID=xxx
   CLOUDFLARE_SECRET_ACCESS_KEY=xxx
   CLOUDFLARE_BUCKET_NAME=tiferes-lmoshe
   NEXT_PUBLIC_CLOUDFLARE_R2_URL=https://pub-xxx.r2.dev
   ```

## Troubleshooting

**"Table already exists" error?**
- The SQL includes `IF NOT EXISTS`, but if you want to reset:
- Go to Table Editor → Click on table → Delete → Confirm
- Then run seed.sql again

**Audio not playing?**
- Check browser console for CORS errors
- Ensure audio URL is publicly accessible
- SoundHelix files should work fine

**Images not showing?**
- Unsplash URLs may have rate limits
- Replace with your own image URLs
- Or use placeholder.com: `https://via.placeholder.com/500x500?text=Sample`

## Database Schema

### shiurim table
```sql
CREATE TABLE shiurim (
  id uuid PRIMARY KEY,
  slug text UNIQUE,
  title text NOT NULL,
  description text,
  tags text[],
  image_url text,
  audio_url text NOT NULL,
  timestamps jsonb,  -- Array of {topic, time}
  allow_download boolean DEFAULT false,
  transcript text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### discourse_schedule table
```sql
CREATE TABLE discourse_schedule (
  id uuid PRIMARY KEY,
  weekday text NOT NULL,
  time text NOT NULL,
  location text,
  next_occurrence timestamptz
);
```

## Questions?

Check the README.md for full setup instructions or contact the development team.

