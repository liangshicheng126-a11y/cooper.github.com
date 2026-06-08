"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { HERO_CLOUDS_ENABLED } from "@/lib/hero-clouds";
import { createHeroCloudEngine } from "@/lib/hero-cloud-engine";

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
    if (!useWebGL) return;

    const host = canvasHostRef.current;
    if (!host) return;

    const engine = createHeroCloudEngine({
      container: host,
      tier,
      mouseEnabled: tier === "full" || tier === "reduced",
    });

    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        engine.setScrollOffset(window.scrollY);

        const sentinel = heroEndRef.current;
        if (sentinel) {
          const rect = sentinel.getBoundingClientRect();
          const progress = Math.min(1, Math.max(0, rect.top / window.innerHeight));
          engine.setHeroProgress(progress);
        } else {
          engine.setHeroProgress(1);
        }
      });
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      engine.dispose();
    };
  }, [useWebGL, tier, heroEndRef]);

  if (!showLayers) return null;

  return (
    <div className={cn("hero-cloud-experience", className)} aria-hidden>
      <div ref={gradientRef} className="hero-cloud-gradient">
        <div className="hero-cloud-gradient__layer hero-cloud-gradient__layer--a" />
        <div className="hero-cloud-gradient__layer hero-cloud-gradient__layer--b" />
        <div className="hero-cloud-gradient__mirror" />
      </div>

      {useWebGL ? (
        <div ref={canvasHostRef} className="hero-cloud-canvas-host" />
      ) : (
        <HeroCloudStaticFallback />
      )}
    </div>
  );
}
