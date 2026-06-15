"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
  imageUrl?: string;
}

export function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-indigo-200" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-indigo-500",
  titleClassName = "text-indigo-600",
  imageUrl,
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-32 w-[17rem] sm:h-36 sm:w-[20rem] lg:w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border border-white/20 bg-white/[0.12] backdrop-blur-md px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:z-[1] after:h-[110%] after:w-[calc(100%+0.5rem)] after:bg-gradient-to-l after:from-[var(--background)] after:to-transparent after:content-[''] hover:border-indigo-400/30 hover:bg-white/[0.18] [&>*]:relative [&>*]:z-[2] [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        imageUrl && "overflow-hidden",
        className
      )}
    >
      {imageUrl ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-35 transition-opacity duration-700 group-hover:opacity-50"
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-white/80 via-white/55 to-white/30"
            aria-hidden
          />
        </>
      ) : null}
      <div>
        <span
          className={cn(
            "relative inline-block rounded-full bg-indigo-600/90 p-1.5 shadow-sm",
            iconClassName
          )}
        >
          {icon}
        </span>
        <p className={cn("text-base sm:text-lg font-semibold leading-snug", titleClassName)}>
          {title}
        </p>
      </div>
      <p className="text-sm sm:text-base leading-snug line-clamp-2">{description}</p>
      <p className="text-xs sm:text-sm text-foreground/50">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
  className?: string;
}

const GRAYSCALE_STACK =
  "before:absolute before:inset-0 before:z-[1] before:rounded-xl before:outline before:outline-1 before:outline-white/20 before:content-[''] before:bg-blend-overlay before:bg-white/45 grayscale-[85%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0";

/** Explicit stack offsets — Tailwind needs full class strings at build time. */
export const DISPLAY_CARD_STACK_PRESETS: Record<number, string[]> = {
  3: [
    cn("[grid-area:stack] z-[1] hover:-translate-y-8", GRAYSCALE_STACK),
    cn("[grid-area:stack] z-[2] translate-x-12 translate-y-8 sm:translate-x-16 sm:translate-y-10 hover:-translate-y-1", GRAYSCALE_STACK),
    cn("[grid-area:stack] z-[3] translate-x-24 translate-y-16 sm:translate-x-32 sm:translate-y-20 hover:translate-y-10"),
  ],
  4: [
    cn("[grid-area:stack] z-[1] hover:-translate-y-8", GRAYSCALE_STACK),
    cn("[grid-area:stack] z-[2] translate-x-10 translate-y-7 sm:translate-x-14 sm:translate-y-9 hover:-translate-y-1", GRAYSCALE_STACK),
    cn("[grid-area:stack] z-[3] translate-x-20 translate-y-14 sm:translate-x-28 sm:translate-y-[4.5rem]", GRAYSCALE_STACK),
    cn("[grid-area:stack] z-[4] translate-x-[7.5rem] translate-y-[8.5rem] sm:translate-x-40 sm:translate-y-[9.5rem] hover:translate-y-[7.5rem]"),
  ],
  5: [
    cn("[grid-area:stack] z-[1] hover:-translate-y-8", GRAYSCALE_STACK),
    cn("[grid-area:stack] z-[2] translate-x-8 translate-y-6 sm:translate-x-12 sm:translate-y-8 hover:-translate-y-1", GRAYSCALE_STACK),
    cn("[grid-area:stack] z-[3] translate-x-16 translate-y-12 sm:translate-x-24 sm:translate-y-16", GRAYSCALE_STACK),
    cn("[grid-area:stack] z-[4] translate-x-24 translate-y-[4.5rem] sm:translate-x-36 sm:translate-y-24", GRAYSCALE_STACK),
    cn("[grid-area:stack] z-[5] translate-x-32 translate-y-[6.5rem] sm:translate-x-[11rem] sm:translate-y-[8.5rem] hover:translate-y-[6.5rem]"),
  ],
};

export function buildStackedCards(
  items: Omit<DisplayCardProps, "className">[]
): DisplayCardProps[] {
  const preset = DISPLAY_CARD_STACK_PRESETS[items.length];
  if (!preset) {
    throw new Error(`DisplayCards: unsupported stack size ${items.length}`);
  }
  return items.map((item, index) => ({
    ...item,
    className: preset[index],
  }));
}

export default function DisplayCards({ cards, className }: DisplayCardsProps) {
  const defaultCards = buildStackedCards([
    { title: "Featured", description: "Discover amazing content", date: "Just now" },
    { title: "Popular", description: "Trending this week", date: "2 days ago" },
    { title: "New", description: "Latest updates and features", date: "Today" },
  ]);

  const displayCards = cards ?? defaultCards;

  return (
    <div
      className={cn(
        "grid [grid-template-areas:'stack'] place-items-center opacity-100",
        className
      )}
    >
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={`${cardProps.title}-${index}`} {...cardProps} />
      ))}
    </div>
  );
}
