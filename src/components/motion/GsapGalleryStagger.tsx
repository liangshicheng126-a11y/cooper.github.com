"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { STAGGER, shouldUseGsap } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

type GsapGalleryStaggerProps = {
  children: React.ReactNode;
  itemSelector?: string;
};

/** Staggers gallery thumbnails on scroll without animating the section wrapper. */
export default function GsapGalleryStagger({
  children,
  itemSelector = ".masonry-item, .gallery-thumb",
}: GsapGalleryStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const useGsap = shouldUseGsap(reduced);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !useGsap) return;

      const isCoarse =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 640px)").matches;
      if (isCoarse) return;

      const items = root.querySelectorAll(itemSelector);
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 24, force3D: true });

      ScrollTrigger.create({
        trigger: root,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: STAGGER.tight,
            ease: "power2.out",
          });
        },
      });
    },
    { scope: ref, dependencies: [useGsap, itemSelector] }
  );

  return <div ref={ref}>{children}</div>;
}
