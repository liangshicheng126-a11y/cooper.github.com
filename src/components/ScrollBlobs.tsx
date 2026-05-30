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

const BLOBS = [
  { routeClass: "blob-a", colorClass: "blob-indigo" },
  { routeClass: "blob-b", colorClass: "blob-cyan" },
  { routeClass: "blob-c", colorClass: "blob-rose" },
] as const;

const INFLUENCE_RADIUS = 420;
const MAX_MAGNET = 22;
const MAX_STRETCH = 7;

/** Base border-radius corners for mouse deformation (matches shape keyframe 0%). */
const BLOB_RADIUS_BASE = [
  [39, 61, 48, 52, 43, 37, 63, 57],
  [46, 54, 36, 64, 58, 39, 61, 42],
  [58, 42, 52, 48, 48, 61, 39, 52],
] as const;

function clampRadius(value: number) {
  return Math.min(72, Math.max(28, value));
}

function formatRadius(values: readonly number[]) {
  const [a, b, c, d, e, f, g, h] = values;
  return `${a}% ${b}% ${c}% ${d}% / ${e}% ${f}% ${g}% ${h}%`;
}

function deformRadius(
  base: readonly number[],
  nx: number,
  ny: number,
  strength: number
) {
  const stretch = strength * MAX_STRETCH;
  const cornerWeights = [
    Math.max(0, -nx) * Math.max(0, -ny),
    Math.max(0, nx) * Math.max(0, -ny),
    Math.max(0, nx) * Math.max(0, ny),
    Math.max(0, -nx) * Math.max(0, ny),
  ];

  const [a, b, c, d, e, f, g, h] = base;
  return formatRadius([
    clampRadius(a + cornerWeights[0] * stretch),
    clampRadius(b + cornerWeights[1] * stretch),
    clampRadius(c + cornerWeights[2] * stretch),
    clampRadius(d + cornerWeights[3] * stretch),
    clampRadius(e + cornerWeights[0] * stretch * 0.75),
    clampRadius(f + cornerWeights[1] * stretch * 0.75),
    clampRadius(g + cornerWeights[2] * stretch * 0.75),
    clampRadius(h + cornerWeights[3] * stretch * 0.75),
  ]);
}

export default function ScrollBlobs() {
  const pathname = usePathname() ?? "";
  const isGalleryDetail = /^\/portfolio\/p[13]\/?$/.test(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const tier = useMotionTier();
  const useGsap = shouldUseGsap(reduced);
  const enableScrub = useGsap && MOTION_V2_ENABLED && tier === "full";
  const enableMouse =
    useGsap && MOTION_V2_ENABLED && tier === "full" && !reduced;

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root || !useGsap || !MOTION_V2_ENABLED) return;

      const wraps = root.querySelectorAll(".blob-scroll-wrap");
      const scrollTriggers: ScrollTrigger[] = [];

      if (enableScrub) {
        wraps.forEach((wrap, i) => {
          const st = gsap.to(wrap, {
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
          const trigger = st.scrollTrigger;
          if (trigger) scrollTriggers.push(trigger);
        });
      }

      return () => {
        scrollTriggers.forEach((trigger) => trigger.kill());
      };
    },
    { scope: containerRef, dependencies: [useGsap, enableScrub, pathname] }
  );

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root || !enableMouse) return;
      if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
        return;
      }

      const visuals = Array.from(root.querySelectorAll<HTMLElement>(".blob-visual"));
      if (!visuals.length) return;

      type BlobDriver = {
        el: HTMLElement;
        base: readonly number[];
        xTo: gsap.QuickToFunc;
        yTo: gsap.QuickToFunc;
        scaleTo: gsap.QuickToFunc;
        setRadius: (value: string) => void;
        active: boolean;
      };

      const drivers: BlobDriver[] = visuals.map((el, i) => ({
        el,
        base: BLOB_RADIUS_BASE[i] ?? BLOB_RADIUS_BASE[0],
        xTo: gsap.quickTo(el, "x", { duration: 0.35, ease: "power2.out" }),
        yTo: gsap.quickTo(el, "y", { duration: 0.55, ease: "power2.out" }),
        scaleTo: gsap.quickTo(el, "scale", { duration: 0.4, ease: "power2.out" }),
        setRadius: (value: string) => {
          gsap.to(el, {
            borderRadius: value,
            duration: 0.45,
            ease: "power2.out",
            overwrite: "auto",
          });
        },
        active: false,
      }));

      let rafId = 0;
      let mouseX = 0;
      let mouseY = 0;
      let mouseActive = false;

      const resetBlob = (driver: BlobDriver) => {
        if (!driver.active) return;
        driver.active = false;
        driver.el.style.animationPlayState = "";
        driver.xTo(0);
        driver.yTo(0);
        driver.scaleTo(1);
        gsap.set(driver.el, { clearProps: "borderRadius" });
      };

      const flush = () => {
        rafId = 0;
        if (!mouseActive) {
          drivers.forEach(resetBlob);
          return;
        }

        drivers.forEach((driver) => {
          const rect = driver.el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = mouseX - cx;
          const dy = mouseY - cy;
          const dist = Math.hypot(dx, dy);

          if (dist >= INFLUENCE_RADIUS || dist < 1) {
            if (driver.active) resetBlob(driver);
            return;
          }

          const influence = 1 - dist / INFLUENCE_RADIUS;
          const nx = dx / dist;
          const ny = dy / dist;

          if (!driver.active) {
            driver.active = true;
            driver.el.style.animationPlayState = "paused";
          }

          driver.xTo(nx * MAX_MAGNET * influence);
          driver.yTo(ny * MAX_MAGNET * influence);
          driver.scaleTo(1 + influence * 0.04);
          driver.setRadius(deformRadius(driver.base, nx, ny, influence));
        });
      };

      const scheduleFlush = () => {
        if (!rafId) rafId = requestAnimationFrame(flush);
      };

      const handleMouseMove = (event: MouseEvent) => {
        mouseActive = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
        scheduleFlush();
      };

      const handleMouseLeave = () => {
        mouseActive = false;
        scheduleFlush();
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
        if (rafId) cancelAnimationFrame(rafId);
        drivers.forEach((driver) => {
          gsap.set(driver.el, {
            x: 0,
            y: 0,
            scale: 1,
            clearProps: "borderRadius,transform",
          });
          driver.el.style.animationPlayState = "";
        });
      };
    },
    { scope: containerRef, dependencies: [enableMouse, pathname] }
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "liquid-bg pointer-events-none gsap-parallax",
        tier === "minimal" && "liquid-bg--static",
        tier === "minimal" && "liquid-bg--lite",
        isGalleryDetail && "liquid-bg--gallery"
      )}
      aria-hidden
    >
      {BLOBS.map((blob, i) => (
        <div key={blob.routeClass} className="blob-scroll-wrap" data-blob-index={i}>
          <div className={cn("blob-route", blob.routeClass)}>
            <div className={cn("blob blob-visual", blob.colorClass)} />
          </div>
        </div>
      ))}
    </div>
  );
}
