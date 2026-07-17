import { db } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Check, AlertTriangle, Ban, CreditCard, RefreshCw, Scale } from 'lucide-react';

async function getTermsContent() {
  try {
    return await db.pageContent.findUnique({ where: { slug: 'terms' } });
  } catch {
    return null;
  }
}

const defaultContent = [
  {
    title: 'الموافقة على الشروط',
    icon: Check,
    body: 'باستخدامك منصة أركان التعليمية، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا لم توافق على أي جزء منها، يرجى التوقف عن استخدام المنصة فوراً.',
  },
  {
    title: 'الحسابات والمسؤولية',
    icon: FileText,
    body: 'أنت وحدك المسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تحدث تحته. يجب أن تكون المعلومات المقدمة دقيقة ومحدثة.',
  },
  {
    title: 'الملكية الفكرية',
    icon: AlertTriangle,
    body: 'جميع الدورات والمحتوى التعليمي والألعاب البرمجية محمية بحقوق الملكية الفكرية. لا يجوز نسخ أو إعادة توزيع أو بيع أي محتوى دون إذن خطي مسبق.',
  },
  {
    title: 'القيود والسلوك',
    icon: Ban,
    body: 'يُحظر استخدام المنصة لأغراض غير قانونية، أو مشاركة محتوى مسيء، أو محاولة اختراق الأنظمة، أو التلاعب بلوحة الشرف بأي شكل من الأشكال.',
  },
  {
    title: 'الدفع والاسترداد',
    icon: CreditCard,
    body: 'يتم الدفع عبر التحويل البنكي المباشر أو المحافظ الإلكترونية المعتمدة (تظهر تفاصيلها بصفحة "تواصل معنا")، وتُفعَّل الدورة يدويًا من إدارة المنصة بعد التحقق من إثبات التحويل. يحق للطالب طلب استرداد المبلغ خلال 3 أيام من الشراء وقبل بدء مشاهدة أكثر من 20% من محتوى الدورة، ويُستثنى من ذلك القسائم والخصومات الترويجية.',
  },
  {
    title: 'الشهادات والتوثيق',
    icon: Check,
    body: 'تُصدر الشهادة تلقائيًا فور إتمام الطالب لجميع متطلبات الدورة، وتحمل رمز QR فريدًا للتحقق العام من صحتها. تحتفظ الإدارة بحق سحب أي شهادة صادرة بناءً على معلومات مضللة أو مخالفة لهذه الشروط.',
  },
  {
    title: 'القانون الحاكم',
    icon: Scale,
    body: 'تخضع هذه الشروط وتُفسَّر وفقًا للقوانين المعمول بها في فلسطين. أي نزاع ينشأ عن استخدام المنصة يُحال إلى الجهات القضائية المختصة.',
  },
  {
    title: 'التعديلات',
    icon: RefreshCw,
    body: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بالتغييرات الجوهرية عبر البريد الإلكتروني أو المنصة.',
  },
];

export default async function TermsPage() {
  const page = await getTermsContent();

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />

      {/* ── Cinematic Hero ── */}
      <section className="relative pt-32 pb-24 overflow-hidden flex items-center justify-center min-h-[40vh]">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,91,219,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-brand-royal/5 rounded-full blur-[90px] animate-float pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl glass-dark border border-brand-royal/20 mb-6 shadow-royal-glow animate-fade-in-up">
            <Scale className="w-10 h-10 text-brand-royal" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-tajawal font-black text-brand-white leading-tight animate-fade-in-up" style={{animationDelay:'100ms'}}>
            شروط <span className="shimmer-text">الاستخدام</span>
          </h1>
          
          <p className="text-lg text-brand-white/50 font-tajawal max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay:'200ms'}}>
            الإطار القانوني الذي يحكم استخدامك لمنصة أركان. يرجى قراءة هذه الشروط بعناية لضمان تجربة تعليمية آمنة للجميع.
          </p>
          
          <div className="mt-6 inline-flex items-center gap-2 glass-royal px-4 py-1.5 rounded-full text-brand-royal font-tajawal text-xs font-bold animate-fade-in-up" style={{animationDelay:'300ms'}}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            آخر تحديث: يوليو 2026
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-brand-dark to-transparent" />
      </section>

      {/* ── Content ── */}
      <main className="flex-grow py-12 relative z-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
          {page ? (
            <div className="glass-dark rounded-[2.5rem] border border-brand-royal/15 p-8 md:p-14 shadow-dark-xl">
              <div
                className="prose prose-invert prose-lg max-w-none font-tajawal text-brand-white/70 leading-loose
                           prose-headings:text-brand-white prose-headings:font-black prose-a:text-brand-royal prose-strong:text-brand-royal"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {defaultContent.map((section, i) => {
                const Icon = section.icon;
                return (
                  <div
                    key={i}
                    className="group relative glass-dark rounded-[2rem] border border-brand-royal/10 hover:border-brand-royal/30 p-8 transition-all duration-500 overflow-hidden hover:shadow-royal-glow-sm"
                  >
                    {/* Hover glow line */}
                    <div className="absolute top-0 right-0 w-1 h-full royal-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                      <div className="w-14 h-14 rounded-2xl glass-royal flex items-center justify-center flex-shrink-0 border border-brand-royal/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Icon className="w-6 h-6 text-brand-royal" />
                      </div>
                      <div className="pt-2">
                        <h2 className="text-xl font-tajawal font-black text-brand-white mb-4 group-hover:text-brand-royal transition-colors duration-300">
                          {String(i + 1).padStart(2, '0')}. {section.title}
                        </h2>
                        <p className="text-brand-white/60 font-tajawal leading-loose text-base">
                          {section.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
