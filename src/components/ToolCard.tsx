"use client";

import GsapGlassHover from "@/components/motion/GsapGlassHover";
import { cn } from "@/lib/utils";

type ToolCardProps = {
  name: string;
  icon: React.ElementType;
  color: string;
  index: number;
  /** When true, entrance is handled by GsapScrollBatch — skip entrance animations */
  batchReveal?: boolean;
  className?: string;
};

export default function ToolCard({
  name,
  icon: Icon,
  color,
  className,
}: ToolCardProps) {
  return (
    <GsapGlassHover
      accent={color}
      variant="tile"
      className={cn(
        "glass p-6 rounded-3xl border-white/5 flex flex-col items-center text-center overflow-hidden cursor-default group",
        className
      )}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 relative z-10"
        style={{
          backgroundColor: `${color}20`,
          boxShadow: `0 0 20px ${color}30`,
        }}
      >
        <div className="transition-transform duration-300 group-hover:-translate-y-1">
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
      </div>

      <p className="text-sm font-medium text-foreground/70 relative z-10">
        {name}
      </p>
    </GsapGlassHover>
  );
}
