import type { MotionTier } from "@/hooks/useMotionTier";

export type HoverVariant = "portfolio" | "preview" | "tile" | "avatar";

export type HoverCapability = {
  canTilt: boolean;
  canSpotlight: boolean;
  canParallax: boolean;
  // For reduced tier, keep a softer spotlight and disable parallax.
  parallaxMultiplier: number;
  // For reduced tier, slightly reduce scale/translation amplitudes.
  scaleMultiplier: number;
};

export type HoverPreset = {
  // Card scale at rest/hover, per tier.
  scaleFull: number;
  scaleReduced: number;

  // Tilt / parallax amplitudes.
  tiltDeg: number;
  parallaxPx: number;

  // Spotlight visuals.
  spotlightRadius: number;
  spotlightOpacityFull: number;
  spotlightOpacityReduced: number;

  // Optional targets (GSAP queries by data attributes).
  imageHoverScale?: number;
  imageBaseScale?: number;
  imageParallaxScale?: number;

  overlayOpacityHover?: number;
  overlayOpacityBase?: number;

  contentY?: number;
  arrowX?: number;
  arrowRotDeg?: number;

  badgeScale?: number;
  badgeY?: number;
  badgeRotDeg?: number;
};

export const QUICK_DEFAULTS = {
  durationShort: 0.35,
  durationHover: 0.5,
  easeFast: "power2.out",
  easeInOut: "power2.inOut",
} as const;

export const HOVER_PRESETS: Record<HoverVariant, HoverPreset> = {
  // Project preview cards on /portfolio + homepage preview.
  portfolio: {
    scaleFull: 1.028,
    scaleReduced: 1.02,
    tiltDeg: 7,
    parallaxPx: 14,
    spotlightRadius: 160,
    spotlightOpacityFull: 1,
    spotlightOpacityReduced: 0.7,
    imageHoverScale: 1.09,
    imageBaseScale: 1.08,
    imageParallaxScale: 1,
    overlayOpacityBase: 0.42,
    overlayOpacityHover: 0.28,
    contentY: -10,
    arrowX: 4,
    arrowRotDeg: -45,
  },
  preview: {
    scaleFull: 1.018,
    scaleReduced: 1.012,
    tiltDeg: 5,
    parallaxPx: 10,
    spotlightRadius: 140,
    spotlightOpacityFull: 1,
    spotlightOpacityReduced: 0.65,
    imageHoverScale: 1.06,
    imageBaseScale: 1.05,
    imageParallaxScale: 1,
    overlayOpacityBase: 0.42,
    overlayOpacityHover: 0.3,
    contentY: -6,
    arrowX: 3,
    arrowRotDeg: -40,
  },

  // Tool tiles / about skill tiles.
  tile: {
    scaleFull: 1.04,
    scaleReduced: 1.02,
    tiltDeg: 6,
    parallaxPx: 0,
    spotlightRadius: 120,
    spotlightOpacityFull: 1,
    spotlightOpacityReduced: 0.7,
    imageHoverScale: undefined,
    overlayOpacityBase: 0.35,
    overlayOpacityHover: 0.18,
  },

  // About page avatar.
  avatar: {
    scaleFull: 1.02,
    scaleReduced: 1.008,
    tiltDeg: 5,
    parallaxPx: 12,
    spotlightRadius: 160,
    spotlightOpacityFull: 1,
    spotlightOpacityReduced: 0.75,
    imageHoverScale: 1.16,
    imageBaseScale: 1.14,
    imageParallaxScale: 1,
    overlayOpacityBase: 0.35,
    overlayOpacityHover: 0.2,
    badgeScale: 1.1,
    badgeY: -8,
    badgeRotDeg: 6,
  },
};

export function getHoverCapability(tier: MotionTier): HoverCapability {
  if (tier === "full") {
    return {
      canTilt: true,
      canSpotlight: true,
      canParallax: true,
      parallaxMultiplier: 1,
      scaleMultiplier: 1,
    };
  }

  if (tier === "reduced") {
    return {
      canTilt: false,
      canSpotlight: true,
      canParallax: false,
      parallaxMultiplier: 0,
      scaleMultiplier: 0.98,
    };
  }

  return {
    canTilt: false,
    canSpotlight: false,
    canParallax: false,
    parallaxMultiplier: 0,
    scaleMultiplier: 1,
  };
}

