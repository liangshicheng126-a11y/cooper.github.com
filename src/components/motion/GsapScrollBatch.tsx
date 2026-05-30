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

type EntranceVariant = "default" | "portfolio";

type GsapScrollBatchProps = {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
  stagger?: number;
  y?: number;
  /** portfolio: alternate slide + scale for project cards */
  entrance?: EntranceVariant;
  /** Play entrance on mount instead of waiting for scroll into view */
  playOnMount?: boolean;
};

export default function GsapScrollBatch({
  children,
  className,
  itemSelector = "[data-scroll-batch-item], .gsap-batch-item",
  stagger = STAGGER.cards,
  y = 28,
  entrance = "default",
  playOnMount = false,
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
      /** Portfolio cards sit below the hero on most viewports — always reveal with stagger. */
      const forceEntrance = entrance === "portfolio";

      items.forEach((item) => {
        if (!forceEntrance && isElementInViewport(item)) {
          gsap.set(item, { autoAlpha: 1, y: 0, x: 0, scale: 1, clearProps: "transform" });
          return;
        }

        const idx = Number((item as HTMLElement).dataset.batchIndex ?? 0);
        const x = entrance === "portfolio" ? (idx % 2 === 0 ? -36 : 36) : 0;
        const startY = entrance === "portfolio" ? 56 : y;
        const startScale = entrance === "portfolio" ? 0.92 : 1;
        gsap.set(item, {
          autoAlpha: 0,
          y: startY,
          x,
          scale: startScale,
          force3D: true,
        });
        pending.push(item);
      });

      if (!pending.length) return;

      const reveal = (batch: Element[]) => {
        if (entrance === "portfolio") {
          batch.forEach((el, i) => {
            const idx = Number((el as HTMLElement).dataset.batchIndex ?? i);
            const x = idx % 2 === 0 ? -36 : 36;
            gsap.fromTo(
              el,
              { autoAlpha: 0, y: 56, x, scale: 0.92, force3D: true },
              {
                autoAlpha: 1,
                y: 0,
                x: 0,
                scale: 1,
                duration: 0.85,
                delay: idx * (stagger || 0.12),
                ease: "power3.out",
                overwrite: "auto",
              }
            );
          });
          return;
        }

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

      if (playOnMount) {
        requestAnimationFrame(() => reveal(pending));
        return;
      }

      ScrollTrigger.batch(pending, {
        start: entrance === "portfolio" ? "top 92%" : "top 90%",
        onEnter: reveal,
        once: true,
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    { scope: ref, dependencies: [useGsap, itemSelector, stagger, y, entrance, playOnMount] }
  );

  return (
    <div
      ref={ref}
      className={cn(
        useGsap && MOTION_V2_ENABLED && "gsap-scroll-batch",
        entrance === "portfolio" && useGsap && MOTION_V2_ENABLED && "gsap-scroll-batch--portfolio",
        className
      )}
    >
      {children}
    </div>
  );
}
