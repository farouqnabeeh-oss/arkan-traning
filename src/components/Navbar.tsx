"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";
import {
  Menu,
  X,
  BookOpen,
  Gamepad2,
  LogIn,
  Home,
  PhoneCall,
  ChevronDown,
  ArrowLeft,
  Trophy,
  Library,
} from "lucide-react";

interface NavCourse {
  id: string;
  title: string;
  slug: string;
}
interface NavGame {
  id: string;
  name: string;
  slug: string;
}

const baseLinks = [{ label: "الرئيسية", href: "/", icon: Home }];
const tailLinks = [
  // { label: "لوحة الشرف", href: "/leaderboard", icon: Trophy },
  { label: "تواصل معنا", href: "/contact", icon: PhoneCall },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<
    "courses" | "games" | "library" | null
  >(null);
  const [mobileExpanded, setMobileExpanded] = useState<
    "courses" | "games" | "library" | null
  >(null);
  const [courses, setCourses] = useState<NavCourse[]>([]);
  const [games, setGames] = useState<NavGame[]>([]);
  const [books, setBooks] = useState<NavCourse[]>([]);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/nav")
      .then((r) => r.json())
      .then((d) => {
        setCourses(d.courses || []);
        setGames(d.games || []);
        setBooks(d.books || []);
      })
      .catch(() => {});
  }, []);

  function openNow(key: "courses" | "games" | "library") {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(key);
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 200);
  }

  const dropdownItems: Record<
    "courses" | "games" | "library",
    { label: string; href: string }[]
  > = {
    courses: courses.map((c) => ({
      label: c.title,
      href: `/courses/${c.slug}`,
    })),
    games: games.map((g) => ({ label: g.name, href: `/games/${g.slug}` })),
    library: books.map((b) => ({ label: b.title, href: `/library/${b.slug}` })),
  };

  const navMeta: Record<
    "courses" | "games" | "library",
    { href: string; label: string; icon: typeof BookOpen }
  > = {
    courses: { href: "/courses", label: "الدورات", icon: BookOpen },
    games: { href: "/games", label: "الألعاب", icon: Gamepad2 },
    library: { href: "/library", label: "المكتبة", icon: Library },
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-3 pt-3 md:px-4 md:pt-4 pointer-events-none">
      <div
        className={`pointer-events-auto transition-all duration-500 ease-[0.22,1,0.36,1] ${
          scrolled
            ? "w-full max-w-6xl bg-brand-dark/70 backdrop-blur-3xl border border-brand-royal/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6),0_0_20px_rgba(59,91,219,0.15)] rounded-3xl py-2.5"
            : "w-full max-w-7xl bg-transparent border-transparent py-3"
        }`}
        dir="rtl"
      >
        <div
          className={`flex items-center justify-between px-3 sm:px-5 md:px-6 transition-all duration-500 ${scrolled ? "h-[3.4rem]" : "h-[3.75rem]"}`}
        >
          <div className="flex-shrink-0">
            <Logo className={scrolled ? "h-8" : "h-10"} />
          </div>

          {/* ── Desktop Center Nav ── */}
          <nav className="hidden xl:flex items-center gap-1.5 lg:gap-2 mx-3 lg:mx-4 bg-brand-white/5 border border-brand-white/5 rounded-2xl p-1 backdrop-blur-md">
            {baseLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-2 px-2 py-2 rounded-xl font-tajawal text-sm font-bold transition-all duration-300 overflow-hidden ${isActive ? "text-brand-dark" : "text-brand-white/70 hover:text-brand-white"}`}
                >
                  {isActive ? (
                    <span className="absolute inset-0 royal-gradient rounded-xl shadow-royal-glow-sm" />
                  ) : (
                    <span className="absolute inset-0 bg-brand-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  <Icon
                    className={`w-4 h-4 relative z-10 transition-transform duration-300 ${isActive ? "text-brand-dark" : "text-brand-royal/70 group-hover:scale-110 group-hover:text-brand-royal"}`}
                  />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}

            {/* الدورات والألعاب - قوائم منسدلة */}
            {(["courses", "games", "library"] as const).map((key) => {
              const { href, label, icon: Icon } = navMeta[key];
              const isActive = pathname.startsWith(href);
              const items = dropdownItems[key];
              return (
                <div
                  key={key}
                  className="relative"
                  onMouseEnter={() => openNow(key)}
                  onMouseLeave={closeSoon}
                >
                  <Link
                    href={href}
                    className={`group relative flex items-center gap-1.5 px-4 py-2 rounded-xl font-tajawal text-sm font-bold transition-all duration-300 overflow-hidden ${isActive ? "text-brand-dark" : "text-brand-white/70 hover:text-brand-white"}`}
                  >
                    {isActive ? (
                      <span className="absolute inset-0 royal-gradient rounded-xl shadow-royal-glow-sm" />
                    ) : (
                      <span className="absolute inset-0 bg-brand-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    <Icon
                      className={`w-4 h-4 relative z-10 transition-transform duration-300 ${isActive ? "text-brand-dark" : "text-brand-royal/70 group-hover:scale-110 group-hover:text-brand-royal"}`}
                    />
                    <span className="relative z-10">{label}</span>
                    <ChevronDown
                      className={`w-3 h-3 relative z-10 transition-transform duration-300 ${openDropdown === key ? "rotate-180" : ""} ${isActive ? "text-brand-dark" : "text-brand-royal/70"}`}
                    />
                  </Link>

                  {openDropdown === key && items.length > 0 && (
                    <div
                      className="absolute top-full right-0 mt-3 w-72 glass-dark border border-brand-royal/15 rounded-2xl shadow-dark-xl overflow-hidden animate-fade-in-up"
                      style={{ animationDuration: "200ms" }}
                    >
                      <div className="p-2 max-h-80 overflow-y-auto">
                        {items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-brand-white/80 hover:bg-brand-royal/10 hover:text-brand-white font-tajawal text-sm transition-colors group/item"
                          >
                            <span className="truncate">{item.label}</span>
                            <ArrowLeft className="w-3.5 h-3.5 text-brand-royal-light opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={href}
                        className="block text-center py-3 text-xs font-tajawal font-bold text-brand-royal-light bg-brand-royal/5 hover:bg-brand-royal/10 border-t border-white/5 transition-colors"
                      >
                        عرض الكل ←
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            {tailLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl font-tajawal text-sm font-bold transition-all duration-300 overflow-hidden ${isActive ? "text-brand-dark" : "text-brand-white/70 hover:text-brand-white"}`}
                >
                  {isActive ? (
                    <span className="absolute inset-0 royal-gradient rounded-xl shadow-royal-glow-sm" />
                  ) : (
                    <span className="absolute inset-0 bg-brand-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  <Icon
                    className={`w-4 h-4 relative z-10 transition-transform duration-300 ${isActive ? "text-brand-dark" : "text-brand-royal/70 group-hover:scale-110 group-hover:text-brand-royal"}`}
                  />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop CTA ── */}
          <div className="hidden xl:flex items-center gap-2.5">
            <div className="w-px h-6 bg-brand-white/10" />
            <SearchBar />
            <NotificationBell isLoggedIn={mounted && !!user} />
            {mounted && user ? (
              <Link
                href={
                  user.role === "ADMIN" || user.role === "INSTRUCTOR"
                    ? "/dashboard/admin"
                    : "/dashboard"
                }
                className="group relative overflow-hidden flex items-center gap-2 glass-royal border border-brand-royal/40 text-brand-royal px-6 py-2.5 rounded-xl font-tajawal text-sm font-black transition-all duration-300 hover:shadow-royal-glow hover:-translate-y-0.5"
              >
                <span className="relative z-10">لوحتي</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="group relative overflow-hidden flex items-center gap-2 glass-royal border border-brand-royal/40 text-brand-royal px-6 py-2.5 rounded-xl font-tajawal text-sm font-black transition-all duration-300 hover:shadow-royal-glow hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 bg-brand-royal/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12" />
                <LogIn className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                <span className="relative z-10">الدخول</span>
              </Link>
            )}
          </div>

          {/* ── Mobile Toggle ── */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="xl:hidden w-10 h-10 flex items-center justify-center rounded-xl glass-dark border border-brand-royal/20 text-brand-royal hover:bg-brand-royal/10 transition-all duration-300"
            aria-label="فتح القائمة"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <span
                className={`absolute transition-all duration-300 ${menuOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
              >
                <Menu className="w-5 h-5" />
              </span>
              <span
                className={`absolute transition-all duration-300 ${menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
              >
                <X className="w-5 h-5" />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <div
        className={`absolute top-full left-3 right-3 mt-3 pointer-events-auto xl:hidden transition-all duration-500 ease-[0.22,1,0.36,1] origin-top ${menuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"}`}
      >
        <nav
          className="bg-brand-dark/95 backdrop-blur-3xl border border-brand-royal/20 rounded-3xl p-2.5 shadow-dark-xl flex flex-col gap-1 max-h-[70vh] overflow-y-auto"
          dir="rtl"
        >
          {baseLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-tajawal text-sm font-bold transition-all duration-300 ${isActive ? "glass-royal text-brand-royal border border-brand-royal/20" : "text-brand-white/70 hover:bg-brand-white/5 hover:text-brand-white"}`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-brand-royal" : "text-brand-royal/50"}`}
                />
                {link.label}
              </Link>
            );
          })}

          {(["courses", "games", "library"] as const).map((key) => {
            const { href, label, icon: Icon } = navMeta[key];
            const items = dropdownItems[key];
            const expanded = mobileExpanded === key;
            return (
              <div key={key}>
                <div className="flex items-center rounded-2xl overflow-hidden">
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 flex items-center gap-3 px-5 py-4 text-brand-white/70 hover:bg-brand-white/5 hover:text-brand-white font-tajawal text-sm font-bold"
                  >
                    <Icon className="w-5 h-5 text-brand-royal/50" /> {label}
                  </Link>
                  {items.length > 0 && (
                    <button
                      onClick={() => setMobileExpanded(expanded ? null : key)}
                      className="px-4 py-4 text-brand-white/50"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {expanded && (
                  <div className="pr-6 pb-2 space-y-1">
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="block px-5 py-2.5 rounded-xl text-brand-white/60 hover:bg-white/5 hover:text-brand-white font-tajawal text-xs"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {tailLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-tajawal text-sm font-bold transition-all duration-300 ${isActive ? "glass-royal text-brand-royal border border-brand-royal/20" : "text-brand-white/70 hover:bg-brand-white/5 hover:text-brand-white"}`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-brand-royal" : "text-brand-royal/50"}`}
                />
                {link.label}
              </Link>
            );
          })}

          <div className="my-2 h-px bg-gradient-to-r from-transparent via-brand-white/10 to-transparent" />

          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 mt-2 royal-gradient text-brand-dark px-5 py-4 rounded-2xl font-tajawal text-sm font-black transition-all shadow-royal-glow-sm"
          >
            <LogIn className="w-5 h-5" /> تسجيل الدخول
          </Link>
        </nav>
      </div>
    </header>
  );
}
