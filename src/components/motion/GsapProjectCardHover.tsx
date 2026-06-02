"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { MOTION_V2_ENABLED, shouldUseGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

type HoverVariant = "portfolio" | "preview";

type GsapProjectCardHoverProps = {
  accent: string;
  image: string;
  category: string;
  title: string;
  viewProject: string;
  className?: string;
  variant?: HoverVariant;
};

type QuickRefs = {
  scale: gsap.QuickToFunc | null;
  rotateX: gsap.QuickToFunc | null;
  rotateY: gsap.QuickToFunc | null;
  imgScale: gsap.QuickToFunc | null;
  imgX: gsap.QuickToFunc | null;
  imgY: gsap.QuickToFunc | null;
  overlayOpacity: gsap.QuickToFunc | null;
  contentY: gsap.QuickToFunc | null;
  arrowX: gsap.QuickToFunc | null;
  arrowRot: gsap.QuickToFunc | null;
};

const HOVER = {
  portfolio: { scale: 1.028, imgScale: 1.09, tilt: 7, parallax: 14, contentY: -10 },
  preview: { scale: 1.018, imgScale: 1.06, tilt: 5, parallax: 10, contentY: -6 },
} as const;

export default function GsapProjectCardHover({
  accent,
  image,
  category,
  title,
  viewProject,
  className,
  variant = "portfolio",
}: GsapProjectCardHoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const quick = useRef<QuickRefs>({
    scale: null,
    rotateX: null,
    rotateY: null,
    imgScale: null,
    imgX: null,
    imgY: null,
    overlayOpacity: null,
    contentY: null,
    arrowX: null,
    arrowRot: null,
  });
  const hoveredRef = useRef(false);

  const tier = useMotionTier();
  const reduced = usePrefersReducedMotion();
  const gsapActive = shouldUseGsap(reduced);
  const interactive = gsapActive && tier !== "minimal";
  const tiltActive = interactive && tier === "full";
  const spotlightActive = interactive && tier === "full";
  const reducedSpotlight = gsapActive && tier === "reduced";
  const preset = HOVER[variant];

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card || !interactive) return;

      const q = quick.current;
      const hoverScale = tier === "full" ? preset.scale : preset.scale - 0.008;

      q.scale = gsap.quickTo(card, "scale", { duration: 0.45, ease: "power2.out" });
      card.dataset.hoverScale = String(hoverScale);

      if (tiltActive) {
        gsap.set(card, { transformPerspective: 900, transformStyle: "preserve-3d" });
        q.rotateX = gsap.quickTo(card, "rotateX", { duration: 0.38, ease: "power2.out" });
        q.rotateY = gsap.quickTo(card, "rotateY", { duration: 0.38, ease: "power2.out" });
      }

      if (imageRef.current) {
        gsap.set(imageRef.current, { scale: 1.08, force3D: true });
        q.imgScale = gsap.quickTo(imageRef.current, "scale", {
          duration: 0.65,
          ease: "power2.out",
        });
        if (tiltActive) {
          q.imgX = gsap.quickTo(imageRef.current, "x", { duration: 0.42, ease: "power2.out" });
          q.imgY = gsap.quickTo(imageRef.current, "y", { duration: 0.42, ease: "power2.out" });
        }
      }

      if (overlayRef.current) {
        gsap.set(overlayRef.current, { opacity: 0.42 });
        q.overlayOpacity = gsap.quickTo(overlayRef.current, "opacity", {
          duration: 0.35,
          ease: "power2.out",
        });
      }

      if (contentRef.current) {
        q.contentY = gsap.quickTo(contentRef.current, "y", {
          duration: 0.42,
          ease: "power2.out",
        });
      }

      if (arrowRef.current) {
        q.arrowX = gsap.quickTo(arrowRef.current, "x", { duration: 0.35, ease: "power2.out" });
        q.arrowRot = gsap.quickTo(arrowRef.current, "rotation", {
          duration: 0.35,
          ease: "power2.out",
        });
      }

      return () => {
        Object.keys(q).forEach((key) => {
          q[key as keyof QuickRefs] = null;
        });
      };
    },
    { scope: rootRef, dependencies: [interactive, tiltActive, tier, variant] }
  );

  const resetHover = () => {
    hoveredRef.current = false;
    const q = quick.current;

    q.scale?.(1);
    q.rotateX?.(0);
    q.rotateY?.(0);
    q.imgScale?.(1.08);
    q.imgX?.(0);
    q.imgY?.(0);
    q.overlayOpacity?.(0.42);
    q.contentY?.(0);
    q.arrowX?.(0);
    q.arrowRot?.(0);

    if (spotlightRef.current) {
      spotlightRef.current.style.setProperty("--spot-opacity", "0");
    }
    if (tier === "minimal" && rootRef.current) {
      rootRef.current.style.removeProperty("border-color");
    }
  };

  const applyHover = () => {
    hoveredRef.current = true;
    const q = quick.current;
    const card = cardRef.current;
    const hoverScale = Number(card?.dataset.hoverScale ?? preset.scale);

    q.scale?.(hoverScale);
    q.imgScale?.(preset.imgScale);
    q.overlayOpacity?.(0.28);
    q.contentY?.(preset.contentY);
    q.arrowX?.(4);
    q.arrowRot?.(-45);

    if (spotlightRef.current) {
      spotlightRef.current.style.setProperty("--spot-opacity", "1");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !hoveredRef.current) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    const q = quick.current;

    if (tiltActive) {
      q.rotateX?.(-ny * preset.tilt);
      q.rotateY?.(nx * preset.tilt);
      q.imgX?.(-nx * preset.parallax);
      q.imgY?.(-ny * preset.parallax);
    }

    if (spotlightActive && spotlightRef.current) {
      spotlightRef.current.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      spotlightRef.current.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    }
  };

  const handleMouseEnter = () => {
    if (!interactive) {
      if (tier === "minimal") {
        rootRef.current?.style.setProperty("border-color", `${accent}33`);
      }
      return;
    }
    cardRef.current?.style.setProperty("will-change", "transform");
    applyHover();
  };

  const handleMouseLeave = () => {
    cardRef.current?.style.setProperty("will-change", "auto");
    resetHover();
  };

  const spotlightLayers = (spotlightActive || reducedSpotlight) && (
    <>
      <div
        ref={spotlightRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: "var(--spot-opacity, 0)",
          background: spotlightActive
            ? `radial-gradient(140px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${accent}24, transparent 72%)`
            : `radial-gradient(ellipse at 50% 40%, ${accent}16, transparent 70%)`,
          ["--spot-x" as string]: "50%",
          ["--spot-y" as string]: "50%",
          ["--spot-opacity" as string]: "0",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] border transition-opacity duration-300"
        style={{
          opacity: "var(--spot-opacity, 0)",
          borderColor: `${accent}55`,
        }}
      />
    </>
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-full w-full overflow-visible",
        gsapActive && MOTION_V2_ENABLED && "gsap-project-card",
        variant === "preview" && "gsap-project-card--preview",
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={interactive ? handleMouseMove : undefined}
    >
      <div
        ref={cardRef}
        className={cn(
          "relative h-full w-full overflow-hidden rounded-[inherit] glass border-white/10",
          className,
        )}
      >
        {spotlightLayers}

        <div className="relative block h-full overflow-hidden rounded-[inherit]">
          <div
            ref={imageRef}
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${image})` }}
            aria-hidden
          />
          <div ref={overlayRef} className="absolute inset-0 bg-black/40" aria-hidden />

          <div
            ref={contentRef}
            className="absolute inset-0 z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-end will-change-transform"
          >
            <span className="text-white/60 text-sm font-medium mb-2 block uppercase tracking-widest">
              {category}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              {title}
            </h3>
            <div className="inline-flex items-center space-x-3 text-white font-semibold">
              <span>{viewProject}</span>
              <div
                ref={arrowRef}
                className="p-3 rounded-full bg-white/20 text-white will-change-transform"
              >
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
