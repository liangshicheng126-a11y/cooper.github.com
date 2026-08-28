"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { shouldUseGsap } from "@/lib/motion";
import { useTranslation } from "@/locales/LanguageProvider";

let registered = false;

function ensureScrollTrigger() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export default function GsapProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language } = useTranslation();
  const tier = useMotionTier();
  const reduced = usePrefersReducedMotion();
  const useGsap = shouldUseGsap(reduced);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    ensureScrollTrigger();

    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);

    let cancelled = false;
    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };
    rafId.current = requestAnimationFrame(() => {
      refreshTimer.current = setTimeout(() => {
        refresh();
      }, !useGsap ? 120 : tier === "full" ? 820 : tier === "reduced" ? 560 : 140);
    });

    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh, { once: true });

    return () => {
      cancelled = true;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      window.removeEventListener("load", refresh);
    };
  }, [pathname, tier, useGsap, language]);

  return <>{children}</>;
}
