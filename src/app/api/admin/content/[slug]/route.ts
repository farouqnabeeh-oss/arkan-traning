import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content } = await request.json();

  const page = await db.pageContent.upsert({
    where: { slug: params.slug },
    update: { title, content },
    create: { slug: params.slug, title, content },
  });

  return NextResponse.json({ page });
}
