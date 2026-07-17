import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import Link from 'next/link';
import { Download, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CertificateRenderer, { CertElement } from '@/components/CertificateRenderer';

interface Props {
  params: { id: string };
}

const DEFAULT_ELEMENTS: CertElement[] = [
  { id: 'e1', type: 'text', content: 'منصة أركان التعليمية تشهد بأن', x: 10, y: 30, width: 80, fontSize: 18, color: '#C7D0DE', fontWeight: 'normal', textAlign: 'center' },
  { id: 'e2', type: 'variable', variable: 'STUDENT_NAME', x: 10, y: 38, width: 80, fontSize: 42, color: '#F2F5FA', fontWeight: 'bold', textAlign: 'center' },
  { id: 'e3', type: 'text', content: 'قد أتم بنجاح متطلبات دورة', x: 10, y: 50, width: 80, fontSize: 16, color: '#C7D0DE', fontWeight: 'normal', textAlign: 'center' },
  { id: 'e4', type: 'variable', variable: 'COURSE_TITLE', x: 10, y: 56, width: 80, fontSize: 26, color: '#7C93F0', fontWeight: 'bold', textAlign: 'center' },
  { id: 'e5', type: 'divider', x: 30, y: 68, width: 40, fontSize: 0, color: '#3B5BDB', fontWeight: 'normal', textAlign: 'center' },
  { id: 'e6', type: 'variable', variable: 'DATE', x: 10, y: 78, width: 35, fontSize: 12, color: '#77839A', fontWeight: 'normal', textAlign: 'right' },
  { id: 'e7', type: 'variable', variable: 'VERIFICATION_ID', x: 55, y: 78, width: 35, fontSize: 12, color: '#77839A', fontWeight: 'normal', textAlign: 'left' },
];

export default async function CertificatePage({ params }: Props) {
  const certificate = await db.certificate.findUnique({
    where: { verificationId: params.id },
    include: { user: true, course: true },
  });

  if (!certificate) notFound();

  const [courseTemplate, defaultTemplate] = await Promise.all([
    db.certificateTemplate.findUnique({ where: { courseId: certificate.courseId } }),
    db.certificateTemplate.findFirst({ where: { isDefault: true } }),
  ]);
  const template = courseTemplate || defaultTemplate;
  const elements: CertElement[] = (template?.elements as any) || DEFAULT_ELEMENTS;
  const backgroundColor = template?.backgroundColor || '#0F1830';

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://arkan.edu'}/verify/${certificate.verificationId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    color: { dark: '#070B14', light: '#ffffff' },
    width: 150,
  });

  const variables = {
    STUDENT_NAME: certificate.user.name,
    COURSE_TITLE: certificate.course.title,
    DATE: new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }).format(certificate.createdAt),
    VERIFICATION_ID: certificate.verificationId,
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col font-tajawal">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 pt-32 pb-16 flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-white mb-4">شهادة إتمام دورة</h1>
          <p className="text-brand-white/50">هذه الشهادة تثبت إتمام المتدرب للدورة بنجاح واجتيازه الامتحان المطلوب.</p>
        </div>

        <div className="flex gap-4 mb-8 w-full max-w-4xl justify-end flex-wrap">
          <button className="flex items-center gap-2 px-6 py-2 bg-brand-royal hover:opacity-90 text-white rounded-lg font-bold transition-opacity">
            <Download className="w-5 h-5" />
            تحميل PDF
          </button>
          <Link href={`/verify/${certificate.verificationId}`} className="flex items-center gap-2 px-6 py-2 glass-dark border border-brand-royal/30 text-brand-white hover:bg-brand-royal/10 rounded-lg font-bold transition-colors">
            <CheckCircle className="w-5 h-5" />
            صفحة التحقق
          </Link>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2 bg-[#0A66C2] hover:opacity-90 text-white rounded-lg font-bold transition-opacity"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z" /></svg>
            شارك على LinkedIn
          </a>
        </div>

        <div className="w-full max-w-4xl relative">
          <CertificateRenderer elements={elements} backgroundColor={backgroundColor} variables={variables} sealImage={template?.sealImage} width={1000} height={700} className="!w-full !h-auto" />
          <div className="absolute bottom-[6%] left-[8%] flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeDataUrl} alt="رمز التحقق" className="w-16 sm:w-20 rounded-lg border border-white/10 p-1 bg-white" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
