import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const dynamic = 'force-dynamic';


export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const purchase = await db.bookPurchase.findUnique({
    where: { id: params.id },
    include: { book: true, user: true },
  });

  if (!purchase) return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 });
  if (purchase.userId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح لك بعرض هذا الإيصال.' }, { status: 403 });
  }
  if (purchase.status !== 'APPROVED') {
    return NextResponse.json({ error: 'الإيصال متاح فقط للطلبات المقبولة.' }, { status: 400 });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([500, 650]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const royal = rgb(0.23, 0.36, 0.86);
  const dark = rgb(0.03, 0.04, 0.08);
  const gray = rgb(0.47, 0.52, 0.6);

  page.drawRectangle({ x: 0, y: 600, width: 500, height: 50, color: dark });
  page.drawText('ARKAN', { x: 30, y: 618, size: 22, font: boldFont, color: royal });
  page.drawText('Payment Receipt / إيصال دفع', { x: 30, y: 570, size: 16, font: boldFont, color: dark });

  const lines: [string, string][] = [
    ['Receipt ID', purchase.id],
    ['Date', new Date(purchase.reviewedAt || purchase.createdAt).toLocaleDateString('en-GB')],
    ['Customer', purchase.user.name],
    ['Email', purchase.user.email],
    ['Item', purchase.book.title],
    ['Original Price', `${purchase.originalPrice} ILS`],
    ['Discount', `${purchase.discountPercent}%`],
    ['Total Paid', `${purchase.finalPrice} ILS`],
  ];

  let y = 530;
  for (const [label, value] of lines) {
    page.drawText(label, { x: 30, y, size: 11, font, color: gray });
    page.drawText(String(value), { x: 220, y, size: 11, font: boldFont, color: dark });
    y -= 28;
  }

  page.drawLine({ start: { x: 30, y: y - 10 }, end: { x: 470, y: y - 10 }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
  page.drawText('Thank you for learning with ARKAN Platform.', { x: 30, y: y - 35, size: 10, font, color: gray });
  page.drawText('This is a computer-generated receipt.', { x: 30, y: y - 50, size: 9, font, color: gray });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="arkan-receipt-${purchase.id}.pdf"`,
    },
  });
}
