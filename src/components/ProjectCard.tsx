"use client";

/**
 * ProjectCard — 精选作品卡片
 * Link 作为最外层，避免 3D 倾斜 transform 导致首次点击失效
 */

import Link from "next/link";
import GsapProjectCardHover from "@/components/motion/GsapProjectCardHover";
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
  /** preview: lighter hover for homepage featured row */
  variant?: "portfolio" | "preview";
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
  variant = "portfolio",
}: ProjectCardProps) {
  const card = (
    <GsapProjectCardHover
      accent={accent}
      image={image}
      category={category}
      title={title}
      viewProject={viewProject}
      variant={variant}
      className={cn(cardHeights)}
    />
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
