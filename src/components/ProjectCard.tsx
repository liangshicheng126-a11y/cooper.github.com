"use client";

/**
 * ProjectCard — 精选作品卡片
 * Link 作为最外层，避免 3D 倾斜 transform 导致首次点击失效
 */

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import GlassHoverCard from "@/components/GlassHoverCard";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  id: string;
  title: string;
  category: string;
  image: string;
  viewProject: string;
  accent?: string;
  /** GSAP batch entrance index (portfolio page) */
  batchIndex?: number;
};

const cardHeights =
  "h-[320px] sm:h-[380px] lg:h-[450px] rounded-3xl";

const cardShell =
  "overflow-visible p-2 sm:p-3 block cursor-pointer";

export default function ProjectCard({
  id,
  title,
  category,
  image,
  viewProject,
  accent = "#6366f1",
  batchIndex,
}: ProjectCardProps) {
  const card = (
    <GlassHoverCard
      accent={accent}
      fill
      enableTilt={false}
      hoverScale={1}
      reducedHoverScale={1}
      spotlight={false}
      className={cn(cardHeights, "border-white/10")}
    >
      <div className="relative block h-full overflow-hidden rounded-[inherit]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/40" aria-hidden />

        <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end">
          <span className="text-white/60 text-sm font-medium mb-2 block uppercase tracking-widest">
            {category}
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {title}
          </h3>
          <div className="inline-flex items-center space-x-3 text-white font-semibold">
            <span>{viewProject}</span>
            <div className="p-3 rounded-full bg-white/20 text-white">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </GlassHoverCard>
  );

  return (
    <Link href={`/portfolio/${id}`} className={cardShell}>
      {batchIndex != null ? (
        <div data-scroll-batch-item data-batch-index={batchIndex}>
          {card}
        </div>
      ) : (
        card
      )}
    </Link>
  );
}
