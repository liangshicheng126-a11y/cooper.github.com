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
  stackY = 0,
}: DisplayCardProps) {
  const accentStyle = ACCENT_STYLES[accent];

  return (
    <motion.div
      aria-hidden={!isActive}
      initial={false}
      animate={{
        x: isActive ? 0 : stackX,
        y: isActive ? -(index * stackY + 64) : index * stackY,
        skewY: isActive ? 0 : -6,
        scale: isActive ? 1.02 : 1,
        filter: isActive ? "grayscale(0)" : "grayscale(0.7)",
        opacity: isActive ? 1 : 0.9,
      }}
      transition={SPRING}
      style={{ zIndex: isActive ? 50 : index + 1 }}
      className={cn(
        "pointer-events-none relative flex w-[17rem] sm:w-[20rem] lg:w-[22rem] select-none flex-col justify-between rounded-xl border bg-white/[0.14] backdrop-blur-md px-4 py-3 text-left shadow-[0_12px_40px_rgba(15,23,42,0.12)]",
        isActive
          ? "min-h-[10rem] h-auto border-white/35 bg-white/[0.22] shadow-[0_20px_56px_rgba(15,23,42,0.18)]"
          : "h-32 sm:h-36",
        accentStyle.border,
        imageUrl && "overflow-hidden",
        className
      )}
    >
      {imageUrl ? (
        <>
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-500",
              isActive ? "opacity-45" : "opacity-28"
            )}
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-hidden
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br transition-opacity duration-500",
              isActive
                ? "from-white/90 via-white/75 to-white/58"
                : "from-white/84 via-white/62 to-white/40"
            )}
            aria-hidden
          />
        </>
      ) : null}

      <div className="relative z-[2] flex items-start gap-2">
        <span
          className={cn(
            "relative inline-flex shrink-0 rounded-full p-1.5 shadow-sm",
            accentStyle.iconWrap,
            iconClassName
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          {badge ? (
            <span className="mb-1 inline-block rounded-full bg-foreground/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
              {badge}
            </span>
          ) : null}
          <p
            className={cn(
              "text-base sm:text-lg font-semibold leading-snug",
              accentStyle.title,
              titleClassName
            )}
          >
            {title}
          </p>
        </div>
      </div>

      <p
        className={cn(
          "relative z-[2] text-sm sm:text-base leading-relaxed text-foreground/80",
          isActive ? "whitespace-normal" : "line-clamp-2"
        )}
      >
        {description}
      </p>

      <p className="relative z-[2] text-xs sm:text-sm text-foreground/50">{date}</p>
    </motion.div>
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
  stepX = 28,
  stepY = 36
): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, index) => ({
    x: index * stepX,
    y: index * stepY,
  }));
}

export function stackContainerMinHeight(
  count: number,
  cardHeight = 144,
  stepY = 36,
  liftPadding = 96
): number {
  return cardHeight + (count - 1) * stepY + liftPadding;
}

/** @deprecated Use DisplayCards with unified card data instead. */
export function buildStackedCards(items: DisplayCardData[]): DisplayCardData[] {
  return items;
}

export default function DisplayCards({
  cards,
  className,
  stackStepX = 28,
  stackStepY = 36,
}: DisplayCardsProps) {
  const defaultCards: DisplayCardData[] = [
    { title: "Featured", description: "Discover amazing content", date: "Just now" },
    { title: "Popular", description: "Trending this week", date: "2 days ago" },
    { title: "New", description: "Latest updates and features", date: "Today" },
  ];

  const displayCards = cards ?? defaultCards;
  const [activeIndex, setActiveIndex] = useState(displayCards.length - 1);
  const offsets = buildStackOffsets(displayCards.length, stackStepX, stackStepY);

  return (
    <div
      className={cn("relative w-full opacity-100", className)}
      style={{
        minHeight: stackContainerMinHeight(displayCards.length, 144, stackStepY, 112),
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
              />
            </div>
          );
        })}
      </div>

      {/* Dedicated tab layer — always receives clicks, even for middle cards */}
      <div className="absolute inset-0 pointer-events-none">
        {displayCards.map((card, index) => {
          const offset = offsets[index];
          const isActive = activeIndex === index;
          const accentStyle = ACCENT_STYLES[card.accent ?? "indigo"];
          return (
            <motion.button
              key={`tab-${card.title}-${index}`}
              type="button"
              aria-pressed={isActive}
              aria-label={card.title}
              onClick={() => setActiveIndex(index)}
              initial={false}
              animate={{
                left: isActive ? 0 : offset.x,
                top: isActive ? -(index * stackStepY + 64) : offset.y,
              }}
              transition={SPRING}
              style={{
                width: "17rem",
                zIndex: isActive ? 120 : 80 + index,
              }}
              className={cn(
                "pointer-events-auto absolute flex h-10 items-center gap-2 overflow-hidden rounded-xl border px-3 text-left sm:w-[20rem] lg:w-[22rem]",
                "bg-white/55 backdrop-blur-md shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
                isActive
                  ? "cursor-default border-white/40 opacity-0"
                  : "cursor-pointer border-white/25 hover:border-white/40 hover:bg-white/70",
                accentStyle.border
              )}
            >
              <span className="truncate text-xs font-semibold text-foreground/80">
                {card.title}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {displayCards[activeIndex]?.title}
      </p>
    </div>
  );
}
