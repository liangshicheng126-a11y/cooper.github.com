"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CardItem {
  id: string | number;
  title: string;
  description: string;
  imgSrc: string;
  icon: React.ReactNode;
  linkHref: string;
  linkLabel: string;
}

interface ExpandingCardsProps extends React.HTMLAttributes<HTMLUListElement> {
  items: CardItem[];
  defaultActiveIndex?: number;
}

export const ExpandingCards = React.forwardRef<HTMLUListElement, ExpandingCardsProps>(
  ({ className, items, defaultActiveIndex = 0, ...props }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState(defaultActiveIndex);
    const [isDesktop, setIsDesktop] = React.useState<boolean | null>(null);

    React.useEffect(() => {
      const media = window.matchMedia("(min-width: 768px)");
      const sync = () => setIsDesktop(media.matches);
      sync();
      media.addEventListener("change", sync);
      return () => media.removeEventListener("change", sync);
    }, []);

    const gridStyle = React.useMemo<React.CSSProperties>(() => {
      if (isDesktop === null) return {};
      const tracks = items
        .map((_, index) => (index === activeIndex ? "5fr" : "1fr"))
        .join(" ");
      return isDesktop
        ? { gridTemplateColumns: tracks, gridTemplateRows: "1fr" }
        : { gridTemplateColumns: "1fr", gridTemplateRows: tracks };
    }, [activeIndex, isDesktop, items]);

    const moveFocus = (event: React.KeyboardEvent<HTMLAnchorElement>, nextIndex: number) => {
      event.preventDefault();
      const normalized = (nextIndex + items.length) % items.length;
      setActiveIndex(normalized);
      const cards = event.currentTarget.closest("ul")?.querySelectorAll<HTMLElement>(
        "[data-expanding-card-link]"
      );
      cards?.[normalized]?.focus();
    };

    return (
      <ul
        ref={ref}
        className={cn("portfolio-expanding-cards", className)}
        style={gridStyle}
        {...props}
      >
        {items.map((item, index) => {
          const active = activeIndex === index;
          return (
            <li
              key={item.id}
              className="portfolio-expanding-card"
              data-active={active}
              data-expanding-card
              onMouseEnter={() => isDesktop && setActiveIndex(index)}
            >
              <Link
                href={item.linkHref}
                className="portfolio-expanding-card__surface"
                data-expanding-card-link
                aria-label={`${item.linkLabel}: ${item.title}`}
                onFocus={(event) => {
                  if (isDesktop !== false || event.currentTarget.matches(":focus-visible")) {
                    setActiveIndex(index);
                  }
                }}
                onClick={(event) => {
                  if (isDesktop !== true && !active) {
                    event.preventDefault();
                    setActiveIndex(index);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    moveFocus(event, index + 1);
                  }
                  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    moveFocus(event, index - 1);
                  }
                  if (event.key === "Home") moveFocus(event, 0);
                  if (event.key === "End") moveFocus(event, items.length - 1);
                }}
              >
                <img
                  src={item.imgSrc}
                  alt=""
                  loading={index === defaultActiveIndex ? "eager" : "lazy"}
                  decoding="async"
                  className="portfolio-expanding-card__image"
                />
                <div className="portfolio-expanding-card__shade" aria-hidden />

                <p className="portfolio-expanding-card__rail-title" aria-hidden={active}>
                  {item.title}
                </p>

                <article className="portfolio-expanding-card__content" aria-hidden={!active}>
                  <div className="portfolio-expanding-card__icon" aria-hidden>
                    {item.icon}
                  </div>
                  <p className="portfolio-expanding-card__category">{item.description}</p>
                  <h2>{item.title}</h2>
                  <span className="portfolio-expanding-card__link" aria-hidden>
                    <span>{item.linkLabel}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </article>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
);

ExpandingCards.displayName = "ExpandingCards";
