"use client";

import { cn } from "@/lib/utils";
import useMotionTier from "@/hooks/useMotionTier";

/**
 * Desktop sidebar: frosted glass with gradient mesh + soft color blobs.
 * Matches reference mockup (blur + pastel bleed), not SVG displacement.
 */
export default function SidebarBackdrop() {
  const tier = useMotionTier();
  const animated = tier === "full";

  return (
    <div
      className={cn(
        "sidebar-backdrop absolute inset-0 rounded-[inherit] pointer-events-none",
        animated && "sidebar-backdrop--animated",
        tier === "minimal" && "sidebar-backdrop--static"
      )}
      aria-hidden
    >
      <div className="sidebar-backdrop__mesh" />
      <div className="sidebar-backdrop__blob sidebar-backdrop__blob--a" />
      <div className="sidebar-backdrop__blob sidebar-backdrop__blob--b" />
      <div className="sidebar-backdrop__blob sidebar-backdrop__blob--c" />
      <div className="sidebar-backdrop__sheen" />
    </div>
  );
}
