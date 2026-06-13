/** Blob splash intro — poses, session gate, and timing tokens (see docs/brand-intro/motion_spec.md) */

import type { MotionTier } from "@/hooks/useMotionTier";

export const BLOB_INTRO_STORAGE_KEY = "blob-intro-played";

export const INTRO_TIMING = {
  settleMs: 200,
  bloomDuration: 0.9,
  bloomStagger: 0.12,
  bloomEase: "power3.out",
  bloomOvershoot: 1.06,
  bloomSettleDuration: 0.22,
  releaseDuration: 0.8,
  releaseEase: "power2.inOut",
  revealStagger: 0.08,
  revealDuration: 0.45,
} as const;

export type BlobPose = {
  x: string;
  y: string;
  scale: number;
  rotation: number;
};

/** Stacked at viewport center before bloom */
export const BLOB_CENTER_POSE: BlobPose = {
  x: "42vw",
  y: "42vh",
  scale: 0,
  rotation: 0,
};

/** Matches globals.css @keyframes blob-route-a/b/c at 0% */
export const BLOB_ROUTE_ORIGIN: readonly BlobPose[] = [
  { x: "-18vw", y: "-20vh", scale: 1, rotation: 0 },
  { x: "60vw", y: "6vh", scale: 1.05, rotation: 5 },
  { x: "8vw", y: "58vh", scale: 0.96, rotation: -4 },
] as const;

export const BLOB_ROUTE_SELECTORS = [
  ".blob-route.blob-a",
  ".blob-route.blob-b",
  ".blob-route.blob-c",
] as const;

export type BlobIntroMode = "hold" | "handoff" | "idle";

export function hasIntroBeenPlayed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(BLOB_INTRO_STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

export function markIntroPlayed(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BLOB_INTRO_STORAGE_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function shouldPlayBlobIntro(opts: {
  pathname: string;
  tier: MotionTier;
  reducedMotion: boolean;
  introEnabled: boolean;
}): boolean {
  if (!opts.introEnabled) return false;
  if (opts.pathname !== "/") return false;
  if (opts.tier !== "full") return false;
  if (opts.reducedMotion) return false;
  return !hasIntroBeenPlayed();
}
