import { db } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Database, Eye, Lock, Users, Mail } from 'lucide-react';

async function getPrivacyContent() {
  try {
    return await db.pageContent.findUnique({ where: { slug: 'privacy' } });
  } catch {
    return null;
  }
}

const defaultContent = [
  {
    title: 'مقدمة في الخصوصية',
    icon: Shield,
    body: 'مرحباً بك في منصة أركان. نحن نأخذ خصوصيتك على محمل الجد. تصف هذه السياسة المنهجية الصارمة التي نتبعها في كيفية جمع معلوماتك الشخصية واستخدامها وحمايتها في كل خطوة.',
  },
  {
    title: 'المعلومات التي نجمعها',
    icon: Database,
    body: 'نجمع فقط ما يلزم لتجربتك: البيانات الأساسية عند التسجيل (الاسم، البريد الإلكتروني)، إلى جانب نشاطك التفاعلي كالدورات، النقاط في الألعاب، ودرجات الاختبارات.',
  },
  {
    title: 'استخدام البيانات',
    icon: Eye,
    body: 'نستخدم بياناتك لتشغيل حسابك وتتبع تقدمك بدقة عبر الدورات والاختبارات، وتوفير تجربة ألعاب برمجية تنافسية، وإصدار شهاداتك الموثقة عند إتمام المتطلبات.',
  },
  {
    title: 'الأمان والتشفير',
    icon: Lock,
    body: 'حماية بياناتك أولوية قصوى. يتم حفظ كلمات المرور مشفّرة باستخدام خوارزمية Bcrypt، وتُنقل كافة البيانات عبر اتصال مشفّر.',
  },
  {
    title: 'مشاركة البيانات',
    icon: Users,
    body: 'نلتزم التزاماً كاملاً بعدم بيع أو تأجير معلوماتك الشخصية لأي جهات خارجية. قد نشارك إحصائيات عامة غير محددة الهوية لأغراض تطوير المنصة.',
  },
  {
    title: 'حقوقك وقنوات التواصل',
    icon: Mail,
    body: 'لديك الحق دائماً في طلب مراجعة بياناتك أو تعديلها من صفحة إعدادات حسابك، أو طلب حذف حسابك بالكامل عبر التواصل المباشر مع إدارة المنصة، وسيتم الرد على طلبك خلال أيام عمل قليلة.',
  },
];

export default async function PrivacyPage() {
  const page = await getPrivacyContent();

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />

      {/* ── Cinematic Hero ── */}
      <section className="relative pt-32 pb-24 overflow-hidden flex items-center justify-center min-h-[40vh]">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(59,130,246,0.06)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[90px] animate-float pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl glass-dark border border-brand-royal/20 mb-6 shadow-royal-glow animate-fade-in-up">
            <Shield className="w-10 h-10 text-brand-royal" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-tajawal font-black text-brand-white leading-tight animate-fade-in-up" style={{animationDelay:'100ms'}}>
            سياسة <span className="shimmer-text">الخصوصية</span>
          </h1>
          
          <p className="text-lg text-brand-white/50 font-tajawal max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay:'200ms'}}>
            بياناتك أمانة. تعرف على التزامنا بحماية معلوماتك الشخصية والمعايير الأمنية الصارمة المتبعة في خوادم أركان.
          </p>
          
          <div className="mt-6 inline-flex items-center gap-2 glass-royal px-4 py-1.5 rounded-full text-brand-royal font-tajawal text-xs font-bold animate-fade-in-up" style={{animationDelay:'300ms'}}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            تشفير متقدم من طرف إلى طرف
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {defaultContent.map((section, i) => {
                const Icon = section.icon;
                return (
                  <div
                    key={i}
                    className="group relative glass-dark rounded-[2rem] border border-brand-royal/10 hover:border-brand-royal/30 p-8 transition-all duration-500 overflow-hidden hover:-translate-y-2 hover:shadow-royal-glow-sm"
                  >
                    {/* Hover glow background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-royal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]" />
                    
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl glass-royal flex items-center justify-center border border-brand-royal/20 shadow-inner group-hover:scale-110 transition-transform duration-500 mb-6">
                        <Icon className="w-5 h-5 text-brand-royal" />
                      </div>
                      <h2 className="text-xl font-tajawal font-black text-brand-white mb-4 group-hover:text-brand-royal transition-colors duration-300">
                        {section.title}
                      </h2>
                      <p className="text-brand-white/50 font-tajawal leading-relaxed text-sm">
                        {section.body}
                      </p>
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
