"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import useMotionTier from "@/hooks/useMotionTier";
import { STAGGER, shouldUseGsap } from "@/lib/motion";
import { isElementInViewport } from "@/lib/scrollMotion";

gsap.registerPlugin(ScrollTrigger);

type GsapGalleryStaggerProps = {
  children: React.ReactNode;
  itemSelector?: string;
};

/** Staggers gallery thumbnails — only hides off-screen items to avoid blank scroll gaps. */
export default function GsapGalleryStagger({
  children,
  itemSelector = ".masonry-item, .gallery-thumb",
}: GsapGalleryStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const tier = useMotionTier();
  const useGsap = shouldUseGsap(reduced);
  const enableStagger = useGsap && tier === "full";

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !enableStagger) return;

      const items = root.querySelectorAll(itemSelector);
      if (!items.length) return;

      const pending: Element[] = [];

      items.forEach((item) => {
        if (isElementInViewport(item)) {
          gsap.set(item, { autoAlpha: 1, y: 0 });
        } else {
          gsap.set(item, { autoAlpha: 0, y: 16, force3D: true });
          pending.push(item);
        }
      });

      if (!pending.length) return;

      ScrollTrigger.create({
        trigger: root,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(pending, {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            stagger: STAGGER.tight,
            ease: "power2.out",
          });
        },
      });
    },
    { scope: ref, dependencies: [enableStagger, itemSelector] }
  );

  return <div ref={ref}>{children}</div>;
}
