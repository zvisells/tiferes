import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('site_pin')
      .single();

    if (error) {
      console.error('Error fetching PIN:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // Don't expose actual PIN, just confirm it exists
    return NextResponse.json(
      { has_pin: !!settings?.site_pin },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { site_pin } = await request.json();

    if (!site_pin || site_pin.length !== 4 || !/^\d+$/.test(site_pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update or create site settings
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ id: 1, site_pin })
      .select()
      .single();

    if (error) {
      console.error('Error updating PIN:', error);
      return NextResponse.json(
        { error: 'Failed to update PIN' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'PIN updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in settings update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

