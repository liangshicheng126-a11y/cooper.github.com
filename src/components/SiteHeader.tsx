"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Briefcase,
  Home,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  User,
  X,
} from "lucide-react";

import { useTranslation } from "@/locales/LanguageProvider";
import { isLanguage, languageOptions } from "@/locales/config";
import { isNavActive } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { useIntroRevealReady } from "@/components/motion/IntroPlaybackContext";
import StaggeredMenu from "@/components/ui/StaggeredMenu";

const navIconClassName = "h-4 w-4 shrink-0";

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const { language, setLanguage, t, mounted } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const introRevealReady = useIntroRevealReady();

  const navItems = [
    { name: t.nav.home, href: "/", icon: Home },
    { name: t.nav.portfolio, href: "/portfolio", icon: Briefcase },
    { name: t.nav.about, href: "/about", icon: User },
    { name: t.nav.xiaocoo, href: "/xiaocoo", icon: MessageCircle },
    { name: t.nav.contactMe, href: "/contact", icon: Mail },
  ];

  useEffect(() => {
    setMenuOpen(false);
    setLanguageMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const changeLanguageMenuOpen = useCallback((open: boolean) => {
    setLanguageMenuOpen(open);
    if (open) setMenuOpen(false);
  }, []);

  return (
    <motion.header
      className="site-header"
      inert={!mounted || undefined}
      aria-hidden={!mounted || undefined}
      initial={false}
      animate={
        mounted && introRevealReady
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: -12, filter: "blur(8px)" }
      }
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.52, ease: [0.16, 1, 0.3, 1] }
      }
    >
      <div className="site-header__inner">
        <Link href="/" className="site-wordmark" aria-label={`COOPER. · ${t.nav.home}`}>
          <span className="site-wordmark__dot" aria-hidden />
          <span>COOPER.</span>
        </Link>

        <AnimatedGroup
          preset="blur-slide"
          className="hidden lg:block"
          variants={{
            container: {
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { delayChildren: 0.16 },
              },
            },
            item: {
              hidden: { opacity: 0, filter: "blur(8px)", y: -8 },
              visible: {
                opacity: 1,
                filter: "blur(0px)",
                y: 0,
                transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
              },
            },
          }}
        >
          <LayoutGroup id="site-primary-navigation">
            <nav className="site-nav flex" aria-label={t.ui.navigation}>
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn("site-nav__link", active && "is-active")}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && (
                      <motion.span
                        layoutId="site-nav-active-route"
                        className="site-nav__active-surface"
                        transition={
                          reduced
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 38, mass: 0.72 }
                        }
                        aria-hidden
                      >
                        <span className="site-nav__active-underline" />
                      </motion.span>
                    )}
                    <span className="site-nav__label">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>
        </AnimatedGroup>

        <div className="flex items-center gap-2">
          <StaggeredMenu
            items={languageOptions}
            value={language}
            open={languageMenuOpen}
            title={t.ui.language}
            closeLabel={t.ui.closeLanguage}
            onOpenChange={changeLanguageMenuOpen}
            onSelect={(value) => { if (isLanguage(value)) setLanguage(value); }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              setLanguageMenuOpen(false);
              setMenuOpen((value) => !value);
            }}
            className="lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            aria-label={menuOpen ? t.ui.closeMenu : t.ui.openMenu}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-mobile-menu"
            className="site-mobile-menu lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
              onClick={() => setMenuOpen(false)}
              aria-label={t.ui.closeMenu}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t.ui.navigation}
              className="site-mobile-menu__panel"
              initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <nav className="grid gap-2" aria-label={t.ui.mobileNavigation}>
                {navItems.map((item) => {
                  const active = isNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn("site-mobile-menu__link", active && "is-active")}
                      aria-current={active ? "page" : undefined}
                    >
                      <item.icon className={navIconClassName} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-5 grid gap-2 border-t border-white/10 pt-5 text-sm text-zinc-400">
                <a className="site-mobile-menu__contact" href="mailto:liangshicheng303@126.com">
                  <Mail className={navIconClassName} />
                  <span className="truncate">liangshicheng303@126.com</span>
                </a>
                <a className="site-mobile-menu__contact" href="tel:13867681608">
                  <Phone className={navIconClassName} />
                  <span>13867681608</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
