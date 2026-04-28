-- Migration: Add duration column to shiurim table
-- This will store the duration of each shiur to avoid recalculating on page load

-- Step 1: Add duration column to shiurim table
ALTER TABLE shiurim ADD COLUMN duration VARCHAR(20) DEFAULT '--:--';

-- Step 2: Backfill existing shiurim with durations
-- This script requires running on a backend service with audio access
-- For now, set all existing shiurim to a placeholder
-- They will be auto-calculated when the shiur is first edited/re-uploaded
UPDATE shiurim SET duration = '--:--' WHERE duration IS NULL OR duration = '';

-- You can also run this via an API call to backfill durations:
-- Create a temporary API endpoint at /api/backfill-durations that:
-- 1. Fetches all shiurim where duration is NULL or '--:--'
-- 2. For each shiur, fetches the audio_url and calculates duration using ffmpeg or similar
-- 3. Updates the database with the calculated duration

-- Alternative: Use a scheduled job to backfill durations gradually
-- This prevents overwhelming the system with all calculations at once

