/** Shared motion tokens and feature flag for cooperliang.top motion v2 */

export const MOTION_V2_ENABLED =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_MOTION_V2 !== "false";

export const EASE_OUT_EXPO = "power3.out";
export const EASE_SPRING = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.15,
  ui: 0.25,
  section: 0.55,
  page: 0.35,
} as const;

export const STAGGER = {
  tight: 0.06,
  default: 0.1,
  cards: 0.12,
} as const;

export const REVEAL = {
  y: 56,
  x: 32,
  duration: 0.75,
} as const;

export const PARALLAX = {
  y: 48,
  scrub: 1.2,
} as const;

export function shouldUseGsap(reducedMotion: boolean): boolean {
  return MOTION_V2_ENABLED && !reducedMotion;
}
