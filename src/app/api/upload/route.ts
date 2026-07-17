import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { getSessionUser } from '@/lib/auth';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';


const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
    return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'لم يتم إرسال ملف.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'نوع الملف غير مدعوم. يُسمح بـ JPG, PNG, WEBP, GIF فقط.' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'حجم الصورة يتجاوز 5MB.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = extname(file.name) || '.jpg';
  const filename = `${randomUUID()}${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}
