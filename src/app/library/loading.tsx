import React from 'react';

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-white/5 rounded-xl overflow-hidden relative ${className}`}><div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" /></div>;
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-dark pt-36 pb-24 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto rounded-full" />
          <Skeleton className="h-14 w-96 max-w-full mx-auto" />
        </div>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/5 overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
