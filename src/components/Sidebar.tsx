"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Briefcase, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Menu,
  X
} from "lucide-react";
import WeChatIcon from "./icons/WeChatIcon";
import { useTranslation } from "@/locales/LanguageProvider";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { language, setLanguage, t, mounted } = useTranslation();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Prevents hydration mismatch by ensuring the initial render matches the server
  const currentLanguageLabel = !mounted ? "English" : (language === "zh" ? "English" : "中文");

  const navItems = [
    { name: t.nav.home, href: "/", icon: Home },
    { name: t.nav.portfolio, href: "/portfolio", icon: Briefcase },
    { name: t.nav.about, href: "/about", icon: User },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-top-shell fixed left-4 right-4 top-4 z-50 xl:hidden">
        <div className="glass rounded-2xl border-white/10 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-wider">
              COOPER.
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="glass px-3 h-10 rounded-xl text-[11px] font-bold tracking-widest text-foreground/70 hover:text-indigo-500 hover:border-indigo-500/30 transition-all stable-ui-text"
              onClick={toggleLanguage}
              aria-label={language === "zh" ? "Switch to English" : "切换至中文"}
            >
              {mounted ? (language === "zh" ? "EN" : "中文") : "EN"}
            </button>
            <button
              type="button"
              className="glass w-10 h-10 rounded-xl flex items-center justify-center hover:border-indigo-500/30 transition-all active:scale-95"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer — light scrim + solid panel for readability */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[55] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-white/55 backdrop-blur-[6px]"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu overlay"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className="absolute left-4 right-4 top-[4.75rem] bottom-4 max-h-[calc(100dvh-5.75rem)] flex flex-col overflow-auto rounded-3xl border border-slate-200/90 bg-white/[0.97] p-6 shadow-[0_24px_64px_rgba(15,23,42,0.16)] backdrop-blur-xl"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-wider">
                  COOPER.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-600 transition-colors stable-ui-text"
                    onClick={toggleLanguage}
                  >
                    {mounted ? (language === "zh" ? "EN" : "中文") : "EN"}
                  </button>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center space-x-4 rounded-2xl border p-4 transition-all duration-200 group w-full",
                      pathname === item.href
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm"
                        : "border-transparent bg-slate-50/80 text-slate-800 hover:border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    <div className="w-5 flex justify-center">
                      <item.icon
                        className={cn(
                          "w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                          pathname === item.href ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-500"
                        )}
                      />
                    </div>
                    <span className="text-base font-semibold truncate">{item.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-slate-200 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t.nav.contact}
                </p>
                <a
                  href="mailto:liangshicheng303@126.com"
                  className="flex items-center space-x-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                >
                  <Mail className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 shrink-0" />
                  <span className="truncate">liangshicheng303@126.com</span>
                </a>
                <a
                  href="tel:13867681608"
                  className="flex items-center space-x-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                >
                  <Phone className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 shrink-0" />
                  <span>13867681608</span>
                </a>
                <div className="flex items-center space-x-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">{t.contact.location}</span>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="sidebar-shell hidden xl:flex fixed left-6 top-6 bottom-6 w-64 rounded-3xl z-[70] flex-col p-8 transition-all duration-500 border border-white/25 bg-white/20 backdrop-blur-2xl shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-wider">
            COOPER.
          </h1>
        </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-4 p-3 rounded-xl transition-all duration-300 group w-full",
              pathname === item.href 
                ? "bg-white/10 text-indigo-500 shadow-sm" 
                : "text-foreground/60 hover:text-foreground hover:bg-white/5"
            )}
          >
            <div className="w-5 flex justify-center">
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0",
                pathname === item.href ? "text-indigo-500" : "text-foreground/40 group-hover:text-indigo-400"
              )} />
            </div>
            <span className="font-medium truncate transition-all duration-300">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Contact at Bottom */}
      <div className="mt-auto pt-8 border-t border-white/10 space-y-4">
        <div className="space-y-3">
          <a href="mailto:liangshicheng303@126.com" className="flex items-center space-x-3 text-xs text-foreground/60 hover:text-indigo-500 transition-colors group">
            <div className="w-4 flex justify-center">
              <Mail className="w-4 h-4 text-foreground/30 group-hover:text-indigo-400 shrink-0" />
            </div>
            <span className="truncate">liangshicheng303@126.com</span>
          </a>
          <a href="tel:13867681608" className="flex items-center space-x-3 text-xs text-foreground/60 hover:text-indigo-500 transition-colors group">
            <div className="w-4 flex justify-center">
              <Phone className="w-4 h-4 text-foreground/30 group-hover:text-indigo-400 shrink-0" />
            </div>
            <span>13867681608</span>
          </a>
          <div className="flex items-center space-x-3 text-xs text-foreground/60 hover:text-indigo-500 transition-colors group cursor-pointer">
            <div className="w-4 flex justify-center">
              <WeChatIcon className="w-4 h-4 text-foreground/30 group-hover:text-indigo-400 shrink-0" />
            </div>
            <span>llqsc1122</span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-foreground/60 group">
            <div className="w-4 flex justify-center">
              <MapPin className="w-4 h-4 text-foreground/30 shrink-0" />
            </div>
            <span className="truncate">{t.contact.location}</span>
          </div>
        </div>

      </div>
      </aside>
    </>
  );
};

export default Sidebar;
