"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import useMotionTier from "@/hooks/useMotionTier";
import { MOTION_V2_ENABLED, PARALLAX, shouldUseGsap } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

type GsapParallaxLayerProps = {
  children: React.ReactNode;
  className?: string;
  /** Max translateY in px */
  amount?: number;
  scrub?: number;
};

export default function GsapParallaxLayer({
  children,
  className,
  amount = PARALLAX.y,
  scrub = 0.6,
}: GsapParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const tier = useMotionTier();
  const useGsap = shouldUseGsap(reduced);
  const enableParallax = useGsap && tier === "full";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !enableParallax) return;

      gsap.to(el, {
        y: amount,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub,
        },
      });
    },
    { scope: ref, dependencies: [enableParallax, amount, scrub] }
  );

  return (
    <div
      ref={ref}
      className={cn(
        enableParallax && MOTION_V2_ENABLED && "gsap-parallax",
        className
      )}
    >
      {children}
    </div>
  );
}
