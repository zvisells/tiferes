import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('search_trends')
      .select('query, count')
      .order('count', { ascending: false })
      .limit(12);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const trimmed = (query || '').trim().toLowerCase();

    if (trimmed.length < 3) {
      return NextResponse.json({ ok: true });
    }

    const supabase = supabaseServer();

    const { data: existing } = await supabase
      .from('search_trends')
      .select('id, count')
      .eq('query', trimmed)
      .single();

    if (existing) {
      await supabase
        .from('search_trends')
        .update({ count: existing.count + 1, last_searched: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('search_trends')
        .insert({ query: trimmed, count: 1 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
