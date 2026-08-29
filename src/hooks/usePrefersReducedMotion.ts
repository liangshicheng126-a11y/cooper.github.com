"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { subscribeToMediaQuery } from "@/lib/mediaQuery";

const QUERY = "(prefers-reduced-motion: reduce)";

export default function usePrefersReducedMotion(): boolean {
  const framerReduced = useReducedMotion();
  const [mediaReduced, setMediaReduced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => {
      setMediaReduced(mq.matches);
      setMounted(true);
    };
    update();
    return subscribeToMediaQuery(mq, update);
  }, []);

  // Keep the server and first client render identical, then honor the real
  // preference immediately after mount. This avoids reduced-motion hydration drift.
  return mounted && (Boolean(framerReduced) || mediaReduced);
}
