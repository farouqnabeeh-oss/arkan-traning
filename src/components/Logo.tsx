import React from "react";
import Link from "next/link";

export default function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <Link href="/" className="flex items-center gap-3  group select-none">
      <svg
        viewBox="0 0 100 82"
        className={`${className} fill-none transition-transform duration-300 group-hover:scale-105`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="arcRoyal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1F2E63" />
            <stop offset="40%" stopColor="#7C93F0" />
            <stop offset="100%" stopColor="#C7D0DE" />
          </linearGradient>
          <linearGradient id="pillarRoyal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1F2E63" />
            <stop offset="50%" stopColor="#7C93F0" />
            <stop offset="100%" stopColor="#1F2E63" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer arch */}
        <path
          d="M 10 38 A 40 40 0 0 1 90 38"
          stroke="url(#arcRoyal)"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        {/* Inner dashed arch */}
        <path
          d="M 20 38 A 30 30 0 0 1 80 38"
          stroke="#C7D0DE"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="3 4"
          opacity="0.5"
        />

        {/* Entablature */}
        <rect
          x="8"
          y="38"
          width="84"
          height="4.5"
          rx="1.5"
          fill="url(#arcRoyal)"
        />

        {/* Left pillar */}
        <rect
          x="22"
          y="44"
          width="11"
          height="28"
          rx="1"
          fill="url(#pillarRoyal)"
        />
        <rect x="20" y="41" width="15" height="3.5" rx="1" fill="#C7D0DE" />
        <rect x="20" y="72" width="15" height="3.5" rx="1" fill="#C7D0DE" />
        {/* Fluting */}
        <line
          x1="26"
          y1="45"
          x2="26"
          y2="71"
          stroke="#070B14"
          strokeWidth="1"
          opacity="0.35"
        />
        <line
          x1="30"
          y1="45"
          x2="30"
          y2="71"
          stroke="#070B14"
          strokeWidth="1"
          opacity="0.35"
        />

        {/* Right pillar */}
        <rect
          x="67"
          y="44"
          width="11"
          height="28"
          rx="1"
          fill="url(#pillarRoyal)"
        />
        <rect x="65" y="41" width="15" height="3.5" rx="1" fill="#C7D0DE" />
        <rect x="65" y="72" width="15" height="3.5" rx="1" fill="#C7D0DE" />
        {/* Fluting */}
        <line
          x1="71"
          y1="45"
          x2="71"
          y2="71"
          stroke="#070B14"
          strokeWidth="1"
          opacity="0.35"
        />
        <line
          x1="75"
          y1="45"
          x2="75"
          y2="71"
          stroke="#070B14"
          strokeWidth="1"
          opacity="0.35"
        />

        {/* Base */}
        <rect
          x="4"
          y="75.5"
          width="92"
          height="4.5"
          rx="2"
          fill="url(#arcRoyal)"
        />

        {/* Center star/diamond accent */}
        <polygon
          points="50,20 53,26 50,32 47,26"
          fill="#7C93F0"
          opacity="0.9"
          filter="url(#glow)"
        />
      </svg>

      {/* Text */}
      <div className="flex flex-col items-end leading-none">
        <span className="text-xl font-black font-tajawal tracking-wide shimmer-text group-hover:text-glow-royal transition-all duration-300">
          أَرْكَان
        </span>
        <span className="text-[8px] font-inter uppercase tracking-[0.25em] text-brand-white/40 mt-0.5">
          ARKAN ACADEMY
        </span>
      </div>
    </Link>
  );
}
