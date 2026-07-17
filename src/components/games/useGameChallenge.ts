'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseGameChallengeOptions {
  timeLimitSeconds: number;
  hints: string[];
  hintPenalty?: number; // % خصم من النقاط لكل تلميح، افتراضي 15%
  onTimeUp?: () => void;
}

export function useGameChallenge({ timeLimitSeconds, hints, hintPenalty = 15, onTimeUp }: UseGameChallengeOptions) {
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          onTimeUp?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, onTimeUp]);

  const start = useCallback(() => {
    setTimeLeft(timeLimitSeconds);
    setHintsRevealed(0);
    setStartedAt(Date.now());
    setIsRunning(true);
  }, [timeLimitSeconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const revealNextHint = useCallback(() => {
    if (hintsRevealed < hints.length) setHintsRevealed((h) => h + 1);
  }, [hintsRevealed, hints.length]);

  const computeScore = useCallback((baseScore: number) => {
    const penalty = Math.min(90, hintsRevealed * hintPenalty);
    const timeBonus = timeLeft > timeLimitSeconds / 2 ? 1.1 : 1;
    return Math.max(0, Math.round(baseScore * (1 - penalty / 100) * timeBonus));
  }, [hintsRevealed, hintPenalty, timeLeft, timeLimitSeconds]);

  const timeTakenSecs = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;

  return {
    timeLeft, isRunning, hintsRevealed, start, stop, revealNextHint, computeScore,
    timeTakenSecs, activeHints: hints.slice(0, hintsRevealed), hasMoreHints: hintsRevealed < hints.length,
  };
}
