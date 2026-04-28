import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const senderEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'onboarding@resend.dev';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase config');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const origin = request.headers.get('origin') || request.nextUrl.origin;

    console.log('Generating reset link for:', email);
    console.log('Redirect URL:', `${origin}/admin/reset-password`);

    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${origin}/admin/reset-password`,
      },
    });

    if (linkError) {
      console.error('Supabase generateLink error:', linkError.message);
      return NextResponse.json(
        { message: 'If that email exists, a reset link has been sent.' },
        { status: 200 }
      );
    }

    const resetLink = data?.properties?.action_link;
    console.log('Reset link generated:', resetLink ? 'yes' : 'no');

    if (!resetLink) {
      console.error('No action_link in response. Data:', JSON.stringify(data));
      return NextResponse.json(
        { message: 'If that email exists, a reset link has been sent.' },
        { status: 200 }
      );
    }

    console.log('Sending email via Resend from:', senderEmail, 'to:', email);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Tiferes L'Moshe <${senderEmail}>`,
        to: email,
        subject: "Tiferes L'Moshe — Password Reset",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #333;">Password Reset</h2>
            <p>You requested a password reset for your Tiferes L'Moshe admin account.</p>
            <p>Click the button below to set a new password:</p>
            <a href="${resetLink}" 
               style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; 
                      border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 24px;">
              If you didn't request this, you can safely ignore this email.
            </p>
            <p style="color: #999; font-size: 12px;">
              This link will expire in 24 hours.
            </p>
          </div>
        `,
      }),
    });

    const responseBody = await emailResponse.text();
    console.log('Resend response:', emailResponse.status, responseBody);

    if (!emailResponse.ok) {
      console.error('Resend API failed:', emailResponse.status, responseBody);
      return NextResponse.json({ error: 'Failed to send reset email. Check server logs.' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'If that email exists, a reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
