"use client";

import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import GsapGlassHover from "@/components/motion/GsapGlassHover";

type HoverVariant = "portfolio" | "preview";

type GsapProjectCardHoverProps = {
  accent: string;
  image: string;
  category: string;
  title: string;
  viewProject: string;
  className?: string;
  variant?: HoverVariant;
  /** Stronger bottom scrim for photo-heavy cover images (e.g. P2 hub picker). */
  imageOverlay?: "default" | "gradient";
};

export default function GsapProjectCardHover({
  accent,
  image,
  category,
  title,
  viewProject,
  className,
  variant = "portfolio",
  imageOverlay = "default",
}: GsapProjectCardHoverProps) {
  const photoCover = imageOverlay === "gradient";

  return (
    <GsapGlassHover
      accent={accent}
      variant={variant}
      className={cn(
        "h-full w-full overflow-hidden rounded-3xl glass border-white/10",
        className
      )}
    >
      <div className="relative block h-full overflow-hidden rounded-[inherit]">
        <div
          data-gsh-image
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden
        />
        <div
          data-gsh-overlay
          className={cn(
            "absolute inset-0",
            photoCover
              ? "bg-gradient-to-t from-slate-950/95 via-slate-900/65 to-slate-900/15"
              : "bg-black/40",
          )}
          aria-hidden
        />

        <div
          data-gsh-content
          className="absolute inset-0 z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-end min-h-0"
        >
          <span
            className={cn(
              "text-sm font-semibold mb-2 block uppercase tracking-widest",
              photoCover ? "drop-shadow-sm" : "text-white/60 font-medium",
            )}
            style={photoCover ? { color: accent } : undefined}
          >
            {category}
          </span>
          <h3
            className={cn(
              "text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 leading-tight",
              photoCover
                ? "text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]"
                : "text-white",
            )}
          >
            {title}
          </h3>
          <div
            className={cn(
              "inline-flex items-center space-x-3 font-semibold",
              photoCover
                ? "text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.75)]"
                : "text-white",
            )}
          >
            <span>{viewProject}</span>
            <div
              data-gsh-arrow
              className={cn(
                "p-3 rounded-full text-white",
                photoCover
                  ? "bg-white/15 border border-white/25 backdrop-blur-sm"
                  : "bg-white/20",
              )}
            >
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </GsapGlassHover>
  );
}
