"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

function ensureScrollTrigger() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export default function GsapProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    ensureScrollTrigger();

    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);

    rafId.current = requestAnimationFrame(() => {
      refreshTimer.current = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    });

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [pathname]);

  return <>{children}</>;
}
