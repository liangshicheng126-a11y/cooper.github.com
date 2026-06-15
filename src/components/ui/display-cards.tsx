"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export type DisplayCardAccent = "indigo" | "purple";

export interface DisplayCardData {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  badge?: string;
  iconClassName?: string;
  titleClassName?: string;
  imageUrl?: string;
  accent?: DisplayCardAccent;
}

export interface DisplayCardProps extends DisplayCardData {
  className?: string;
  index?: number;
  isActive?: boolean;
  stackX?: number;
  stackY?: number;
  onActivate?: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

const ACCENT_STYLES: Record<
  DisplayCardAccent,
  { iconWrap: string; title: string; border: string }
> = {
  indigo: {
    iconWrap: "bg-indigo-600/90",
    title: "text-indigo-700",
    border: "border-indigo-300/25",
  },
  purple: {
    iconWrap: "bg-purple-600/90",
    title: "text-purple-700",
    border: "border-purple-300/25",
  },
};

export function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-indigo-100" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  badge,
  iconClassName,
  titleClassName,
  imageUrl,
  accent = "indigo",
  index = 0,
  isActive = false,
  stackX = 0,
  stackY = 32,
  onActivate,
}: DisplayCardProps) {
  const accentStyle = ACCENT_STYLES[accent];

  return (
    <motion.button
      type="button"
      onClick={onActivate}
      aria-pressed={isActive}
      aria-label={title}
      initial={false}
      animate={{
        x: isActive ? 0 : stackX,
        y: isActive ? -16 : index * stackY,
        skewY: isActive ? 0 : -4,
        scale: isActive ? 1.01 : 1,
        filter: isActive ? "grayscale(0)" : "grayscale(0.5)",
      }}
      transition={SPRING}
      style={{ zIndex: isActive ? 50 : index + 1 }}
      className={cn(
        "relative flex w-[17rem] sm:w-[20rem] lg:w-[22rem] select-none flex-col text-left rounded-xl border bg-white/[0.14] backdrop-blur-md shadow-[0_8px_32px_rgba(15,23,42,0.1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
        isActive
          ? "min-h-[9.5rem] h-auto cursor-default gap-2 border-white/35 bg-white/[0.22] px-4 py-3 shadow-[0_16px_48px_rgba(15,23,42,0.14)]"
          : "h-10 cursor-pointer items-center overflow-hidden border-white/20 px-3 py-0 hover:border-white/35 hover:bg-white/20",
        accentStyle.border,
        imageUrl && isActive && "overflow-hidden",
        className
      )}
    >
      {isActive && imageUrl ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-white/90 via-white/75 to-white/58"
            aria-hidden
          />
        </>
      ) : null}

      <div
        className={cn(
          "relative z-[2] flex min-w-0 items-center gap-2",
          isActive ? "items-start" : "h-10"
        )}
      >
        <span
          className={cn(
            "relative inline-flex shrink-0 rounded-full shadow-sm",
            accentStyle.iconWrap,
            isActive ? "p-1.5" : "p-1",
            iconClassName
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          {isActive && badge ? (
            <span className="mb-1 inline-block rounded-full bg-foreground/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
              {badge}
            </span>
          ) : null}
          <p
            className={cn(
              "font-semibold leading-snug",
              isActive ? "text-base sm:text-lg" : "truncate text-xs",
              accentStyle.title,
              titleClassName
            )}
          >
            {title}
          </p>
        </div>
      </div>

      {isActive ? (
        <>
          <p className="relative z-[2] whitespace-normal text-sm sm:text-base leading-relaxed text-foreground/80">
            {description}
          </p>
          <p className="relative z-[2] text-xs sm:text-sm text-foreground/50">{date}</p>
        </>
      ) : null}
    </motion.button>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardData[];
  className?: string;
  stackStepX?: number;
  stackStepY?: number;
}

export function buildStackOffsets(
  count: number,
  stepX = 22,
  stepY = 32
): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, index) => ({
    x: index * stepX,
    y: index * stepY,
  }));
}

export function stackContainerMinHeight(
  count: number,
  peekH = 40,
  expandedH = 160,
  pad = 32
): number {
  return (count - 1) * peekH + expandedH + pad;
}

/** @deprecated Use DisplayCards with unified card data instead. */
export function buildStackedCards(items: DisplayCardData[]): DisplayCardData[] {
  return items;
}

export default function DisplayCards({
  cards,
  className,
  stackStepX = 22,
  stackStepY = 32,
}: DisplayCardsProps) {
  const defaultCards: DisplayCardData[] = [
    { title: "Featured", description: "Discover amazing content", date: "Just now" },
    { title: "Popular", description: "Trending this week", date: "2 days ago" },
    { title: "New", description: "Latest updates and features", date: "Today" },
  ];

  const displayCards = cards ?? defaultCards;
  const [activeIndex, setActiveIndex] = useState(0);
  const offsets = buildStackOffsets(displayCards.length, stackStepX, stackStepY);

  return (
    <div
      className={cn("relative w-full overflow-hidden opacity-100", className)}
      style={{
        minHeight: stackContainerMinHeight(displayCards.length, stackStepY + 8, 160, 32),
      }}
    >
      <div className="relative grid [grid-template-areas:'stack'] place-items-start">
        {displayCards.map((card, index) => {
          const offset = offsets[index];
          return (
            <div key={`${card.title}-${index}`} className="[grid-area:stack]">
              <DisplayCard
                {...card}
                index={index}
                stackX={offset.x}
                stackY={stackStepY}
                isActive={activeIndex === index}
                onActivate={() => setActiveIndex(index)}
              />
            </div>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {displayCards[activeIndex]?.title}
      </p>
    </div>
  );
}
