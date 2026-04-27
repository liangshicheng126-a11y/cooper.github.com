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
  Github, 
  Twitter, 
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
      <div className="fixed left-4 right-4 top-4 z-50 xl:hidden">
        <div className="glass rounded-2xl border-white/10 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-wider">
              COOPER.
            </span>
          </Link>
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

      {/* Mobile Drawer */}
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
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu overlay"
            />
            <motion.aside
              className="absolute left-4 right-4 top-20 bottom-4 glass rounded-3xl border-white/10 p-6 flex flex-col overflow-auto"
              initial={{ y: 12, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-wider">
                  COOPER.
                </span>
                <button
                  type="button"
                  className="text-xs font-bold text-foreground/60 hover:text-indigo-500 transition-colors stable-ui-text"
                  onClick={toggleLanguage}
                >
                  {mounted ? (language === "zh" ? "EN" : "中文") : "EN"}
                </button>
              </div>

              <nav className="space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group w-full",
                      pathname === item.href
                        ? "bg-white/10 text-indigo-500 shadow-sm"
                        : "text-foreground/70 hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <div className="w-5 flex justify-center">
                      <item.icon
                        className={cn(
                          "w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0",
                          pathname === item.href ? "text-indigo-500" : "text-foreground/40 group-hover:text-indigo-400"
                        )}
                      />
                    </div>
                    <span className="font-medium truncate transition-all duration-300">{item.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                <a
                  href="mailto:liangshicheng303@126.com"
                  className="flex items-center space-x-3 text-sm text-foreground/70 hover:text-indigo-500 transition-colors group"
                >
                  <Mail className="w-4 h-4 text-foreground/40 group-hover:text-indigo-400 shrink-0" />
                  <span className="truncate">liangshicheng303@126.com</span>
                </a>
                <a
                  href="tel:13867681608"
                  className="flex items-center space-x-3 text-sm text-foreground/70 hover:text-indigo-500 transition-colors group"
                >
                  <Phone className="w-4 h-4 text-foreground/40 group-hover:text-indigo-400 shrink-0" />
                  <span>13867681608</span>
                </a>
                <div className="flex items-center space-x-3 text-sm text-foreground/70">
                  <MapPin className="w-4 h-4 text-foreground/40 shrink-0" />
                  <span className="truncate">{t.contact.location}</span>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden xl:flex fixed left-6 top-6 bottom-6 w-64 glass rounded-3xl z-50 flex-col p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
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

        {/* Social Icons */}
        <div className="flex items-center space-x-4 pt-4">
          <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-500 transition-all duration-300 group">
            <Github className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-sky-500/10 hover:text-sky-500 transition-all duration-300 group">
            <Twitter className="w-4 h-4" />
          </a>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
