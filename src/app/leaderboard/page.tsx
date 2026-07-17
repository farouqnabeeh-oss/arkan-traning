import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Trophy, Crown, Medal, Flame, Zap } from "lucide-react";
import { fallbackLeaderboard } from "@/lib/fallbackData";

async function getLeaderboard() {
  try {
    return await db.user.findMany({
      where: { role: "STUDENT", xp: { gt: 0 } },
      orderBy: { xp: "desc" },
      take: 50,
      select: { id: true, name: true, xp: true, streak: true },
    });
  } catch {
    return fallbackLeaderboard;
  }
}

const RANK_STYLES = [
  {
    bg: "bg-amber-400/15",
    border: "border-amber-400/40",
    text: "text-amber-400",
    icon: Crown,
  },
  {
    bg: "bg-slate-300/15",
    border: "border-slate-300/40",
    text: "text-slate-300",
    icon: Medal,
  },
  {
    bg: "bg-orange-400/15",
    border: "border-orange-400/40",
    text: "text-orange-400",
    icon: Medal,
  },
];

export default async function LeaderboardPage() {
  const [students, sessionUser] = await Promise.all([
    getLeaderboard(),
    getSessionUser(),
  ]);
  const myRank = sessionUser
    ? students.findIndex((s) => s.id === sessionUser.id)
    : -1;

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Navbar />

      <section className="relative pt-36 pb-16 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 glass-royal px-5 py-2 rounded-full text-brand-royal text-sm font-tajawal font-bold mx-auto">
            <Trophy className="w-4 h-4" /> أفضل 50 طالب
          </div>
          <h1 className="text-4xl md:text-6xl font-tajawal font-black text-brand-white">
            لوحة <span className="shimmer-text">الشرف</span>
          </h1>
          <p className="text-lg text-brand-white/60 font-tajawal max-w-2xl mx-auto">
            الترتيب حسب نقاط الخبرة (XP) المكتسبة من الدروس والألعاب والمساهمات
            المجتمعية.
          </p>
        </div>
      </section>

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full">
        {myRank >= 3 && sessionUser && (
          <div className="glass-royal border border-brand-royal/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <span className="text-sm font-tajawal text-brand-white">
              ترتيبك الحالي
            </span>
            <span className="text-lg font-tajawal font-black text-brand-royal-light">
              #{myRank + 1}
            </span>
          </div>
        )}

        {students.length === 0 ? (
          <div className="text-center py-24">
            <Trophy className="w-12 h-12 text-brand-white/20 mx-auto mb-4" />
            <p className="text-brand-white/50 font-tajawal">
              لسه ما فيه نقاط مسجّلة، كن أول من يتصدّر اللوحة!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((s, i) => {
              const isMe = sessionUser?.id === s.id;
              const style = RANK_STYLES[i];
              const Icon = style?.icon;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                    isMe
                      ? "bg-brand-royal/10 border-brand-royal/40"
                      : style
                        ? `${style.bg} ${style.border}`
                        : "bg-white/5 border-white/5"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-tajawal font-black text-sm shrink-0 ${style ? `${style.bg} ${style.text}` : "bg-white/10 text-brand-white/50"}`}
                  >
                    {Icon ? <Icon size={16} /> : i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-tajawal font-bold truncate ${isMe ? "text-brand-royal-light" : "text-brand-white"}`}
                    >
                      {s.name}{" "}
                      {isMe && (
                        <span className="text-xs text-brand-white/40">
                          (أنت)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.streak > 0 && (
                      <span className="flex items-center gap-1 text-xs text-orange-400 font-tajawal">
                        <Flame size={13} /> {s.streak}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-sm text-brand-royal-light font-tajawal font-black">
                      <Zap size={14} /> {s.xp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
