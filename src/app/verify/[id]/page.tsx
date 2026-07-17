import React from 'react';
import { db } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, XCircle, Calendar, User, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Props {
  params: {
    id: string;
  };
}

export default async function VerifyCertificatePage({ params }: Props) {
  const certificate = await db.certificate.findUnique({
    where: { verificationId: params.id },
    include: {
      user: true,
      course: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-tajawal">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          
          {certificate ? (
            <>
              <div className="bg-green-500 p-8 flex flex-col items-center justify-center text-white text-center">
                <CheckCircle className="w-20 h-20 mb-4 animate-bounce" />
                <h1 className="text-3xl font-bold mb-2">شهادة معتمدة وصالحة</h1>
                <p className="text-green-100">تم التحقق من صحة هذه الشهادة في سجلات منصة أركان.</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-navy">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold">اسم المتدرب</p>
                    <p className="text-xl font-bold text-brand-navy">{certificate.user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-royal">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold">الدورة التدريبية</p>
                    <p className="text-xl font-bold text-brand-navy">{certificate.course.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-navy">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold">تاريخ الإصدار</p>
                    <p className="text-xl font-bold text-brand-navy" dir="ltr">{format(certificate.createdAt, 'PPpp')}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm text-gray-400 font-mono mb-6">Verification ID: {certificate.verificationId}</p>
                  
                  <Link href={`/certificates/${certificate.verificationId}`} className="inline-flex items-center justify-center w-full px-6 py-4 bg-brand-navy hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-lg shadow-brand-navy/20 gap-2">
                    عرض الشهادة الأصلية
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-red-500 p-8 flex flex-col items-center justify-center text-white text-center">
                <XCircle className="w-20 h-20 mb-4" />
                <h1 className="text-3xl font-bold mb-2">شهادة غير صالحة</h1>
                <p className="text-red-100">لم يتم العثور على شهادة بهذا المعرف في سجلاتنا.</p>
              </div>
              <div className="p-8 text-center">
                <p className="text-gray-600 mb-8">يرجى التأكد من الرابط أو مسح رمز الاستجابة السريعة (QR Code) بشكل صحيح.</p>
                <Link href="/" className="inline-flex px-6 py-3 bg-brand-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                  العودة للرئيسية
                </Link>
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
