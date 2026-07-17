import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Gamepad2, Trophy, History, Play, Lock, Star, Sparkles, Medal, Zap, Target, Flame } from 'lucide-react';

async function getGamesData(userId?: string) {
  try {
    const games = await db.game.findMany();
    
    const leaderboard = await db.gameScore.findMany({
      include: {
        user: { select: { name: true } },
        game: { select: { name: true, slug: true } },
      },
      orderBy: { score: 'desc' },
      take: 10,
    });

    let personalHistory: any[] = [];
    if (userId) {
      personalHistory = await db.gameScore.findMany({
        where: { userId },
        include: { game: { select: { name: true } } },
        orderBy: { completedAt: 'desc' },
        take: 5,
      });
    }

    return { games, leaderboard, personalHistory };
  } catch (err) {
    const fallbackGames = [
      { slug: 'flexbox-defender', name: 'حامي Flexbox', category: 'HTML_CSS', description: 'تحكّم في تخطيط العناصر لحماية القاعدة من الهجمات باستخدام CSS Flexbox.' },
      { slug: 'css-battle', name: 'معركة CSS', category: 'HTML_CSS', description: 'طابق التصميم المستهدف بأقل كود ممكن من HTML/CSS.' },
      { slug: 'python-snake', name: 'ثعبان بايثون', category: 'PYTHON', description: 'اكتب أوامر بايثون للتحكم في الثعبان وتناول الطعام وتجنب العقبات.' },
      { slug: 'rps-ai', name: 'حجر ورقة مقص AI', category: 'PYTHON', description: 'نفّذ منطق اللعبة واهزم ذكاءً اصطناعياً يتعلم من حركاتك مسبقاً.' },
      { slug: 'tic-tac-toe', name: 'اكس او (Tic-Tac-Toe)', category: 'JAVASCRIPT', description: 'لعبة كلاسيكية مع إمكانية التراجع وخوارزمية ذكية لمنافستك.' },
      { slug: 'memory-card', name: 'لعبة الذاكرة', category: 'JAVASCRIPT', description: 'طابق البطاقات المتشابهة في أسرع وقت واختبر مهارتك في مصفوفات جافا سكريبت.' },
      { slug: 'code-typer', name: 'مُدرّب الكتابة', category: 'TYPING', description: 'اكتب مقتطفات برمجية بأسرع وقت ممكن وبأقل نسبة خطأ.' },
      { slug: 'algorithm-puzzle', name: 'أحجية الخوارزميات', category: 'PROBLEM_SOLVING', description: 'رتّب خطوات الخوارزمية لتخطي حالات الاختبار وحل المشكلة البرمجية.' },
      { slug: 'regex-hunter', name: 'صياد الأنماط Regex', category: 'PROBLEM_SOLVING', description: 'اكتب تعبيرًا نمطيًا صحيحًا يطابق كل الأمثلة المطلوبة قبل نفاد الوقت.' },
      { slug: 'sql-duel', name: 'مبارزة SQL', category: 'PROBLEM_SOLVING', description: 'اختر الاستعلام الصحيح لتحقيق النتيجة المطلوبة ضد عداد زمني.' },
      { slug: 'git-race', name: 'سباق Git', category: 'PROBLEM_SOLVING', description: 'رتّب أوامر Git الصحيحة لحل سيناريو حقيقي بأسرع وقت.' },
      { slug: 'debugging-detective', name: 'محقق الأخطاء', category: 'JAVASCRIPT', description: 'اكتشف السطر المسبب للخطأ بمقتطف كود جافا سكريبت قبل نفاد الوقت.' },
    ];

    return { games: fallbackGames, leaderboard: [], personalHistory: [], dbError: true };
  }
}

