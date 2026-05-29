"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const QUERY = "(prefers-reduced-motion: reduce)";

export default function usePrefersReducedMotion(): boolean {
  const framerReduced = useReducedMotion();
  const [mediaReduced, setMediaReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setMediaReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return Boolean(framerReduced) || mediaReduced;
}
