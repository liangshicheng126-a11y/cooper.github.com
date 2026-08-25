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

    const moveFocus = (event: React.KeyboardEvent<HTMLLIElement>, nextIndex: number) => {
      event.preventDefault();
      const normalized = (nextIndex + items.length) % items.length;
      setActiveIndex(normalized);
      const cards = event.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
        "[data-expanding-card]"
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
              tabIndex={0}
              aria-label={item.title}
              onMouseEnter={() => isDesktop && setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
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

              <article className="portfolio-expanding-card__content">
                <div className="portfolio-expanding-card__icon" aria-hidden>
                  {item.icon}
                </div>
                <p className="portfolio-expanding-card__category">{item.description}</p>
                <h2>{item.title}</h2>
                <Link
                  href={item.linkHref}
                  className="portfolio-expanding-card__link"
                  tabIndex={active ? 0 : -1}
                  aria-hidden={!active}
                  onClick={(event) => event.stopPropagation()}
                >
                  <span>{item.linkLabel}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    );
  }
);

ExpandingCards.displayName = "ExpandingCards";
