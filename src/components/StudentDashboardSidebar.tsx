'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import LogoutButton from './LogoutButton';
import {
  LayoutDashboard, BookOpen, Gamepad2, Library, Settings, Menu, X, ExternalLink
} from 'lucide-react';

interface StudentDashboardSidebarProps {
  user: {
    name: string;
    email: string;
  };
}

const navItems = [
  { href: '/dashboard', label: 'لوحتي التعليمية', icon: LayoutDashboard },
  { href: '/courses', label: 'الدورات التعليمية', icon: BookOpen },
  { href: '/games', label: 'الألعاب البرمجية', icon: Gamepad2 },
  { href: '/library', label: 'المكتبة الرقمية', icon: Library },
  { href: '/dashboard/settings', label: 'إعدادات الحساب', icon: Settings },
];

export default function StudentDashboardSidebar({ user }: StudentDashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand logo */}
      <div className="p-6 border-b border-brand-royal/10 flex items-center justify-between">
        <Logo className="h-9 w-auto" />
      </div>

      {/* User profile brief */}
      <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-brand-royal/5">
        <div className="w-10 h-10 rounded-full royal-gradient flex items-center justify-center font-tajawal font-bold text-brand-dark">
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0 text-right">
          <p className="text-sm font-bold text-brand-white truncate">{user.name}</p>
          <p className="text-[10px] text-brand-white/40 truncate">{user.email}</p>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? 'bg-brand-royal/15 text-brand-royal-light border border-brand-royal/20 font-bold'
                  : 'text-brand-white/70 hover:text-brand-white hover:bg-brand-white/5'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-brand-royal-light' : 'text-brand-royal/60 group-hover:text-brand-royal transition-colors'} />
              <span className="text-sm font-tajawal">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-white/5 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-brand-white/50 hover:text-brand-white hover:bg-white/5 transition-all text-sm font-tajawal"
        >
          <ExternalLink size={18} />
          <span>تصفح الموقع الرئيسي</span>
        </Link>
        
        <LogoutButton
          onBeforeLogout={() => setIsOpen(false)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-tajawal text-right"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar toggle */}
      <div className="lg:hidden glass-dark border-b border-brand-royal/10 p-4 flex items-center justify-between sticky top-0 z-40 w-full">
        <Logo className="h-8 w-auto" />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl glass-dark border border-brand-royal/25 text-brand-royal-light hover:bg-brand-royal/10"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop Sidebar drawer */}
      <aside className="w-72 shrink-0 hidden lg:flex flex-col glass-dark border-l border-brand-royal/15 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar overlay/drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative flex flex-col w-72 h-full glass-dark border-l border-brand-royal/15 animate-fade-in-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
