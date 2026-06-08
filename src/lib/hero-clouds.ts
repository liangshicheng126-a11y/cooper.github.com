/** Feature flag: homepage hero cloud tunnel (Three.js). Set NEXT_PUBLIC_HERO_CLOUDS=false to disable. */

export const HERO_CLOUDS_ENABLED =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_HERO_CLOUDS !== "false";

export const HERO_CLOUD_TUNNEL_DEPTH = 8000;

export function heroCloudCountForTier(tier: "full" | "reduced" | "minimal"): number {
  if (tier === "full") return 5500;
  if (tier === "reduced") return 2200;
  return 0;
}
