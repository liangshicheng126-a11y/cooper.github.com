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
};

export default function GsapProjectCardHover({
  accent,
  image,
  category,
  title,
  viewProject,
  className,
  variant = "portfolio",
}: GsapProjectCardHoverProps) {
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
        <div data-gsh-overlay className="absolute inset-0 bg-black/40" aria-hidden />

        <div
          data-gsh-content
          className="absolute inset-0 z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-end"
        >
          <span className="text-white/60 text-sm font-medium mb-2 block uppercase tracking-widest">
            {category}
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {title}
          </h3>
          <div className="inline-flex items-center space-x-3 text-white font-semibold">
            <span>{viewProject}</span>
            <div data-gsh-arrow className="p-3 rounded-full bg-white/20 text-white">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </GsapGlassHover>
  );
}
