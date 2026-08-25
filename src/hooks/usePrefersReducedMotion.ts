"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

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
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Keep the server and first client render identical, then honor the real
  // preference immediately after mount. This avoids reduced-motion hydration drift.
  return mounted && (Boolean(framerReduced) || mediaReduced);
}
