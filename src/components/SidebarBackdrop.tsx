"use client";

import { cn } from "@/lib/utils";
import useMotionTier from "@/hooks/useMotionTier";
import LiquidGlassSurface from "@/components/ui/liquid-glass-surface";

/**
 * Desktop sidebar inner background — liquid glass with motion-tier fallback.
 */
export default function SidebarBackdrop() {
  const tier = useMotionTier();
  const useFilter = tier === "full";

  if (tier === "minimal") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] glass",
          "bg-gradient-to-br from-indigo-200/20 via-white/15 to-purple-200/15"
        )}
        aria-hidden
      />
    );
  }

  return (
    <LiquidGlassSurface
      className="sidebar-backdrop"
      filterId="sidebar-container-glass"
      useFilter={useFilter}
    />
  );
}
