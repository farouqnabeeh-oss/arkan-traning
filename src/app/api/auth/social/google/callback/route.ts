import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/social/google/callback`;

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`);
    }

    // 2. Fetch user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileResponse.json();

    if (!profile.email) {
      return NextResponse.redirect(`${appUrl}/login?error=no_email`);
    }

    // 3. Find or create user
    let user = await db.user.findUnique({
      where: { email: profile.email.toLowerCase() },
    });

    if (!user) {
      // Create user with a random password hash
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      
      user = await db.user.create({
        data: {
          email: profile.email.toLowerCase(),
          name: profile.name || profile.email.split('@')[0],
          passwordHash,
          role: 'STUDENT',
          emailVerified: true,
        },
      });
    }

    // 4. Create session using our custom auth utility
    const fingerprint = 'google-login';
    await createSession(user.id, user.role, fingerprint);

    // 5. Redirect to dashboard
    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (error) {
    console.error('Google Callback Error:', error);
    return NextResponse.redirect(`${appUrl}/login?error=auth_error`);
  }
}
