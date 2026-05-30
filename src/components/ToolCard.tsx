"use client";

import GlassHoverCard from "@/components/GlassHoverCard";

type ToolCardProps = {
  name: string;
  icon: React.ElementType;
  color: string;
  index: number;
  /** When true, entrance is handled by GsapScrollBatch — skip Framer whileInView */
  batchReveal?: boolean;
};

export default function ToolCard({
  name,
  icon: Icon,
  color,
  index,
  batchReveal = false,
}: ToolCardProps) {
  const motionProps = batchReveal
    ? {}
    : {
        initial: { opacity: 0, y: 28, scale: 0.92 } as const,
        whileInView: { opacity: 1, y: 0, scale: 1 } as const,
        viewport: { once: true, amount: 0.3 } as const,
        transition: {
          duration: 0.48,
          delay: index * 0.07,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

  return (
    <GlassHoverCard
      {...motionProps}
      accent={color}
      hoverScale={1.06}
      className="p-6 rounded-3xl flex flex-col items-center text-center"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
        style={{
          backgroundColor: `${color}20`,
          boxShadow: `0 0 20px ${color}30`,
        }}
      >
        <div className="transition-transform duration-300 group-hover:-translate-y-1">
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
      </div>

      <p className="text-sm font-medium text-foreground/70">{name}</p>
    </GlassHoverCard>
  );
}
