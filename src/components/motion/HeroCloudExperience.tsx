"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { HERO_CLOUDS_ENABLED, heroCloudVisibility } from "@/lib/hero-clouds";
import type { HeroCloudEngine } from "@/lib/hero-cloud-engine";

type HeroCloudExperienceProps = {
  heroEndRef: React.RefObject<HTMLElement | null>;
  className?: string;
};

function HeroCloudStaticFallback() {
  return (
    <div className="hero-cloud-fallback" aria-hidden>
      <div className="hero-cloud-fallback__band hero-cloud-fallback__band--top" />
      <div className="hero-cloud-fallback__band hero-cloud-fallback__band--mid" />
      <div className="hero-cloud-fallback__band hero-cloud-fallback__band--bottom" />
    </div>
  );
}

export default function HeroCloudExperience({ heroEndRef, className }: HeroCloudExperienceProps) {
  const tier = useMotionTier();
  const reducedMotion = usePrefersReducedMotion();
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HeroCloudEngine | null>(null);
  const [webglReady, setWebglReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  const useWebGL = HERO_CLOUDS_ENABLED && tier !== "minimal" && !reducedMotion;
  const showLayers = HERO_CLOUDS_ENABLED;

  useEffect(() => {
    if (!showLayers) return;

    const gradient = gradientRef.current;
    if (!gradient) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        gradient.style.setProperty("--hero-cloud-scroll", `${y * 0.35}px`);
        gradient.style.setProperty("--hero-cloud-scroll-slow", `${y * 0.12}px`);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [showLayers]);

  useEffect(() => {
    if (!useWebGL) {
      setWebglReady(false);
      setWebglFailed(false);
      return;
    }

    let cancelled = false;
    let raf = 0;

    const boot = async () => {
      const host = canvasHostRef.current;
      if (!host || cancelled) return;

      try {
        const { createHeroCloudEngine } = await import("@/lib/hero-cloud-engine");
        if (cancelled || !canvasHostRef.current) return;

        engineRef.current?.dispose();
        engineRef.current = createHeroCloudEngine({
          container: canvasHostRef.current,
          tier,
          mouseEnabled: tier === "full" || tier === "reduced",
        });
        setWebglFailed(false);
        setWebglReady(true);
      } catch (error) {
        console.warn("[HeroCloud] WebGL init failed:", error);
        setWebglFailed(true);
        setWebglReady(false);
      }
    };

    void boot();

    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const engine = engineRef.current;
        if (!engine) return;

        engine.setScrollOffset(window.scrollY);

        const sentinel = heroEndRef.current;
        const bottom = sentinel ? sentinel.getBoundingClientRect().bottom : window.innerHeight;
        const opacity = heroCloudVisibility(bottom, window.innerHeight);
        engine.setVisibility(opacity);
      });
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      engineRef.current?.dispose();
      engineRef.current = null;
      setWebglReady(false);
    };
  }, [useWebGL, tier, heroEndRef]);

  if (!showLayers) return null;

  const showCanvas = useWebGL && !webglFailed;
  const showFallback = !useWebGL || webglFailed || !webglReady;

  return (
    <div className={cn("hero-cloud-experience", className)} aria-hidden>
      <div ref={gradientRef} className="hero-cloud-gradient">
        <div className="hero-cloud-gradient__layer hero-cloud-gradient__layer--a" />
        <div className="hero-cloud-gradient__layer hero-cloud-gradient__layer--b" />
        <div className="hero-cloud-gradient__mirror" />
      </div>

      {showCanvas ? (
        <div
          ref={canvasHostRef}
          className={cn("hero-cloud-canvas-host", webglReady && "hero-cloud-canvas-host--ready")}
        />
      ) : null}

      {showFallback ? <HeroCloudStaticFallback /> : null}
    </div>
  );
}
