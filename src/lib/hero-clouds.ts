/** Feature flag: homepage hero cloud tunnel (Three.js). Set NEXT_PUBLIC_HERO_CLOUDS=false to disable. */

export const HERO_CLOUDS_ENABLED =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_HERO_CLOUDS !== "false";

export const HERO_CLOUD_TUNNEL_DEPTH = 8000;

export function heroCloudCountForTier(tier: "full" | "reduced" | "minimal"): number {
  if (tier === "full") return 3200;
  if (tier === "reduced") return 1400;
  return 0;
}

/** 0–1：Hero 在视口内时保持可见，滚出后渐隐 */
export function heroCloudVisibility(sentinelBottom: number, viewportHeight: number): number {
  const vh = Math.max(viewportHeight, 1);
  const fadeStart = vh * 0.92;
  const fadeEnd = vh * 0.08;
  if (sentinelBottom >= fadeStart) return 1;
  if (sentinelBottom <= fadeEnd) return 0;
  return (sentinelBottom - fadeEnd) / (fadeStart - fadeEnd);
}
