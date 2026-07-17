import React, { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-royal/30 rounded-full blur-[100px] transform -translate-x-1/2 -translate-y-1/2" />
           <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-navy/30 rounded-full blur-[100px] transform translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="glass-dark border border-brand-royal/20 rounded-3xl shadow-2xl p-8 md:p-10">
            <Suspense fallback={<div className="text-center text-brand-royal py-10 font-tajawal">جاري تحميل الصفحة...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
