import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
      return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: 'فشل قراءة البيانات المرسلة. تأكد من أن الملف صحيح.' }, { status: 400 });
    }

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

    if (file.size === 0) {
      return NextResponse.json({ error: 'الملف فارغ، يرجى اختيار صورة صحيحة.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to Base64 Data URL — works on Vercel (read-only filesystem)
    const base64Data = buffer.toString('base64');
    const url = `data:${file.type};base64,${base64Data}`;

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('[UPLOAD ERROR]', err);
    return NextResponse.json({ error: `حدث خطأ أثناء رفع الصورة: ${err.message || 'حاول مرة أخرى'}` }, { status: 500 });
  }
}
