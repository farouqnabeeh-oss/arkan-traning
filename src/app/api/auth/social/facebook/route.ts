import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/social/facebook/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'Facebook Client ID is not configured' }, { status: 500 });
  }

  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=facebook-state&scope=email`;

  return NextResponse.redirect(url);
}
