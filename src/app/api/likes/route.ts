import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { shiurId } = await request.json();
    if (!shiurId) {
      return NextResponse.json({ error: 'shiurId required' }, { status: 400 });
    }

    const cookieName = `liked_${shiurId}`;
    const alreadyLiked = request.cookies.get(cookieName);

    if (alreadyLiked) {
      return NextResponse.json({ error: 'Already liked' }, { status: 409 });
    }

    const { data: shiur, error: fetchError } = await supabase
      .from('shiurim')
      .select('likes')
      .eq('id', shiurId)
      .single();

    if (fetchError) throw fetchError;

    const newLikes = (shiur?.likes || 0) + 1;

    const { error: updateError } = await supabase
      .from('shiurim')
      .update({ likes: newLikes })
      .eq('id', shiurId);

    if (updateError) throw updateError;

    const response = NextResponse.json({ likes: newLikes });
    response.cookies.set(cookieName, '1', {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Like error:', error);
    return NextResponse.json({ error: error.message || 'Failed to like' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { shiurId } = await request.json();
    if (!shiurId) {
      return NextResponse.json({ error: 'shiurId required' }, { status: 400 });
    }

    const cookieName = `liked_${shiurId}`;
    const wasLiked = request.cookies.get(cookieName);

    if (!wasLiked) {
      return NextResponse.json({ error: 'Not liked' }, { status: 409 });
    }

    const { data: shiur, error: fetchError } = await supabase
      .from('shiurim')
      .select('likes')
      .eq('id', shiurId)
      .single();

    if (fetchError) throw fetchError;

    const newLikes = Math.max(0, (shiur?.likes || 0) - 1);

    const { error: updateError } = await supabase
      .from('shiurim')
      .update({ likes: newLikes })
      .eq('id', shiurId);

    if (updateError) throw updateError;

    const response = NextResponse.json({ likes: newLikes });
    response.cookies.delete(cookieName);

    return response;
  } catch (error: any) {
    console.error('Unlike error:', error);
    return NextResponse.json({ error: error.message || 'Failed to unlike' }, { status: 500 });
  }
}
