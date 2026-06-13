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

export function getBlobCenterPosePixels(): { x: number; y: number } {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  const blobSize = Math.min(window.innerWidth * 0.56, 760);
  return {
    x: (window.innerWidth - blobSize) / 2,
    y: (window.innerHeight - blobSize) / 2,
  };
}

export function getPagesBasePath(): string {
  const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
  const isUserSiteRepo = repository.endsWith(".github.io");
  const useRepoPrefix =
    Boolean(process.env.GITHUB_ACTIONS) &&
    Boolean(repository) &&
    !isUserSiteRepo &&
    process.env.GITHUB_PAGES_CUSTOM_DOMAIN_ROOT !== "true";
  return useRepoPrefix ? `/${repository}` : "";
}

export function getBlobIntroEarlyGateScript(
  basePath: string,
  introEnabled: boolean
): string {
  const storageKey = BLOB_INTRO_STORAGE_KEY;
  const escapedBase = basePath.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `
try {
  if (!${introEnabled}) throw 0;
  if (sessionStorage.getItem("${storageKey}") === "1") throw 0;
  if (window.matchMedia("(max-width:640px),(hover:none)").matches) throw 0;
  if (!window.matchMedia("(hover:hover)").matches) throw 0;
  if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) throw 0;
  var base = "${escapedBase}";
  var path = location.pathname;
  var isHome = path === "/" || path === base + "/" || (base && path === base);
  if (!isHome) throw 0;
  document.documentElement.setAttribute("data-intro-active", "");
  document.documentElement.setAttribute("data-intro-needed", "");
} catch (e) {}
`.trim();
}

export function readIntroNeededFromDom(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.hasAttribute("data-intro-needed");
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
