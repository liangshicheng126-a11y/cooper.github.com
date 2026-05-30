"use client";

import { useEffect, useState } from "react";

export type MotionTier = "full" | "reduced" | "minimal";

const TIER_QUERIES = {
  minimal:
    "(max-width: 640px), (hover: none), (prefers-reduced-data: reduce)",
  reduced: "(max-width: 768px), (prefers-reduced-motion: reduce)",
} as const;

function computeTier(): MotionTier {
  if (typeof window === "undefined") return "full";

  const minimal = window.matchMedia(TIER_QUERIES.minimal).matches;
  if (minimal) return "minimal";

  const reduced = window.matchMedia(TIER_QUERIES.reduced).matches;
  if (reduced) return "reduced";

  const canHover = window.matchMedia("(hover: hover)").matches;
  if (!canHover) return "reduced";

  return "full";
}

export function getMotionTier(): MotionTier {
  return computeTier();
}

export default function useMotionTier(): MotionTier {
  const [tier, setTier] = useState<MotionTier>("full");

  useEffect(() => {
    const update = () => setTier(computeTier());
    update();

    const mqs = [
      ...TIER_QUERIES.minimal.split(", ").map((q) => window.matchMedia(q.trim())),
      ...TIER_QUERIES.reduced.split(", ").map((q) => window.matchMedia(q.trim())),
      window.matchMedia("(hover: hover)"),
    ];

    mqs.forEach((mq) => mq.addEventListener("change", update));
    return () => mqs.forEach((mq) => mq.removeEventListener("change", update));
  }, []);

  return tier;
}
