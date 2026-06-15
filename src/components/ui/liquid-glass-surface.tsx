"use client";

import { cn } from "@/lib/utils";
import { GlassFilter } from "@/components/ui/glass-filter";

const LIQUID_SHADOW =
  "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.55),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.5),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.35),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.35),inset_0_0_6px_6px_rgba(0,0,0,0.08),inset_0_0_2px_2px_rgba(0,0,0,0.04),0_0_20px_rgba(255,255,255,0.12)]";

interface LiquidGlassSurfaceProps {
  className?: string;
  filterId?: string;
  /** SVG displacement filter — disable on reduced/minimal tiers */
  useFilter?: boolean;
}

export default function LiquidGlassSurface({
  className,
  filterId = "container-glass",
  useFilter = true,
}: LiquidGlassSurfaceProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 isolate overflow-hidden rounded-[inherit]",
        className
      )}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 rounded-[inherit] bg-gradient-to-br from-indigo-200/30 via-white/15 to-purple-200/25",
          LIQUID_SHADOW
        )}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-[inherit] overflow-hidden",
          !useFilter && "bg-white/12 backdrop-blur-xl backdrop-saturate-150"
        )}
        style={
          useFilter
            ? {
                backdropFilter: `url("#${filterId}")`,
                WebkitBackdropFilter: `url("#${filterId}")`,
              }
            : undefined
        }
      />
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/30 via-white/5 to-white/15" />
      {useFilter ? <GlassFilter id={filterId} /> : null}
    </div>
  );
}
