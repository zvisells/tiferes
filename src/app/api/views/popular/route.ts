import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const exclude = req.nextUrl.searchParams.get('exclude') || '';
    const supabase = supabaseServer();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: viewCounts, error: viewError } = await supabase
      .from('media_views')
      .select('shiur_id')
      .gte('viewed_at', thirtyDaysAgo);

    if (viewError) throw viewError;

    const counts: Record<string, number> = {};
    for (const row of viewCounts || []) {
      if (row.shiur_id === exclude) continue;
      counts[row.shiur_id] = (counts[row.shiur_id] || 0) + 1;
    }

    const topIds = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    if (topIds.length === 0) {
      return NextResponse.json([]);
    }

    const { data: shiurim, error: shiurError } = await supabase
      .from('shiurim')
      .select('id, title, slug, image_url, duration, created_at, media_type, audio_url')
      .in('id', topIds);

    if (shiurError) throw shiurError;

    const ordered = topIds
      .map(id => {
        const s = shiurim?.find(sh => sh.id === id);
        return s ? { ...s, views: counts[id] } : null;
      })
      .filter(Boolean);

    return NextResponse.json(ordered);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
