import React from 'react';
import { db } from '@/lib/db';
import { Gamepad2, Trophy, Users, AlertCircle } from 'lucide-react';

async function getGamesOverview() {
  const games = await db.game.findMany({
    include: {
      _count: { select: { scores: true } },
      scores: {
        orderBy: { score: 'desc' },
        take: 1,
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { name: 'asc' },
  });

  const distinctPlayers = await db.gameScore.findMany({
    select: { userId: true },
    distinct: ['userId'],
  });

  return { games, totalPlayers: distinctPlayers.length };
}

export default async function AdminGamesPage() {
  const { games, totalPlayers } = await getGamesOverview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brand-white flex items-center gap-2">
          <Gamepad2 size={22} className="text-brand-royal-light" /> الألعاب
        </h1>
        <p className="text-brand-silver-dim mt-1 text-sm">{games.length} لعبة منشورة · {totalPlayers} طالب لعب لعبة على الأقل</p>
      </div>

      <div className="bg-brand-royal/8 border border-brand-royal/20 rounded-xl p-4 text-xs text-brand-silver flex gap-2">
        <AlertCircle size={16} className="text-brand-royal-light shrink-0 mt-0.5" />
        <span>محتوى الألعاب (المستويات والتحديات) مبني داخل الكود مباشرة وليس من هنا، عشان تضمن دقة كل لعبة وتجربتها. هذي الصفحة لعرض الإحصائيات فقط. لإضافة لعبة جديدة أو تعديل مستويات لعبة موجودة، هذا شغل برمجي يحتاج جلسة تطوير.</span>
      </div>

      {games.length === 0 ? (
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-16 text-center">
          <p className="text-brand-silver-dim">لا توجد ألعاب بقاعدة البيانات بعد. شغّل ملف الـ seed لزرعها.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {games.map((game) => (
            <div key={game.id} className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-brand-white">{game.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-royal/15 text-brand-royal-light">{game.category}</span>
              </div>
              <p className="text-xs text-brand-silver-dim mb-4 line-clamp-2">{game.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-brand-silver">
                  <Users size={14} className="text-brand-royal-light" /> {game._count.scores} محاولة
                </span>
                {game.scores[0] && (
                  <span className="flex items-center gap-1.5 text-brand-silver">
                    <Trophy size={14} className="text-amber-400" /> {game.scores[0].user.name} ({game.scores[0].score})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
