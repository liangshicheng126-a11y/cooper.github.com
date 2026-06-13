"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import useMotionTier from "@/hooks/useMotionTier";
import { REVEAL, STAGGER, shouldUseGsap } from "@/lib/motion";
import { isElementInViewport } from "@/lib/scrollMotion";

gsap.registerPlugin(ScrollTrigger);

type EntranceVariant = "default" | "slide";

type GsapGalleryStaggerProps = {
  children: React.ReactNode;
  itemSelector?: string;
  /** slide: alternating horizontal slide-in for design mockups */
  entrance?: EntranceVariant;
};

function finishGalleryReveal(el: Element) {
  gsap.set(el, { clearProps: "transform,willChange" });
}

/** Staggers gallery thumbnails — only hides off-screen items to avoid blank scroll gaps. */
export default function GsapGalleryStagger({
  children,
  itemSelector = ".masonry-item, .gallery-thumb",
  entrance = "default",
}: GsapGalleryStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const tier = useMotionTier();
  const useGsap = shouldUseGsap(reduced);
  const enableStagger = useGsap && tier !== "minimal";
  const isSlide = entrance === "slide";

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !enableStagger) return;

      const items = root.querySelectorAll(itemSelector);
      if (!items.length) return;

      const pending: Element[] = [];
      const forceEntrance = isSlide;

      items.forEach((item, index) => {
        if (!forceEntrance && isElementInViewport(item)) {
          gsap.set(item, { autoAlpha: 1, y: 0, x: 0 });
          return;
        }

        const slideX =
          isSlide && tier === "full" ? (index % 2 === 0 ? -REVEAL.x : REVEAL.x) : 0;
        const startY = isSlide ? (tier === "full" ? 28 : 14) : 16;

        gsap.set(item, {
          autoAlpha: 0,
          y: startY,
          x: slideX,
          force3D: true,
        });
        pending.push(item);
      });

      if (!pending.length) return;

      const revealed = new Set<Element>();
      const start = isSlide ? "top 90%" : "top 88%";
      const triggerRatio = 0.9;

      const isPastStart = (el: Element) => {
        const rect = el.getBoundingClientRect();
        return rect.top <= window.innerHeight * triggerRatio && rect.bottom > 0;
      };

      const reveal = (batch: Element[]) => {
        if (isSlide) {
          batch.forEach((el, batchIndex) => {
            const index = Array.from(items).indexOf(el);
            const slideX =
              tier === "full" ? (index % 2 === 0 ? -REVEAL.x : REVEAL.x) : 0;
            const startY = tier === "full" ? 28 : 14;

            gsap.fromTo(
              el,
              { autoAlpha: 0, y: startY, x: slideX, force3D: true },
              {
                autoAlpha: 1,
                y: 0,
                x: 0,
                duration: tier === "full" ? 0.58 : 0.42,
                delay: (index >= 0 ? index : batchIndex) * STAGGER.tight,
                ease: "power3.out",
                overwrite: "auto",
                onComplete: () => finishGalleryReveal(el),
              },
            );
          });
          return;
        }

        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          stagger: STAGGER.tight,
          ease: "power2.out",
          onComplete: () => batch.forEach(finishGalleryReveal),
        });
      };

      const revealOnce = (batch: Element[]) => {
        const fresh = batch.filter((el) => !revealed.has(el));
        if (!fresh.length) return;
        fresh.forEach((el) => revealed.add(el));
        reveal(fresh);
      };

      const syncVisibleEntrances = () => {
        ScrollTrigger.refresh();
        const due = pending.filter((el) => !revealed.has(el) && isPastStart(el));
        if (due.length) revealOnce(due);
      };

      ScrollTrigger.batch(pending, {
        start,
        onEnter: revealOnce,
        once: true,
      });

      const settleTimer = gsap.delayedCall(isSlide ? 0.48 : 0.12, syncVisibleEntrances);

      return () => {
        settleTimer.kill();
      };
    },
    { scope: ref, dependencies: [enableStagger, itemSelector, entrance, tier, isSlide] }
  );

  return <div ref={ref}>{children}</div>;
}
