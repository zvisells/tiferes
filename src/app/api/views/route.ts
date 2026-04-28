import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const shiurId = req.nextUrl.searchParams.get('shiurId');
    if (!shiurId) return NextResponse.json({ count: 0 });

    const supabase = supabaseServer();
    const { count, error } = await supabase
      .from('media_views')
      .select('*', { count: 'exact', head: true })
      .eq('shiur_id', shiurId);

    if (error) throw error;
    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { shiurId } = await req.json();
    if (!shiurId) return NextResponse.json({ ok: false }, { status: 400 });

    const supabase = supabaseServer();
    await supabase.from('media_views').insert({ shiur_id: shiurId });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
