"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { MOTION_V2_ENABLED, REVEAL, shouldUseGsap } from "@/lib/motion";
import { isElementInViewport } from "@/lib/scrollMotion";

gsap.registerPlugin(ScrollTrigger);

type GsapScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div";
  y?: number;
  once?: boolean;
  start?: string;
};

/**
 * Outer shell stays fully opaque in layout — only inner content animates.
 * Prevents scroll "blank bands" on about / contact / portfolio detail pages.
 */
export default function GsapScrollReveal({
  children,
  className,
  id,
  as: Tag = "section",
  y = 20,
  once = true,
  start = "top 92%",
}: GsapScrollRevealProps) {
  const outerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const useGsap = shouldUseGsap(reduced);

  useGSAP(
    () => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner || !useGsap) return;

      gsap.set(inner, { autoAlpha: 1, y: 0, force3D: true });

      if (isElementInViewport(outer)) return;

      gsap.fromTo(
        inner,
        { autoAlpha: 0, y, force3D: true },
        {
          autoAlpha: 1,
          y: 0,
          duration: REVEAL.duration * 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: outer,
            start,
            toggleActions: once ? "play none none none" : "play reverse play reverse",
          },
        }
      );
    },
    { scope: outerRef, dependencies: [useGsap, y, once, start] }
  );

  return (
    <Tag
      ref={outerRef as React.RefObject<HTMLDivElement & HTMLElement>}
      id={id}
      className={cn(
        useGsap && MOTION_V2_ENABLED && "gsap-scroll-reveal-shell",
        className
      )}
    >
      <div ref={innerRef} className="gsap-reveal-content">
        {children}
      </div>
    </Tag>
  );
}
