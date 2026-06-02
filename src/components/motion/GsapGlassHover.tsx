"use client";

import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import { MOTION_V2_ENABLED, shouldUseGsap } from "@/lib/motion";
import {
  getHoverCapability,
  HOVER_PRESETS,
  QUICK_DEFAULTS,
  type HoverPreset,
  type HoverVariant,
} from "@/lib/motion/presets";

type GsapGlassHoverProps = {
  accent: string;
  variant: HoverVariant;
  className?: string;
  children: React.ReactNode;
  /**
   * Called on pointer enter/leave (only when not in `minimal` tier).
   * Useful for components that need to pause/restart extra tweens.
   */
  onHoverChange?: (hovered: boolean) => void;
};

type QuickRefs = {
  scale: gsap.QuickToFunc | null;
  rotateX: gsap.QuickToFunc | null;
  rotateY: gsap.QuickToFunc | null;
  imageScale: gsap.QuickToFunc | null;
  imageX: gsap.QuickToFunc | null;
  imageY: gsap.QuickToFunc | null;
  overlayOpacity: gsap.QuickToFunc | null;
  contentY: gsap.QuickToFunc | null;
  arrowX: gsap.QuickToFunc | null;
  arrowRot: gsap.QuickToFunc | null;
  badgeScale: gsap.QuickToFunc | null;
  badgeY: gsap.QuickToFunc | null;
  badgeRot: gsap.QuickToFunc | null;
  spotlightOpacity: gsap.QuickToFunc | null;
};

const quickNull: QuickRefs = {
  scale: null,
  rotateX: null,
  rotateY: null,
  imageScale: null,
  imageX: null,
  imageY: null,
  overlayOpacity: null,
  contentY: null,
  arrowX: null,
  arrowRot: null,
  badgeScale: null,
  badgeY: null,
  badgeRot: null,
  spotlightOpacity: null,
};