export default async function GamesHubPage() {
  const user = await getSessionUser();
  const { games, leaderboard, personalHistory } = await getGamesData(user?.id);

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'HTML_CSS': return 'HTML & CSS';
      case 'JAVASCRIPT': return 'جافا سكريبت';
      case 'PYTHON': return 'بايثون';
      case 'TYPING': return 'سرعة الكتابة';
      case 'PROBLEM_SOLVING': return 'حل المشكلات';
      default: return 'برمجة عامة';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Navbar />
      
      {/* Cinematic Hero */}
      <section className="relative pt-32 pb-24 flex items-center justify-center overflow-hidden">
        {/* Deep immersive backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,91,219,0.12)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,91,219,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,91,219,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        {/* Floating game elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-royal/5 rounded-full blur-[100px] animate-float pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-[80px] animate-float-rev pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 glass-royal px-5 py-2 rounded-full text-brand-royal text-sm font-tajawal font-bold shadow-royal-glow-sm mx-auto animate-fade-in-up">
            <Flame className="w-4 h-4 text-orange-400" />
            منطقة التحديات والمنافسة
          </div>
          
          <h1 className="text-5xl md:text-7xl font-tajawal font-black text-brand-white leading-tight animate-fade-in-up" style={{animationDelay:'100ms'}}>
            ارفع مستواك في <br />
            <span className="shimmer-text">الألعاب البرمجية</span>
          </h1>
          
          <p className="text-xl text-brand-white/60 font-tajawal max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay:'200ms'}}>
            ميدان التحدي الأول. اختبر مهاراتك عبر كتابة الأكواد الحية، تجاوز المستويات، واحتل صدارة لوحة الشرف لتثبت جدارتك.
          </p>
          
          <div className="flex justify-center gap-6 pt-6 animate-fade-in-up" style={{animationDelay:'300ms'}}>
            <div className="flex items-center gap-2 text-brand-white/40 font-tajawal text-sm">
              <Gamepad2 className="w-4 h-4 text-brand-royal" />
              {games.length} ألعاب
            </div>
            <div className="flex items-center gap-2 text-brand-white/40 font-tajawal text-sm">
              <Trophy className="w-4 h-4 text-brand-royal" />
              تحديات يومية
            </div>
          </div>
        </div>
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-brand-dark to-transparent" />
      </section>

      <main className="flex-grow py-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-right">
            
            {/* ── Games Grid ── */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center gap-4 border-b border-brand-white/5 pb-6">
                <div className="w-12 h-12 rounded-xl royal-gradient flex items-center justify-center shadow-royal-glow-sm">
                  <Gamepad2 className="w-6 h-6 text-brand-dark" />
                </div>
                <h2 className="text-3xl font-tajawal font-black text-brand-white">
                  المكتبة <span className="text-brand-royal">التفاعلية</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {games.map((game, i) => (
                  <div
                    key={game.slug}
                    className="group glass-dark rounded-[2rem] border border-brand-royal/15 overflow-hidden flex flex-col justify-between h-full hover:border-brand-royal/40 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-royal-glow relative"
                  >
                    {/* Inner glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-royal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />

                    <div className="p-8 space-y-6 relative z-10">
                      <div className="flex justify-between items-start">
                        <span className="inline-block glass-royal border border-brand-royal/30 text-brand-royal font-tajawal text-xs px-4 py-1.5 rounded-full font-bold">
                          {getCategoryName(game.category)}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-brand-white/5 flex items-center justify-center group-hover:bg-brand-royal/10 transition-colors">
                          <Zap className="w-4 h-4 text-brand-royal opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-tajawal font-bold text-brand-white group-hover:text-brand-royal transition-colors duration-300 mb-3">
                          {game.name}
                        </h3>
                        <p className="text-brand-white/50 font-tajawal text-sm leading-relaxed line-clamp-3">
                          {game.description}
                        </p>
                      </div>
                      
                      {/* Fake Progress / Level Info */}
                      <div className="pt-2 flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] font-tajawal text-brand-white/40">
                          <span>المستوى التقدمي</span>
                          <span className="text-brand-royal">LVL 1</span>
                        </div>
                        <div className="h-1.5 w-full bg-brand-white/5 rounded-full overflow-hidden flex">
                          <div className="h-full bg-brand-royal w-1/4 shadow-[0_0_10px_#3B5BDB]" />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 pt-0 flex justify-end mt-2 relative z-10">
                      <Link
                        href={`/games/${game.slug}`}
                        className="group/btn flex items-center gap-2 royal-gradient text-brand-dark hover:shadow-royal-glow-sm text-sm font-tajawal font-bold px-8 py-3.5 rounded-xl transition-all duration-300"
                      >
                        <Play className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
                        ابدأ اللعب
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Sidebar (Leaderboard & History) ── */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Leaderboard Card */}
              <div className="glass-dark border border-brand-royal/20 p-8 rounded-[2rem] shadow-dark-xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 royal-gradient opacity-80" />
                <h3 className="text-2xl font-tajawal font-black text-brand-white flex items-center gap-3 border-b border-brand-white/5 pb-5 mb-6">
                  <div className="w-10 h-10 rounded-full glass-royal flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-brand-royal" />
                  </div>
                  لوحة الشرف
                </h3>

                <div className="space-y-4">
                  {leaderboard.map((score, index) => (
                    <div key={index} className="flex justify-between items-center bg-brand-white/5 p-4 rounded-2xl border border-brand-white/5 hover:border-brand-royal/20 hover:bg-brand-royal/5 transition-all group">
                      <div className="text-left font-inter">
                        <span className="text-brand-royal font-black text-lg block group-hover:text-glow-royal transition-all">{score.score}</span>
                        <span className="text-[10px] text-brand-white/30 tracking-widest">PTS</span>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <span className="font-bold text-brand-white font-tajawal text-sm block">{score.user.name}</span>
                          <span className="text-[11px] text-brand-white/40 font-tajawal">{score.game.name}</span>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg font-inter shadow-inner border ${
                          index === 0 ? 'bg-brand-royal/20 text-brand-royal border-brand-royal shadow-[0_0_15px_rgba(59,91,219,0.3)]' : 
                          index === 1 ? 'bg-gray-400/20 text-gray-300 border-gray-400/50' : 
                          index === 2 ? 'bg-amber-700/20 text-amber-600 border-amber-700/50' : 
                          'bg-brand-dark text-brand-white/30 border-brand-white/10'
                        }`}>
                          {index === 0 ? <Medal className="w-5 h-5" /> : index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Score History */}
              {user ? (
                <div className="glass-dark border border-brand-royal/15 p-8 rounded-[2rem] shadow-dark-xl">
                  <h3 className="text-xl font-tajawal font-black text-brand-white flex items-center gap-3 border-b border-brand-white/5 pb-5 mb-6">
                    <div className="w-10 h-10 rounded-full bg-brand-white/5 flex items-center justify-center">
                      <History className="w-5 h-5 text-brand-royal" />
                    </div>
                    سجل التحديات
                  </h3>

                  {personalHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-brand-white/10 mx-auto mb-3" />
                      <p className="text-brand-white/40 text-sm font-tajawal">
                        لم تبدأ اللعب بعد.<br/>اختر لعبة لتسجيل نقاطك الأولى!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {personalHistory.map((score) => (
                        <div key={score.id} className="flex justify-between items-center text-sm bg-brand-white/5 p-4 rounded-2xl border border-brand-white/5">
                          <span className="text-brand-royal font-bold font-inter text-lg">+{score.score}</span>
                          <div className="text-right">
                            <span className="font-bold text-brand-white font-tajawal block mb-1">{score.game.name}</span>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-brand-dark font-tajawal text-brand-white/50 border border-brand-white/10">مستوى {score.level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-dark border border-brand-royal/15 p-8 rounded-[2rem] shadow-dark-xl text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-royal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-brand-dark border border-brand-white/10 flex items-center justify-center mx-auto mb-5 shadow-inner">
                      <Lock className="w-6 h-6 text-brand-royal/50" />
                    </div>
                    <h3 className="text-lg font-tajawal font-bold text-brand-white mb-2">سجل الدخول لحفظ تقدمك</h3>
                    <p className="text-sm font-tajawal text-brand-white/40 mb-6 leading-relaxed">
                      لنتمكن من إدراج اسمك في لوحة الشرف وحفظ مستوياتك التي أنجزتها.
                    </p>
                    <Link href="/login" className="block w-full royal-gradient text-brand-dark font-tajawal font-black px-4 py-3.5 rounded-xl transition-all shadow-royal-glow-sm hover:scale-105">
                      تسجيل الدخول
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
