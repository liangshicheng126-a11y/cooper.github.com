"use client";

import { useEffect, useState } from "react";
import { subscribeToMediaQuery } from "@/lib/mediaQuery";

export type MotionTier = "full" | "reduced" | "minimal";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function computeTier(): MotionTier {
  if (typeof window === "undefined") return "full";

  return window.matchMedia(REDUCED_MOTION_QUERY).matches ? "reduced" : "full";
}

export function getMotionTier(): MotionTier {
  return computeTier();
}

export default function useMotionTier(): MotionTier {
  // Keep SSR + first client paint identical; resolve real tier after mount.
  const [tier, setTier] = useState<MotionTier>("full");

  useEffect(() => {
    const update = () => setTier(computeTier());
    update();

    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    return subscribeToMediaQuery(query, update);
  }, []);

  return tier;
}
