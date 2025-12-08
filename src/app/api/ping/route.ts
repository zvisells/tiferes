import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/ping - Keep server and database alive
export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Keep-alive ping received - checking Supabase connection');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        {
          status: 'ok',
          timestamp: new Date().toISOString(),
          message: 'Server is active (Supabase credentials missing)',
          supabase: 'skipped',
        },
        { status: 200 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query Supabase to keep connection alive
    const { data, error } = await supabase
      .from('shiurim')
      .select('id', { count: 'exact', head: true }) // Only count, don't fetch data
      .limit(1);

    if (error) {
      console.error('Supabase ping error:', error);
      return NextResponse.json(
        {
          status: 'partial',
          timestamp: new Date().toISOString(),
          message: 'Server active but Supabase connection failed',
          error: error.message,
        },
        { status: 200 }
      );
    }

    console.log('✅ Keep-alive successful - Supabase responsive');

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Server and database are active',
        supabase: 'connected',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ping error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Keep-alive check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

