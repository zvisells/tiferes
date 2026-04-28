import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = supabaseServer();

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    const { error } = await supabase.from('upload_logs').insert({
      shiur_title: body.shiurTitle || null,
      file_name: body.fileName || null,
      file_type: body.fileType || null,
      file_size: body.fileSize || null,
      media_type: body.mediaType || null,
      status: body.status || 'started',
      error_message: body.errorMessage || null,
      upload_method: body.uploadMethod || null,
      user_agent: body.userAgent || null,
      browser: body.browser || null,
      os: body.os || null,
      device: body.device || null,
      screen_width: body.screenWidth || null,
      screen_height: body.screenHeight || null,
      connection_type: body.connectionType || null,
      ip_address: ip,
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('upload_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
