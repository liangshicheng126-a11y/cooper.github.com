"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { MOTION_V2_ENABLED, REVEAL, shouldUseGsap } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

type GsapScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div";
  /** Vertical offset on enter (px) */
  y?: number;
  /** Horizontal offset on enter (px), alternates with data-direction */
  x?: number;
  scrub?: boolean | number;
  once?: boolean;
  start?: string;
  end?: string;
};

export default function GsapScrollReveal({
  children,
  className,
  id,
  as: Tag = "section",
  y = REVEAL.y,
  x = 0,
  scrub = false,
  once = true,
  start = "top 88%",
  end = "top 40%",
}: GsapScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const useGsap = shouldUseGsap(reduced);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !useGsap) return;

      const from: gsap.TweenVars = {
        opacity: 0,
        y,
        x,
        force3D: true,
      };

      if (scrub) {
        gsap.fromTo(
          el,
          from,
          {
            opacity: 1,
            y: 0,
            x: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start,
              end,
              scrub: typeof scrub === "number" ? scrub : true,
            },
          }
        );
      } else {
        gsap.fromTo(el, from, {
          opacity: 1,
          y: 0,
          x: 0,
          duration: REVEAL.duration,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: once ? "play none none none" : "play reverse play reverse",
          },
        });
      }
    },
    { scope: ref, dependencies: [useGsap, y, x, scrub, once, start, end] }
  );

  const staticClass = !MOTION_V2_ENABLED || reduced ? "opacity-100" : "gsap-scroll-reveal";

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLElement>}
      id={id}
      className={cn(staticClass, className)}
      style={
        useGsap
          ? { opacity: 0, transform: `translate3d(${x}px, ${y}px, 0)` }
          : undefined
      }
    >
      {children}
    </Tag>
  );
}
