"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { MOTION_V2_ENABLED, shouldUseGsap } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollBlobs() {
  const pathname = usePathname() ?? "";
  const isGalleryDetail = /^\/portfolio\/p[13]\/?$/.test(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const useGsap = shouldUseGsap(reduced);

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root || !useGsap || !MOTION_V2_ENABLED) return;

      const isCoarse =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 640px)").matches;
      if (isCoarse) return;

      const blobs = root.querySelectorAll(".blob");
      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          y: (i + 1) * 28,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.4 + i * 0.2,
          },
        });
      });
    },
    { scope: containerRef, dependencies: [useGsap, pathname] }
  );

  return (
    <div
      ref={containerRef}
      className={`liquid-bg pointer-events-none gsap-parallax${isGalleryDetail ? " liquid-bg--gallery" : ""}`}
      aria-hidden
    >
      <div className="blob blob-indigo blob-a" />
      <div className="blob blob-cyan blob-b" />
      <div className="blob blob-rose blob-c" />
    </div>
  );
}
