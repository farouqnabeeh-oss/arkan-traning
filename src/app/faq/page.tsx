'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FaqAccordion from '@/components/FaqAccordion';
import Link from 'next/link';
import { HelpCircle, MessagesSquare, Search } from 'lucide-react';

const allFaqs = [
  {
    id: 'f-1',
    question: 'ما هي منصة أركان وكيف يمكنني الاستفادة منها؟',
    answer: 'أركان هي منصة تعليمية متخصصة في تدريس البرمجة باللغة العربية، تجمع بين الدروس الأكاديمية الاحترافية والألعاب البرمجية التفاعلية لترسيخ المفاهيم بشكل ممتع وعملي.',
  },
  {
    id: 'f-2',
    question: 'هل الدورات مناسبة للمبتدئين تماماً؟',
    answer: 'نعم، مساراتنا التعليمية تبدأ من الصفر (مثل دورة أساسيات الويب أو بايثون للمبتدئين) وتتدرج معك حتى الوصول لمستوى الاحتراف وبناء مشاريع كاملة.',
  },
  {
    id: 'f-3',
    question: 'كيف أدفع ثمن الدورة؟',
    answer: 'عبر التحويل البنكي أو المحافظ الإلكترونية المتاحة (جوال باي، بال باي وغيرها)، ثم إرسال إثبات التحويل لتفعيل الدورة يدويًا خلال وقت قصير.',
  },
  {
    id: 'f-4',
    question: 'هل أحصل على شهادة بعد إتمام الدورة؟',
    answer: 'نعم، عند اجتيازك لجميع الاختبارات وإتمامك لمتطلبات الدورة، تحصل على شهادة معتمدة برمز استجابة سريع (QR Code) يمكنك إضافتها لسيرتك الذاتية أو حسابك في لينكدإن.',
  },
  {
    id: 'f-5',
    question: 'كيف تعمل الألعاب البرمجية؟',
    answer: 'الألعاب البرمجية هي تحديات قصيرة تفاعلية، تطلب منك كتابة كود لحل لغز معين (مثل تحريك شخصية أو تصميم شكل). تساعدك هذه الألعاب على ممارسة البرمجة بشكل ممتع وجمع النقاط لتصدر لوحة الشرف.',
  },
  {
    id: 'f-6',
    question: 'هل يمكنني الوصول للدورات في أي وقت؟',
    answer: 'نعم، بمجرد اشتراكك في أي دورة، تحصل على وصول مدى الحياة لمحتواها وتحديثاتها المستقبلية دون أي رسوم إضافية.',
  },
  {
    id: 'f-7',
    question: 'ما هي طرق الدفع المتاحة للاشتراك؟',
    answer: 'ندعم كافة طرق الدفع الآمنة، بما في ذلك البطاقات الائتمانية (Visa, MasterCard)، مدى، Apple Pay، بالإضافة إلى التحويل البنكي المباشر في بعض الدول.',
  },
  {
    id: 'f-8',
    question: 'هل يمكنني استرداد أموالي إذا لم تناسبني الدورة؟',
    answer: 'نعم، نحن نقدم ضمان استرداد الأموال خلال 7 أيام من تاريخ الشراء، بشرط ألا تكون قد استهلكت أكثر من 10% من محتوى الدورة المرئية.',
  },
];

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = allFaqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />

      {/* ── Cinematic Hero ── */}
      <section className="relative pt-36 pb-20 overflow-hidden flex flex-col items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,91,219,0.12)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-brand-royal/5 rounded-full blur-[90px] animate-float pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl glass-dark border border-brand-royal/20 mb-6 shadow-royal-glow animate-fade-in-up">
            <HelpCircle className="w-10 h-10 text-brand-royal" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-tajawal font-black text-brand-white leading-tight animate-fade-in-up" style={{animationDelay:'100ms'}}>
            الأسئلة <span className="shimmer-text">الشائعة</span>
          </h1>
          
          <p className="text-lg md:text-xl text-brand-white/50 font-tajawal max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay:'200ms'}}>
            كل ما تود معرفته عن منصة أركان، الدورات، الألعاب البرمجية، والمساعد الذكي في مكان واحد.
          </p>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-brand-dark to-transparent" />
      </section>

      {/* ── Search & Filter ── */}
      <section className="relative z-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute inset-0 bg-brand-royal/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative glass-dark rounded-2xl border border-brand-white/10 flex items-center px-6 py-4 shadow-dark-xl">
            <Search className="w-6 h-6 text-brand-royal/60" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن سؤالك هنا..." 
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-brand-white font-tajawal px-4 placeholder:text-brand-white/30"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ Content ── */}
      <main className="flex-grow py-12 relative z-20 pb-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
          {filteredFaqs.length > 0 ? (
            <FaqAccordion faqs={filteredFaqs} />
          ) : (
            <div className="text-center text-brand-white/60 font-tajawal py-10">
              لا توجد أسئلة تطابق بحثك.
            </div>
          )}
          
          {/* Still have a question? */}
          <div className="mt-20 text-center glass-dark rounded-3xl border border-brand-royal/20 p-10 md:p-14 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-royal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <MessagesSquare className="w-12 h-12 text-brand-royal mx-auto mb-6" />
            <h3 className="text-2xl font-tajawal font-bold text-brand-white mb-4">لم تجد إجابة لسؤالك؟</h3>
            <p className="text-brand-white/50 font-tajawal mb-8 max-w-md mx-auto">فريق الدعم الفني متواجد للإجابة على جميع استفساراتك بشكل شخصي وسريع.</p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 royal-gradient text-brand-dark font-tajawal font-black px-10 py-4 rounded-xl shadow-royal-glow hover:scale-105 transition-transform"
            >
              تواصل معنا الآن
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
