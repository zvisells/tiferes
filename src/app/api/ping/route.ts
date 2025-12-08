import { NextRequest, NextResponse } from 'next/server';

// GET /api/ping - Lightweight endpoint for keeping server alive
export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Keep-alive ping received');
    
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Server is active',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ping error:', error);
    return NextResponse.json(
      { error: 'Ping failed' },
      { status: 500 }
    );
  }
}

