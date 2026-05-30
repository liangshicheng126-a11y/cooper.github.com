"use client";

/**
 * ProjectCard — 精选作品卡片
 *
 * 入场：GSAP ScrollTrigger.batch（motion v2）或 Framer useInView
 * 悬停：Framer scale / 箭头 spring；可选 glassHover（3D tilt，无炫光）
 */

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import GlassHoverCard from "@/components/GlassHoverCard";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { MOTION_V2_ENABLED, shouldUseGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  id: string;
  title: string;
  category: string;
  image: string;
  index: number;
  viewProject: string;
  /** Animate in on mount (portfolio grid) instead of scroll into view */
  playOnMount?: boolean;
  /** Glass tilt hover (homepage featured + portfolio grid) */
  glassHover?: boolean;
  accent?: string;
  /** Entrance handled by PortfolioGenieGrid wrapper */
  genieReveal?: boolean;
};

const cardHeights =
  "h-[320px] sm:h-[380px] lg:h-[450px] rounded-3xl";

const glassHoverWrap =
  "overflow-visible p-2 sm:p-3 [transform-style:preserve-3d]";

export default function ProjectCard({
  id,
  title,
  category,
  image,
  index,
  viewProject,
  playOnMount = false,
  glassHover = false,
  accent = "#6366f1",
  genieReveal = false,
}: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const gsapEnabled = MOTION_V2_ENABLED && shouldUseGsap(reduced);
  const batchReveal = gsapEnabled && !genieReveal;
  const genieGsap = genieReveal && gsapEnabled;

  const isInView = useInView(ref, { once: true, amount: 0.08 });
  const revealOnMount = playOnMount && !batchReveal;
  const shouldReveal = revealOnMount || isInView;
  const xOffset = index % 2 === 0 ? -32 : 32;

  const imageScale = glassHover ? 1 : hovered ? 1.06 : 1;

  const link = (
    <Link
      href={`/portfolio/${id}`}
      className={cn(
        "group relative block overflow-hidden cursor-pointer",
        glassHover ? "h-full rounded-[inherit]" : cn(cardHeights, "glass border-white/10"),
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ scale: imageScale }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors duration-500" />
      </motion.div>

      {!glassHover && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{
            background:
              "linear-gradient(-45deg, transparent 55%, rgba(255,255,255,0.22) 68%, transparent 82%)",
            backgroundSize: "260% 260%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: hovered ? "100% 100%" : "-100% -100%",
            transition: hovered ? "background-position 700ms ease" : "none",
          }}
        />
      )}

      <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <span className="text-white/60 text-sm font-medium mb-2 block uppercase tracking-widest">
            {category}
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {title}
          </h3>
          <div className="inline-flex items-center space-x-3 text-white font-semibold group/btn">
            <span>{viewProject}</span>
            <motion.div
              className="p-3 rounded-full bg-white/20 group-hover/btn:bg-white group-hover/btn:text-black"
              animate={{ scale: hovered ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <ArrowUpRight className="w-5 h-5" />
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute top-8 right-8 p-3 rounded-full glass border-white/20 text-white"
        animate={{ opacity: hovered ? 0 : 1, scale: hovered ? 0.8 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <ArrowUpRight className="w-5 h-5" />
      </motion.div>
    </Link>
  );

  const cardInner = glassHover ? (
    <GlassHoverCard
      accent={accent}
      fill
      hoverScale={1.02}
      spotlight={false}
      className={cn(cardHeights, "border-white/10 cursor-pointer")}
    >
      {link}
    </GlassHoverCard>
  ) : (
    link
  );

  if (genieGsap) {
    return glassHover ? (
      <div className={glassHoverWrap}>{cardInner}</div>
    ) : (
      cardInner
    );
  }

  if (batchReveal) {
    return (
      <div
        ref={ref}
        data-scroll-batch-item
        data-batch-index={index}
        className={cn("gsap-batch-item", glassHover && glassHoverWrap)}
        style={glassHover ? { perspective: "800px" } : undefined}
      >
        {cardInner}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={glassHover ? glassHoverWrap : undefined}
      style={glassHover ? { perspective: "800px" } : undefined}
      initial={{ opacity: 0, y: 48, x: xOffset }}
      animate={
        shouldReveal
          ? { opacity: 1, y: 0, x: 0 }
          : { opacity: 0, y: 48, x: xOffset }
      }
      transition={{
        duration: 0.75,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {cardInner}
    </motion.div>
  );
}
