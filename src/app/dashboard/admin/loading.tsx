import React from 'react';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 bg-white/5 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
