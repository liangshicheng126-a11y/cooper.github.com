"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { subscribeToMediaQuery } from "@/lib/mediaQuery";
import styles from "./FlowingMenu.module.css";

export type FlowingMenuItem = {
  number: string;
  text: string;
  description: string;
  image: string;
};

type FlowingMenuProps = {
  items: FlowingMenuItem[];
  speed?: number;
  ariaLabel?: string;
};

type Edge = "top" | "bottom";

function closestEdge(mouseX: number, mouseY: number, width: number, height: number): Edge {
  const top = (mouseX - width / 2) ** 2 + mouseY ** 2;
  const bottom = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
  return top < bottom ? "top" : "bottom";
}

type MenuItemProps = FlowingMenuItem & {
  active: boolean;
  speed: number;
  touchMode: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
};

function MenuItem({
  number,
  text,
  description,
  image,
  active,
  speed,
  touchMode,
  onActivate,
  onDeactivate,
}: MenuItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<gsap.core.Tween | null>(null);
  const revealRef = useRef<gsap.core.Timeline | null>(null);
  const entryEdge = useRef<Edge>("bottom");
  const exitEdge = useRef<Edge>("bottom");
  const [repetitions, setRepetitions] = useState(5);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const reduced = usePrefersReducedMotion();

  const recordEdge = (clientX: number, clientY: number, target: HTMLElement, kind: "entry" | "exit") => {
    const rect = target.getBoundingClientRect();
    const edge = closestEdge(clientX - rect.left, clientY - rect.top, rect.width, rect.height);
    if (kind === "entry") entryEdge.current = edge;
    else exitEdge.current = edge;
  };

  useEffect(() => {
    const item = itemRef.current;
    if (!item || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "120px 0px",
    });
    observer.observe(item);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const inner = marqueeInnerRef.current;
    if (!inner) return;

    const calculate = () => {
      const part = inner.querySelector<HTMLElement>(`.${styles.marqueePart}`);
      if (!part || part.offsetWidth === 0) return;
      setRepetitions(Math.max(4, Math.ceil(window.innerWidth / part.offsetWidth) + 2));
    };

    calculate();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(calculate);
    if (observer) observer.observe(inner);
    window.addEventListener("resize", calculate);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", calculate);
    };
  }, [description, image, text]);

  useEffect(() => {
    const marquee = marqueeRef.current;
    const inner = marqueeInnerRef.current;
    if (!marquee || !inner) return;

    revealRef.current?.kill();
    if (reduced) {
      gsap.set([marquee, inner], { y: active ? "0%" : "101%" });
      return;
    }

    const edge = active ? entryEdge.current : exitEdge.current;
    const marqueeY = edge === "top" ? "-101%" : "101%";
    const innerY = edge === "top" ? "101%" : "-101%";

    if (active) {
      revealRef.current = gsap
        .timeline({ defaults: { duration: 0.56, ease: "expo.out" } })
        .set(marquee, { y: marqueeY }, 0)
        .set(inner, { y: innerY }, 0)
        .to([marquee, inner], { y: "0%" }, 0);
    } else {
      revealRef.current = gsap
        .timeline({ defaults: { duration: 0.42, ease: "expo.inOut" } })
        .to(marquee, { y: marqueeY }, 0)
        .to(inner, { y: innerY }, 0);
    }

    return () => {
      revealRef.current?.kill();
    };
  }, [active, reduced]);

  useEffect(() => {
    const inner = marqueeInnerRef.current;
    if (!inner) return;
    loopRef.current?.kill();

    if (!active || reduced || !inView || !pageVisible) {
      gsap.set(inner, { x: 0 });
      return;
    }

    const part = inner.querySelector<HTMLElement>(`.${styles.marqueePart}`);
    if (!part || part.offsetWidth === 0) return;

    loopRef.current = gsap.to(inner, {
      x: -part.offsetWidth,
      duration: speed,
      ease: "none",
      repeat: -1,
    });

    return () => {
      loopRef.current?.kill();
      loopRef.current = null;
    };
  }, [active, inView, pageVisible, reduced, repetitions, speed]);

  return (
    <div ref={itemRef} className={styles.item} role="listitem">
      <button
        type="button"
        className={styles.itemButton}
        aria-expanded={active}
        onPointerEnter={(event) => {
          // Touch contact also emits pointerenter; only a real mouse hover selects here.
          if (event.pointerType !== "mouse" || event.buttons !== 0) return;
          recordEdge(event.clientX, event.clientY, event.currentTarget, "entry");
          onActivate();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          recordEdge(event.clientX, event.clientY, event.currentTarget, "exit");
          if (!touchMode) onDeactivate();
        }}
        onFocus={(event) => {
          // A pointer may focus the button before its gesture becomes a scroll.
          if (event.currentTarget.matches(":focus-visible")) onActivate();
        }}
        onBlur={() => !touchMode && onDeactivate()}
        onClick={(event) => {
          if (event.detail > 0) {
            recordEdge(event.clientX, event.clientY, event.currentTarget, "entry");
          }
          // Native click waits for a completed tap; repeated activation is idempotent.
          onActivate();
        }}
      >
        <span className={styles.number}>{number}</span>
        <span className={styles.title}>{text}</span>
        <span className={styles.description}>{description}</span>
      </button>

      <div ref={marqueeRef} className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeInnerWrap}>
          <div ref={marqueeInnerRef} className={styles.marqueeInner}>
            {Array.from({ length: repetitions }, (_, index) => (
              <div className={styles.marqueePart} key={index}>
                <span className={styles.marqueeNumber}>{number}</span>
                <span className={styles.marqueeTitle}>{text}</span>
                <span className={styles.marqueeImage} style={{ backgroundImage: `url(${image})` }} />
                <span className={styles.marqueeDescription}>{description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlowingMenu({
  items,
  speed = 18,
  ariaLabel = "Design workflow",
}: FlowingMenuProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchMode, setTouchMode] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: none)");
    const update = () => {
      setTouchMode(query.matches);
      setActiveIndex((current) => (query.matches ? current ?? 0 : null));
    };
    update();
    return subscribeToMediaQuery(query, update);
  }, []);

  return (
    <div className={styles.menuWrap}>
      <div className={styles.menu} role="list" aria-label={ariaLabel}>
        {items.map((item, index) => (
          <MenuItem
            key={`${item.number}-${item.text}`}
            {...item}
            speed={speed}
            touchMode={touchMode}
            active={activeIndex === index}
            onActivate={() => setActiveIndex(index)}
            onDeactivate={() => setActiveIndex((current) => (current === index ? null : current))}
          />
        ))}
      </div>
    </div>
  );
}
