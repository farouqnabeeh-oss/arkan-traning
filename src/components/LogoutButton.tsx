'use client';

import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  onBeforeLogout?: () => void;
}

export default function LogoutButton({ className, onBeforeLogout }: LogoutButtonProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (onBeforeLogout) onBeforeLogout();
    await logout();
  };

  return (
    <button
      onClick={handleLogout}
      className={className ?? 'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all'}
    >
      <LogOut size={18} />
      <span className="text-sm">تسجيل الخروج</span>
    </button>
  );
}
