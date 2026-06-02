"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { shouldUseGsap } from "@/lib/motion";

let registered = false;

function ensureScrollTrigger() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export default function GsapProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tier = useMotionTier();
  const reduced = usePrefersReducedMotion();
  const useGsap = shouldUseGsap(reduced);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    ensureScrollTrigger();

    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);

    rafId.current = requestAnimationFrame(() => {
      refreshTimer.current = setTimeout(() => {
        ScrollTrigger.refresh();
      }, !useGsap ? 120 : tier === "full" ? 820 : tier === "reduced" ? 560 : 140);
    });

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [pathname, tier, useGsap]);

  return <>{children}</>;
}
