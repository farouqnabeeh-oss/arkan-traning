import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=no_code`);
  }

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/social/facebook/callback`;

  try {
    // 1. Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`);
    }

    // 2. Fetch user profile from Facebook
    const profileResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`);
    const profile = await profileResponse.json();

    if (!profile.email) {
      // Facebook accounts without verified emails
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
          name: profile.name || profile.email.split('@')[0],
          passwordHash,
          role: 'STUDENT',
          emailVerified: true,
        },
      });
    }

    // 4. Create session
    const fingerprint = 'facebook-login';
    await createSession(user.id, user.role, fingerprint);

    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (error) {
    console.error('Facebook Callback Error:', error);
    return NextResponse.redirect(`${appUrl}/login?error=auth_error`);
  }
}
