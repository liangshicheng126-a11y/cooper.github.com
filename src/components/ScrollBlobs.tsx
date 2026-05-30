"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import useMotionTier from "@/hooks/useMotionTier";
import { MOTION_V2_ENABLED, shouldUseGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const BLOB_ORIGINS = [
  { x: "-18vw", y: "-20vh", scale: 1, rotate: 0 },
  { x: "60vw", y: "6vh", scale: 1.05, rotate: 5 },
  { x: "8vw", y: "58vh", scale: 0.96, rotate: -4 },
];

export default function ScrollBlobs() {
  const pathname = usePathname() ?? "";
  const isGalleryDetail = /^\/portfolio\/p[13]\/?$/.test(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const tier = useMotionTier();
  const useGsap = shouldUseGsap(reduced);
  const enableScrub = useGsap && MOTION_V2_ENABLED && tier === "full";

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root || !useGsap || !MOTION_V2_ENABLED) return;

      const blobs = root.querySelectorAll(".blob");
      blobs.forEach((blob, i) => {
        const origin = BLOB_ORIGINS[i] ?? BLOB_ORIGINS[0];
        gsap.set(blob, {
          x: origin.x,
          y: origin.y,
          scale: origin.scale,
          rotation: origin.rotate,
          force3D: true,
        });
      });

      if (!enableScrub) return;

      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          y: `+=${(i + 1) * 28}`,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5 + i * 0.1,
          },
        });
      });
    },
    { scope: containerRef, dependencies: [useGsap, enableScrub, pathname] }
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "liquid-bg pointer-events-none gsap-parallax",
        tier !== "full" && "liquid-bg--static",
        tier === "minimal" && "liquid-bg--lite",
        isGalleryDetail && "liquid-bg--gallery"
      )}
      aria-hidden
    >
      <div className="blob blob-indigo blob-a" />
      <div className="blob blob-cyan blob-b" />
      <div className="blob blob-rose blob-c" />
    </div>
  );
}
