"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { MOTION_V2_ENABLED, REVEAL, STAGGER, shouldUseGsap } from "@/lib/motion";
import { isElementInViewport } from "@/lib/scrollMotion";

gsap.registerPlugin(ScrollTrigger);

type GsapScrollBatchProps = {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
  stagger?: number;
  y?: number;
};

export default function GsapScrollBatch({
  children,
  className,
  itemSelector = "[data-scroll-batch-item], .gsap-batch-item",
  stagger = STAGGER.cards,
  y = 28,
}: GsapScrollBatchProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const useGsap = shouldUseGsap(reduced);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !useGsap) return;

      const items = root.querySelectorAll(itemSelector);
      if (!items.length) return;

      const pending: Element[] = [];

      items.forEach((item) => {
        if (isElementInViewport(item)) {
          gsap.set(item, { autoAlpha: 1, y: 0, clearProps: "transform" });
        } else {
          gsap.set(item, { autoAlpha: 0, y, force3D: true });
          pending.push(item);
        }
      });

      if (!pending.length) return;

      const reveal = (batch: Element[]) => {
        gsap.fromTo(
          batch,
          { autoAlpha: 0, y, force3D: true },
          {
            autoAlpha: 1,
            y: 0,
            duration: REVEAL.duration,
            stagger,
            ease: "power3.out",
            overwrite: "auto",
          }
        );
      };

      ScrollTrigger.batch(pending, {
        start: "top 92%",
        onEnter: reveal,
        once: true,
      });
    },
    { scope: ref, dependencies: [useGsap, itemSelector, stagger, y] }
  );

  return (
    <div
      ref={ref}
      className={cn(
        useGsap && MOTION_V2_ENABLED && "gsap-scroll-batch",
        className
      )}
    >
      {children}
    </div>
  );
}
