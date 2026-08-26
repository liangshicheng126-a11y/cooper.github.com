/** First-visit screening-room intro gate, timing, and rollback helpers. */

import type { MotionTier } from "@/hooks/useMotionTier";

export const OPENING_INTRO_STORAGE_KEY = "cooper-opening-sequence-v3";

export const INTRO_TIMING = {
  signalDuration: 0.36,
  lineDuration: 1.12,
  glyphDuration: 0.62,
  glyphStagger: 0.05,
  holdDuration: 0.18,
  releaseDuration: 0.34,
  revealDuration: 0.52,
  failsafeMs: 6200,
} as const;

export type OpeningIntroMode = "hold" | "handoff" | "idle";

export function isOpeningIntroForced(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("intro") === "1";
}

export function hasIntroBeenPlayed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(OPENING_INTRO_STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

export function markIntroPlayed(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(OPENING_INTRO_STORAGE_KEY, "1");
  } catch {
    /* Private browsing and quota failures must never block the page. */
  }
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

export function getOpeningIntroEarlyGateScript(
  basePath: string,
  introEnabled: boolean
): string {
  const storageKey = OPENING_INTRO_STORAGE_KEY;
  const escapedBase = basePath.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

  return `
try {
  if (!${introEnabled}) throw 0;
  var forced = new URLSearchParams(location.search).get("intro") === "1";
  if (!forced && sessionStorage.getItem("${storageKey}") === "1") throw 0;
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

export function shouldPlayOpeningIntro(opts: {
  pathname: string;
  tier: MotionTier;
  reducedMotion: boolean;
  introEnabled: boolean;
}): boolean {
  if (!opts.introEnabled) return false;
  if (opts.pathname !== "/") return false;
  if (opts.tier !== "full") return false;
  if (opts.reducedMotion) return false;
  return isOpeningIntroForced() || !hasIntroBeenPlayed();
}
