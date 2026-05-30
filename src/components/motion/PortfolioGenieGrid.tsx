"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import useMotionTier from "@/hooks/useMotionTier";
import { MOTION_V2_ENABLED, shouldUseGsap } from "@/lib/motion";
import {
  getCardGenieOffset,
  getGenieTransformOrigin,
  getPortfolioNavOrigin,
} from "@/lib/navGenieOrigin";

const STAGGER = 0.1;
const GENIE_DURATION = 0.85;
const GENIE_START_SCALE = 0.06;

function markRevealing(el: Element, active: boolean) {
  el.classList.toggle("is-revealing", active);
}

function finishGenieItem(el: Element) {
  markRevealing(el, false);
  gsap.set(el, {
    clearProps: "transform,borderRadius,willChange,overflow,transformOrigin",
  });
  (el as HTMLElement).style.willChange = "auto";
  (el as HTMLElement).style.overflow = "visible";
}

type PortfolioGenieGridProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PortfolioGenieGrid({
  children,
  className,
}: PortfolioGenieGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const tier = useMotionTier();
  const useGsap = shouldUseGsap(reduced);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !useGsap) return;

      const items = Array.from(
        root.querySelectorAll<HTMLElement>("[data-genie-item]")
      );
      if (!items.length) return;

      if (tier === "minimal") {
        gsap.set(items, { autoAlpha: 1, clearProps: "transform,borderRadius" });
        return;
      }

      const isXl = window.matchMedia("(min-width: 1280px)").matches;
      const origin = getPortfolioNavOrigin();
      const useFullGenie = tier === "full" && isXl && origin !== null;

      items.forEach((item, i) => {
        const idx = Number(item.dataset.genieIndex ?? i);

        if (useFullGenie && origin) {
          const offset = getCardGenieOffset(item, origin);
          gsap.set(item, {
            autoAlpha: 0,
            x: offset.x,
            y: offset.y,
            scale: GENIE_START_SCALE,
            borderRadius: 12,
            overflow: "hidden",
            transformOrigin: getGenieTransformOrigin(item, origin),
            force3D: true,
          });
          return;
        }

        gsap.set(item, {
          autoAlpha: 0,
          x: idx % 2 === 0 ? -40 : 40,
          y: -80,
          scale: 0.9,
          force3D: true,
        });
      });

      requestAnimationFrame(() => {
        items.forEach((el) => markRevealing(el, true));

        const tl = gsap.timeline({
          onComplete: () => items.forEach(finishGenieItem),
        });

        items.forEach((item, i) => {
          const idx = Number(item.dataset.genieIndex ?? i);
          tl.to(
            item,
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              borderRadius: 24,
              duration: GENIE_DURATION,
              ease: "power4.inOut",
              overwrite: "auto",
            },
            idx * STAGGER
          );
        });
      });
    },
    { scope: ref, dependencies: [useGsap, tier] }
  );

  return (
    <div
      ref={ref}
      className={cn(
        useGsap && MOTION_V2_ENABLED && "portfolio-genie-grid",
        className
      )}
    >
      {children}
    </div>
  );
}
