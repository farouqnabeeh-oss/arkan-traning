'use client';

import React, { useState, useEffect, useRef } from 'react';

interface StatItem {
  label: string;
  target: number;
  suffix: string;
  prefix?: string;
  icon: string;
}

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const steps = 60;
    const increment = target / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.round(start));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

function StatCard({ stat }: { stat: StatItem }) {
  const { count, ref } = useCountUp(stat.target);

  return (
    <div
      ref={ref}
      className="group flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl glass-dark border border-brand-royal/10 hover:border-brand-royal/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-royal-glow relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-royal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

      {/* Icon */}
      <span className="text-3xl mb-4 relative z-10">{stat.icon}</span>

      {/* Number */}
      <div className="text-4xl md:text-5xl font-black font-inter text-brand-royal mb-2 relative z-10 text-glow-royal">
        {stat.prefix}{count.toLocaleString('ar-SA')}{stat.suffix}
      </div>

      {/* Label */}
      <div className="text-sm md:text-base font-tajawal font-medium text-brand-white/60 text-center relative z-10">
        {stat.label}
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-royal/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </div>
  );
}

export default function CounterStats({ stats: statsProp }: { stats?: StatItem[] }) {
  const stats = statsProp && statsProp.length > 0 ? statsProp : [];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, i) => (
        <StatCard key={i} stat={stat} />
      ))}
    </div>
  );
}
