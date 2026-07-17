"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, RotateCcw, Play, Bot, Lock, CheckCircle2 } from 'lucide-react';

interface Props {
  user: any;
  gameSlug: string;
}

type Player = 'X' | 'O' | null;
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const LEVELS: { key: Difficulty; label: string; desc: string; scorePerWin: number }[] = [
  { key: 'EASY', label: 'المستوى 1: سهل', desc: 'الخصم يلعب عشوائيًا', scorePerWin: 40 },
  { key: 'MEDIUM', label: 'المستوى 2: متوسط', desc: 'الخصم بيحاول يمنعك من الفوز', scorePerWin: 70 },
  { key: 'HARD', label: 'المستوى 3: صعب', desc: 'خصم شبه مستحيل تهزمه (Minimax)', scorePerWin: 120 },
];

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function calculateWinner(squares: Player[]): Player | 'Draw' | null {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
  }
  if (!squares.includes(null)) return 'Draw';
  return null;
}

function minimax(squares: Player[], isMaximizing: boolean): number {
  const result = calculateWinner(squares);
  if (result === 'O') return 10;
  if (result === 'X') return -10;
  if (result === 'Draw') return 0;

  const scores: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      const next = [...squares];
      next[i] = isMaximizing ? 'O' : 'X';
      scores.push(minimax(next, !isMaximizing));
    }
  }
  return isMaximizing ? Math.max(...scores) : Math.min(...scores);
}

function getAiMove(squares: Player[], difficulty: Difficulty): number {
  const empty = squares.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);

  if (difficulty === 'EASY') {
    return empty[Math.floor(Math.random() * empty.length)];
  }

  if (difficulty === 'MEDIUM') {
    // يحاول يفوز، وإلا يمنع فوز اللاعب، وإلا عشوائي
    for (const i of empty) {
      const t = [...squares]; t[i] = 'O';
      if (calculateWinner(t) === 'O') return i;
    }
    for (const i of empty) {
      const t = [...squares]; t[i] = 'X';
      if (calculateWinner(t) === 'X') return i;
    }
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // HARD: Minimax كامل
  let bestScore = -Infinity;
  let bestMove = empty[0];
  for (const i of empty) {
    const t = [...squares]; t[i] = 'O';
    const s = minimax(t, false);
    if (s > bestScore) { bestScore = s; bestMove = i; }
  }
  return bestMove;
}

export default function TicTacToe({ user, gameSlug }: Props) {
  const [levelIndex, setLevelIndex] = useState<number | null>(null);
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState(1);

  const level = levelIndex !== null ? LEVELS[levelIndex] : null;
  const roundOver = wins >= 2 || losses >= 2; // أفضل من 3 جولات

  const submitScore = useCallback(async (finalScore: number, lvl: number) => {
    if (!user) return;
    try {
      await fetch('/api/games/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameSlug, score: finalScore, level: lvl + 1 }),
      });
    } catch (error) {
      console.error('Failed to submit score', error);
    }
  }, [user, gameSlug]);

  useEffect(() => {
    if (!winner || !level) return;
    if (winner === 'X') {
      setTotalScore((s) => s + level.scorePerWin);
      setWins((w) => w + 1);
    } else if (winner === 'O') {
      setLosses((l) => l + 1);
    }
  }, [winner]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (winner || !board.includes('O' as any)) {
      // دور الذكاء الاصطناعي
    }
  }, [board]);

  function handleClick(i: number) {
    if (board[i] || winner || roundOver) return;
    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result) { setWinner(result); return; }

    // دور الذكاء الاصطناعي بعد لحظة بسيطة
    setTimeout(() => {
      const aiMove = getAiMove(newBoard, level!.key);
      const afterAi = [...newBoard];
      afterAi[aiMove] = 'O';
      setBoard(afterAi);
      const aiResult = calculateWinner(afterAi);
      if (aiResult) setWinner(aiResult);
    }, 400);
  }

  function nextRound() {
    setBoard(Array(9).fill(null));
    setWinner(null);
  }

  function finishLevel() {
    if (levelIndex === null) return;
    if (wins >= 2) {
      submitScore(totalScore, levelIndex);
      setUnlockedLevels((u) => Math.max(u, levelIndex + 2));
    }
    setLevelIndex(null);
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWins(0);
    setLosses(0);
  }

  function startLevel(idx: number) {
    setLevelIndex(idx);
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWins(0);
    setLosses(0);
    setTotalScore(0);
  }

  if (levelIndex === null) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl" dir="rtl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-navy mb-3">اكس أو ضد الذكاء الاصطناعي</h1>
          <p className="text-gray-600">اختر المستوى — كل مستوى فيه ذكاء اصطناعي أقوى من اللي قبله.</p>
        </div>
        <div className="space-y-4">
          {LEVELS.map((l, i) => {
            const locked = i + 1 > unlockedLevels;
            return (
              <button
                key={l.key}
                onClick={() => !locked && startLevel(i)}
                disabled={locked}
                className={`w-full text-right p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  locked ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' : 'bg-white border-brand-royal/20 hover:border-brand-royal shadow-sm hover:shadow-lg'
                }`}
              >
                <div>
                  <p className="font-black text-brand-navy text-lg">{l.label}</p>
                  <p className="text-sm text-gray-500">{l.desc}</p>
                </div>
                {locked ? <Lock className="text-gray-400" size={22} /> : <Bot className="text-brand-royal" size={26} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl" dir="rtl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">{level!.label}</h1>
        <p className="text-gray-600">أفضل من 3 جولات — إنت X، الذكاء الاصطناعي O</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-brand-royal/20 flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-8 px-4">
          <div className="text-xl font-bold text-brand-navy">
            فوز: <span className="text-emerald-600">{wins}</span> / خسارة: <span className="text-red-500">{losses}</span>
          </div>
          <div className="text-xl font-bold text-brand-royal">{totalScore} نقطة</div>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-slate-200 p-3 rounded-2xl">
          {board.map((cell, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-sm flex items-center justify-center text-5xl md:text-7xl font-black transition-all hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-brand-royal/30"
            >
              <span className={cell === 'X' ? 'text-brand-navy' : 'text-brand-royal'}>{cell}</span>
            </button>
          ))}
        </div>

        {winner && !roundOver && (
          <button onClick={nextRound} className="mt-8 px-8 py-3 bg-brand-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
            الجولة التالية <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {roundOver && (
          <div className="mt-8 text-center space-y-4">
            {wins >= 2 ? (
              <div className="flex items-center gap-2 text-emerald-600 font-black text-xl justify-center">
                <Trophy /> فزت بالمستوى!
              </div>
            ) : (
              <p className="text-red-500 font-bold">خسرت هالمرة، جرّب تاني</p>
            )}
            <button onClick={finishLevel} className="px-8 py-3 bg-brand-royal text-white rounded-xl font-bold hover:bg-brand-navy transition-colors flex items-center gap-2 mx-auto">
              <Play className="w-5 h-5" /> رجوع لقائمة المستويات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
