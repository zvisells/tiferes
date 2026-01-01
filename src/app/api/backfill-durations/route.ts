import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

// Helper to get audio duration from URL using ffprobe-like approach
// or via fetching and inspecting the audio file
async function getAudioDuration(audioUrl: string): Promise<string> {
  try {
    // Fetch the audio file as a blob
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error('Failed to fetch audio');

    const arrayBuffer = await response.arrayBuffer();

    // Try to parse duration from MP3 or WAV headers
    // This is a simplified approach - for production, use ffmpeg/ffprobe
    const duration = parseAudioDuration(arrayBuffer);
    return duration;
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return '--:--';
  }
}

// Simplified audio duration parser
function parseAudioDuration(buffer: ArrayBuffer): string {
  // This is a very basic implementation
  // For production, you'd want to use ffmpeg/ffprobe or similar
  // For now, we'll return a placeholder
  return '--:--';
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.BACKFILL_SECRET_KEY;

    // Basic auth check - use a secret key
    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all shiurim that need duration backfill
    const { data: shiurim, error: fetchError } = await supabase
      .from('shiurim')
      .select('id, audio_url, title')
      .or('duration.is.null,duration.eq.--:--')
      .limit(10); // Process 10 at a time to avoid timeouts

    if (fetchError) throw fetchError;

    if (!shiurim || shiurim.length === 0) {
      return NextResponse.json({
        message: 'All shiurim have durations',
        processed: 0,
      });
    }

    let processed = 0;
    let failed = 0;

    // Process each shiur
    for (const shiur of shiurim) {
      try {
        const duration = await getAudioDuration(shiur.audio_url);

        const { error: updateError } = await supabase
          .from('shiurim')
          .update({ duration })
          .eq('id', shiur.id);

        if (updateError) {
          console.error(`Failed to update ${shiur.id}:`, updateError);
          failed++;
        } else {
          processed++;
        }
      } catch (error) {
        console.error(`Error processing ${shiur.id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      message: `Backfill completed: ${processed} processed, ${failed} failed`,
      processed,
      failed,
      remaining: shiurim.length - processed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Backfill failed: ${message}` },
      { status: 500 }
    );
  }
}

