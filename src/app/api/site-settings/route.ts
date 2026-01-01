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
      .select('site_pin, sponsor_link, contact_email')
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // Don't expose actual PIN, just confirm it exists
    return NextResponse.json(
      { 
        has_pin: !!settings?.site_pin,
        sponsor_link: settings?.sponsor_link || '',
        contact_email: settings?.contact_email || '',
      },
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
    const body = await request.json();
    const { site_pin, sponsor_link, contact_email } = body;

    // Validate site_pin if provided
    if (site_pin && (site_pin.length !== 4 || !/^\d+$/.test(site_pin))) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Validate sponsor_link if provided
    if (sponsor_link && typeof sponsor_link !== 'string') {
      return NextResponse.json(
        { error: 'Sponsor link must be a valid URL string' },
        { status: 400 }
      );
    }

    // Validate contact_email if provided
    if (contact_email && typeof contact_email !== 'string') {
      return NextResponse.json(
        { error: 'Contact email must be a valid email string' },
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

    // Build update object with only provided fields
    const updateData: any = { id: 1 };
    if (site_pin) updateData.site_pin = site_pin;
    if (sponsor_link) updateData.sponsor_link = sponsor_link;
    if (contact_email) updateData.contact_email = contact_email;

    // Update or create site settings
    const { data, error } = await supabase
      .from('site_settings')
      .upsert(updateData)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Settings updated successfully' },
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

