import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';


export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/social/linkedin/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'LinkedIn Client ID is not configured' }, { status: 500 });
  }

  const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=linkedin-state&scope=${encodeURIComponent('openid profile email')}`;

  return NextResponse.redirect(url);
}
