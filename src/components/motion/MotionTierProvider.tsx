"use client";

import { useEffect } from "react";
import useMotionTier from "@/hooks/useMotionTier";

export default function MotionTierProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const tier = useMotionTier();

  useEffect(() => {
    document.documentElement.dataset.motionTier = tier;
    return () => {
      delete document.documentElement.dataset.motionTier;
    };
  }, [tier]);

  return <>{children}</>;
}
