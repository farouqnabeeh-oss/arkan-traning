import React from 'react';
import { db } from '@/lib/db';
import { Gamepad2, Trophy, Users, Zap, BarChart3, Star, Medal, Clock } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  HTML_CSS: 'HTML & CSS',
  JAVASCRIPT: 'JavaScript',
  PYTHON: 'Python',
  LOGIC: 'منطق',
  MEMORY: 'ذاكرة',
  TYPING: 'كتابة',
  PROBLEM_SOLVING: 'حل مشكلات',
};

const CATEGORY_COLORS: Record<string, string> = {
  HTML_CSS: 'bg-orange-500/15 text-orange-400',
  JAVASCRIPT: 'bg-yellow-500/15 text-yellow-400',
  PYTHON: 'bg-blue-500/15 text-blue-400',
  LOGIC: 'bg-purple-500/15 text-purple-400',
  MEMORY: 'bg-emerald-500/15 text-emerald-400',
  TYPING: 'bg-pink-500/15 text-pink-400',
  PROBLEM_SOLVING: 'bg-red-500/15 text-red-400',
};

async function getGamesOverview() {
  const [games, totalScores, distinctPlayers, topScores] = await Promise.all([
    db.game.findMany({
      include: {
        _count: { select: { scores: true, challenges: true } },
        scores: {
          orderBy: { score: 'desc' },
          take: 3,
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { name: 'asc' },
    }),
    db.gameScore.count(),
    db.gameScore.findMany({
      select: { userId: true },
      distinct: ['userId'],
    }),
    // Top 5 players across all games
    db.gameScore.groupBy({
      by: ['userId'],
      _sum: { score: true },
      _count: { id: true },
      orderBy: { _sum: { score: 'desc' } },
      take: 5,
    }),
  ]);

  // Fetch user details for top scorers
  const topPlayerIds = topScores.map((s) => s.userId);
  const topPlayerUsers = await db.user.findMany({
    where: { id: { in: topPlayerIds } },
    select: { id: true, name: true, email: true },
  });

  const topPlayers = topScores.map((ts) => ({
    ...ts,
    user: topPlayerUsers.find((u) => u.id === ts.userId),
  }));

  const avgScore = totalScores > 0
    ? Math.round(
        (await db.gameScore.aggregate({ _avg: { score: true } }))._avg.score || 0
      )
    : 0;

  return {
    games,
    totalPlayers: distinctPlayers.length,
    totalScores,
    topPlayers,
    avgScore,
  };
}

export default async function AdminGamesPage() {
  const { games, totalPlayers, totalScores, topPlayers, avgScore } = await getGamesOverview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brand-white flex items-center gap-2">
          <Gamepad2 size={22} className="text-brand-royal-light" /> الألعاب التعليمية
        </h1>
        <p className="text-brand-silver-dim mt-1 text-sm">
          إحصائيات شاملة عن أداء الطلاب في الألعاب
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الألعاب', value: games.length, icon: Gamepad2, color: 'text-brand-royal-light', bg: 'bg-brand-royal/10' },
          { label: 'لاعبون فريدون', value: totalPlayers, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'إجمالي المحاولات', value: totalScores, icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'متوسط النقاط', value: avgScore, icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-black text-brand-white">{value.toLocaleString()}</p>
            <p className="text-xs text-brand-silver-dim mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Games Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-brand-white flex items-center gap-2">
            <Gamepad2 size={18} className="text-brand-royal-light" /> تفاصيل كل لعبة
          </h2>
          {games.length === 0 ? (
            <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-16 text-center">
              <p className="text-brand-silver-dim">لا توجد ألعاب في قاعدة البيانات. شغّل ملف الـ seed لزرعها.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game) => {
                const scores = game.scores;
                const avgGameScore = scores.length > 0
                  ? Math.round(scores.reduce((s, gs) => s + gs.score, 0) / scores.length)
                  : 0;
                return (
                  <div key={game.id} className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-brand-white text-base">{game.name}</h3>
                        <p className="text-xs text-brand-silver-dim mt-0.5 line-clamp-2">{game.description}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ml-3 font-bold ${CATEGORY_COLORS[game.category] || 'bg-brand-royal/15 text-brand-royal-light'}`}>
                        {CATEGORY_LABELS[game.category] || game.category}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs mb-4">
                      <span className="flex items-center gap-1.5 text-brand-silver">
                        <Users size={12} className="text-brand-royal-light" />
                        <span>{game._count.scores} محاولة</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-brand-silver">
                        <Zap size={12} className="text-purple-400" />
                        <span>{game._count.challenges} تحدي</span>
                      </span>
                      {avgGameScore > 0 && (
                        <span className="flex items-center gap-1.5 text-brand-silver">
                          <Star size={12} className="text-amber-400" />
                          <span>متوسط {avgGameScore} نقطة</span>
                        </span>
                      )}
                    </div>

                    {/* Top Scores */}
                    {scores.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-brand-silver-dim font-bold uppercase tracking-wider">أعلى النتائج</p>
                        {scores.map((gs, idx) => (
                          <div key={gs.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black
                                ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : idx === 1 ? 'bg-slate-400/20 text-slate-400' : 'bg-orange-700/20 text-orange-700'}`}>
                                {idx + 1}
                              </span>
                              <span className="text-brand-silver">{gs.user.name}</span>
                            </div>
                            <span className="font-bold text-brand-white">{gs.score.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Players Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-brand-white flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" /> أفضل اللاعبين
          </h2>
          <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-5 space-y-4">
            {topPlayers.length === 0 ? (
              <p className="text-brand-silver-dim text-sm text-center py-4">لا توجد نتائج بعد.</p>
            ) : (
              topPlayers.map((tp, idx) => (
                <div key={tp.userId} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0
                    ${idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    idx === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                    idx === 2 ? 'bg-orange-600/20 text-orange-500 border border-orange-600/30' :
                    'bg-white/5 text-brand-silver border border-white/10'}`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-brand-white truncate">{tp.user?.name || 'مجهول'}</p>
                    <div className="flex items-center gap-3 text-[10px] text-brand-silver-dim mt-0.5">
                      <span className="flex items-center gap-1"><Star size={9} className="text-amber-400" />{(tp._sum.score || 0).toLocaleString()} نقطة</span>
                      <span className="flex items-center gap-1"><Clock size={9} />{tp._count.id} محاولة</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Info box */}
          <div className="bg-brand-royal/8 border border-brand-royal/20 rounded-xl p-4 text-xs text-brand-silver">
            <p className="font-bold text-brand-royal-light mb-1">ملاحظة للمطوّر</p>
            <p>محتوى الألعاب (المستويات والتحديات) مبني داخل الكود مباشرة. لإضافة لعبة جديدة يحتاج تطوير برمجي.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
