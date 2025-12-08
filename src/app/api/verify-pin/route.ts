import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin || pin.length !== 4) {
      return NextResponse.json(
        { error: 'Invalid PIN format' },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get site PIN from settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('site_pin')
      .single();

    if (settingsError || !settings) {
      console.error('Error fetching site PIN:', settingsError);
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 500 }
      );
    }

    // Verify PIN
    if (pin !== settings.site_pin) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'PIN verified' },
      { status: 200 }
    );
  } catch (error) {
    console.error('PIN verification error:', error);
    return NextResponse.json(
      { error: 'PIN verification failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get site PIN for frontend (don't expose actual value, just check if PIN is required)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { pin_required: true },
        { status: 200 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('site_pin')
      .single();

    if (error || !settings) {
      return NextResponse.json(
        { pin_required: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { pin_required: !!settings.site_pin },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking PIN requirement:', error);
    return NextResponse.json(
      { pin_required: true },
      { status: 200 }
    );
  }
}

