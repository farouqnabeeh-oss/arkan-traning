import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// عند فتح الرابط مباشرة في المتصفح (GET)
export async function GET() {
  try {
    await destroySession();
  } catch {}
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'https://arkan-academy.vercel.app'));
}

export async function POST() {
  try {
    await destroySession();
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'https://arkan-academy.vercel.app'));
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الخروج.' },
      { status: 500 }
    );
  }
}
