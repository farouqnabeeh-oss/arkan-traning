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

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/social/linkedin/callback`;

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId || '',
        client_secret: clientSecret || '',
      }),
    });
    
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`);
    }

    // 2. Fetch user profile from LinkedIn (OpenID UserInfo endpoint)
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
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
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      
      user = await db.user.create({
        data: {
          email: profile.email.toLowerCase(),
          name: profile.name || `${profile.given_name} ${profile.family_name}` || profile.email.split('@')[0],
          passwordHash,
          role: 'STUDENT',
          emailVerified: true,
        },
      });
    }

    // 4. Create session
    const fingerprint = 'linkedin-login';
    await createSession(user.id, user.role, fingerprint);

    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (error) {
    console.error('LinkedIn Callback Error:', error);
    return NextResponse.redirect(`${appUrl}/login?error=auth_error`);
  }
}