export default function GsapGlassHover({
  accent,
  variant,
  className,
  children,
  onHoverChange,
}: GsapGlassHoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<QuickRefs>({ ...quickNull });
  const hoveredRef = useRef(false);

  const tier = useMotionTier();
  const reduced = usePrefersReducedMotion();
  const gsapActive = shouldUseGsap(reduced);

  const preset = HOVER_PRESETS[variant];
  const capability = useMemo(() => getHoverCapability(tier), [tier]);

  // Minimal tier: no transform/spotlight; keep a static accent border.
  if (tier === "minimal") {
    return (
      <div
        className={cn("relative cursor-default", className)}
        style={{ borderColor: `${accent}55` }}
      >
        {children}
      </div>
    );
  }

  const interactive = gsapActive;
  const tiltActive = interactive && capability.canTilt;
  const spotlightActive = interactive && capability.canSpotlight;

  const baseScale = 1;
  const scaleHover =
    tier === "full" ? preset.scaleFull : preset.scaleReduced;

  const imageBaseScale = preset.imageBaseScale ?? 1;
  const imageHoverScale = preset.imageHoverScale ?? imageBaseScale;

  const overlayOpacityBase = preset.overlayOpacityBase ?? 0.35;
  const overlayOpacityHover = preset.overlayOpacityHover ?? overlayOpacityBase;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const card =
        (root.querySelector("[data-gsh-card]") as HTMLElement | null) ??
        root;
      const image = root.querySelector(
        "[data-gsh-image]"
      ) as HTMLElement | null;
      const overlay = root.querySelector(
        "[data-gsh-overlay]"
      ) as HTMLElement | null;
      const content = root.querySelector(
        "[data-gsh-content]"
      ) as HTMLElement | null;
      const arrow = root.querySelector(
        "[data-gsh-arrow]"
      ) as HTMLElement | null;
      const badge = root.querySelector(
        "[data-gsh-badge]"
      ) as HTMLElement | null;

      const spotlight = spotlightRef.current;

      // Reset inline styles once before wiring quickTo.
      gsap.set(card, { scale: baseScale, rotateX: 0, rotateY: 0 });
      if (tiltActive) {
        gsap.set(card, {
          transformPerspective: 900,
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        });
      }

      if (image) gsap.set(image, { scale: imageBaseScale, x: 0, y: 0 });
      if (overlay) gsap.set(overlay, { opacity: overlayOpacityBase });
      if (content) gsap.set(content, { y: 0 });
      if (arrow) gsap.set(arrow, { x: 0, rotation: 0 });
      if (badge) gsap.set(badge, { scale: 1, y: 0, rotation: 0 });

      if (spotlight) {
        gsap.set(spotlight, { opacity: 0 });
        // Default spotlight center.
        spotlight.style.setProperty("--gsh-spot-x", "50%");
        spotlight.style.setProperty("--gsh-spot-y", "50%");
      }

      if (!interactive) return;

      const q = quickRef.current;
      q.scale = gsap.quickTo(card, "scale", {
        duration: QUICK_DEFAULTS.durationHover,
        ease: QUICK_DEFAULTS.easeFast,
      });
      q.rotateX = tiltActive
        ? gsap.quickTo(card, "rotateX", {
            duration: QUICK_DEFAULTS.durationShort,
            ease: QUICK_DEFAULTS.easeFast,
          })
        : null;
      q.rotateY = tiltActive
        ? gsap.quickTo(card, "rotateY", {
            duration: QUICK_DEFAULTS.durationShort,
            ease: QUICK_DEFAULTS.easeFast,
          })
        : null;

      if (image) {
        q.imageScale = gsap.quickTo(image, "scale", {
          duration: QUICK_DEFAULTS.durationHover,
          ease: QUICK_DEFAULTS.easeFast,
        });
        q.imageX = tiltActive
          ? gsap.quickTo(image, "x", {
              duration: QUICK_DEFAULTS.durationShort,
              ease: QUICK_DEFAULTS.easeFast,
            })
          : null;
        q.imageY = tiltActive
          ? gsap.quickTo(image, "y", {
              duration: QUICK_DEFAULTS.durationShort,
              ease: QUICK_DEFAULTS.easeFast,
            })
          : null;
      }

      if (overlay) {
        q.overlayOpacity = gsap.quickTo(overlay, "opacity", {
          duration: QUICK_DEFAULTS.durationShort,
          ease: QUICK_DEFAULTS.easeFast,
        });
      }
      if (content) {
        q.contentY = gsap.quickTo(content, "y", {
          duration: QUICK_DEFAULTS.durationShort,
          ease: QUICK_DEFAULTS.easeFast,
        });
      }
      if (arrow) {
        q.arrowX = gsap.quickTo(arrow, "x", {
          duration: QUICK_DEFAULTS.durationShort,
          ease: QUICK_DEFAULTS.easeFast,
        });
        q.arrowRot = gsap.quickTo(arrow, "rotation", {
          duration: QUICK_DEFAULTS.durationShort,
          ease: QUICK_DEFAULTS.easeFast,
        });
      }
      if (badge) {
        q.badgeScale = gsap.quickTo(badge, "scale", {
          duration: QUICK_DEFAULTS.durationShort,
          ease: QUICK_DEFAULTS.easeFast,
        });
        q.badgeY = gsap.quickTo(badge, "y", {
          duration: QUICK_DEFAULTS.durationShort,
          ease: QUICK_DEFAULTS.easeFast,
        });
        q.badgeRot = gsap.quickTo(badge, "rotation", {
          duration: QUICK_DEFAULTS.durationShort,
          ease: QUICK_DEFAULTS.easeFast,
        });
      }
      if (spotlight) {
        q.spotlightOpacity = gsap.quickTo(spotlight, "opacity", {
          duration: QUICK_DEFAULTS.durationShort,
          ease: QUICK_DEFAULTS.easeFast,
        });
      }
    },
    { scope: rootRef, dependencies: [interactive, tier, variant] }
  );

  const applyHover = () => {
    if (!interactive) return;
    hoveredRef.current = true;
    onHoverChange?.(true);

    const q = quickRef.current;
    q.scale?.(scaleHover);
    q.overlayOpacity?.(overlayOpacityHover);
    q.imageScale?.(imageHoverScale);
    q.contentY?.(preset.contentY ?? 0);
    q.arrowX?.(preset.arrowX ?? 0);
    q.arrowRot?.(preset.arrowRotDeg ?? 0);
    q.badgeScale?.(preset.badgeScale ?? 1);
    q.badgeY?.(preset.badgeY ?? 0);
    q.badgeRot?.(preset.badgeRotDeg ?? 0);

    if (spotlightRef.current && spotlightActive) {
      q.spotlightOpacity?.(
        tier === "full" ? preset.spotlightOpacityFull : preset.spotlightOpacityReduced
      );
    }
  };

  const resetHover = () => {
    hoveredRef.current = false;
    onHoverChange?.(false);

    const q = quickRef.current;
    q.scale?.(baseScale);
    q.rotateX?.(0);
    q.rotateY?.(0);
    q.imageScale?.(imageBaseScale);
    q.imageX?.(0);
    q.imageY?.(0);
    q.overlayOpacity?.(overlayOpacityBase);
    q.contentY?.(0);
    q.arrowX?.(0);
    q.arrowRot?.(0);
    q.badgeScale?.(1);
    q.badgeY?.(0);
    q.badgeRot?.(0);
    q.spotlightOpacity?.(0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !hoveredRef.current) return;
    const root = rootRef.current;
    if (!root) return;

    const card =
      (root.querySelector("[data-gsh-card]") as HTMLElement | null) ?? root;

    const rect = card.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    if (tiltActive) {
      quickRef.current.rotateX?.(-ny * preset.tiltDeg);
      quickRef.current.rotateY?.(nx * preset.tiltDeg);

      const image = root.querySelector(
        "[data-gsh-image]"
      ) as HTMLElement | null;
      if (image) {
        const m = capability.parallaxMultiplier;
        const par = preset.parallaxPx * (preset.imageParallaxScale ?? 1) * m;
        quickRef.current.imageX?.(-nx * par);
        quickRef.current.imageY?.(-ny * par);
      }
    }

    if (spotlightActive && spotlightRef.current) {
      const spotX = e.clientX - rect.left;
      const spotY = e.clientY - rect.top;
      spotlightRef.current.style.setProperty("--gsh-spot-x", `${spotX}px`);
      spotlightRef.current.style.setProperty("--gsh-spot-y", `${spotY}px`);
    }
  };

  const spotlightLayers = (
    <>
      <div
        ref={spotlightRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 gsap-glass-hover__spotlight"
        style={{
          opacity: 0,
          background: `radial-gradient(${preset.spotlightRadius}px circle at var(--gsh-spot-x, 50%) var(--gsh-spot-y, 50%), ${accent}28, transparent 72%)`,
          ["--gsh-spot-x" as string]: "50%",
          ["--gsh-spot-y" as string]: "50%",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] border transition-opacity duration-300 gsap-glass-hover__border"
        style={{
          opacity: 0,
          borderColor: `${accent}55`,
          // We keep border behind the gradient for subtle edges.
          transition: "opacity 180ms ease-out",
        }}
      />
    </>
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        "gsap-glass-hover relative cursor-default",
        className,
        gsapActive && MOTION_V2_ENABLED && "gsap-glass-hover--active"
      )}
      onMouseEnter={interactive ? applyHover : undefined}
      onMouseLeave={interactive ? resetHover : undefined}
      onMouseMove={interactive ? handleMouseMove : undefined}
    >
      {spotlightActive ? spotlightLayers : null}
      {children}
    </div>
  );
}

