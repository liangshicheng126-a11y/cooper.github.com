"use client";

import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Check, Globe2, Plus } from "lucide-react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import styles from "./StaggeredMenu.module.css";

gsap.registerPlugin(useGSAP);

export type StaggeredMenuItem = {
  value: string;
  label: string;
  shortLabel: string;
  htmlLang: string;
};

type Props = {
  items: readonly StaggeredMenuItem[];
  value: string;
  open: boolean;
  title: string;
  closeLabel: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
};

/** Adapted from the uploaded React Bits StaggeredMenu: layered slide + staggered labels. */
export default function StaggeredMenu({
  items, value, open, title, closeLabel, onOpenChange, onSelect,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const pendingFocusRef = useRef<number | null>(null);
  const reduced = usePrefersReducedMotion();
  const menuId = useId();
  const titleId = `${menuId}-title`;
  const selected = items.find((item) => item.value === value) ?? items[0];

  useGSAP(() => {
    const viewport = viewportRef.current;
    const panel = panelRef.current;
    if (!viewport || !panel) return;
    const layers = viewport.querySelectorAll<HTMLElement>("[data-menu-layer]");
    const labels = panel.querySelectorAll<HTMLElement>("[data-menu-label]");
    const details = panel.querySelectorAll<HTMLElement>("[data-menu-detail]");

    const timeline = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
    timeline.fromTo(viewport, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0);
    timeline.fromTo(layers, { xPercent: 105 }, {
      xPercent: 0, duration: 0.42, stagger: 0.065,
    }, 0);
    timeline.fromTo(panel, { xPercent: 105 }, { xPercent: 0, duration: 0.5 }, 0.13);
    timeline.fromTo(labels, { yPercent: 115, rotation: 6 }, {
      yPercent: 0, rotation: 0, duration: 0.58, stagger: 0.075,
    }, 0.24);
    timeline.fromTo(details, { autoAlpha: 0, y: 8 }, {
      autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.045, ease: "power2.out",
    }, 0.3);
    timeline.fromTo(iconRef.current, { rotation: 0 }, { rotation: 225, duration: 0.45 }, 0);
    timelineRef.current = timeline;
    return () => { timelineRef.current = null; };
  }, { scope: rootRef });

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    if (reduced) {
      timeline.progress(open ? 1 : 0).pause();
    } else if (open) {
      timeline.timeScale(1).play();
    } else {
      timeline.timeScale(2.4).reverse();
    }
  }, [open, reduced]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const options = panelRef.current?.querySelectorAll<HTMLButtonElement>("[role='menuitemradio']");
      const index = pendingFocusRef.current ?? Math.max(0, items.findIndex((item) => item.value === value));
      options?.[index]?.focus({ preventScroll: true });
      pendingFocusRef.current = null;
    });
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      cancelAnimationFrame(frame);
      pendingFocusRef.current = null;
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open, items, value, onOpenChange]);

  const closeAndFocus = () => {
    onOpenChange(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeAndFocus();
      return;
    }
    if (event.key === "Tab") {
      onOpenChange(false);
      return;
    }
    const options = Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>("[role='menuitemradio']") ?? []);
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;
    if (event.key === "ArrowDown") next = (current + 1) % options.length;
    else if (event.key === "ArrowUp") next = (current - 1 + options.length) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else return;
    event.preventDefault();
    options[next]?.focus();
  };

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-open={open}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onOpenChange(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.toggle}
        aria-label={`${open ? closeLabel : title} · ${selected.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => onOpenChange(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            pendingFocusRef.current = event.key === "ArrowDown" ? 0 : items.length - 1;
            onOpenChange(true);
          } else if (event.key === "Escape" && open) {
            closeAndFocus();
          }
        }}
      >
        <Globe2 size={16} strokeWidth={1.6} aria-hidden />
        <span className={styles.current} lang={selected.htmlLang}>{selected.shortLabel}</span>
        <span ref={iconRef} className={styles.toggleIcon} aria-hidden><Plus size={14} strokeWidth={1.7} /></span>
      </button>

      <div ref={viewportRef} className={styles.viewport} inert={!open} aria-hidden={!open}>
        <div data-menu-layer className={`${styles.layer} ${styles.layerFirst}`} aria-hidden />
        <div data-menu-layer className={`${styles.layer} ${styles.layerSecond}`} aria-hidden />
        <div ref={panelRef} className={styles.panel} onKeyDown={handleMenuKeyDown}>
          <p id={titleId} className={styles.title} data-menu-detail>{title}</p>
          <div id={menuId} role="menu" aria-labelledby={titleId} className={styles.options}>
            {items.map((item) => (
              <button
                key={item.value}
                type="button"
                role="menuitemradio"
                aria-checked={value === item.value}
                lang={item.htmlLang}
                className={styles.option}
                tabIndex={open && value === item.value ? 0 : -1}
                onClick={() => { onSelect(item.value); closeAndFocus(); }}
              >
                <span className={styles.labelMask}><span className={styles.label} data-menu-label>{item.label}</span></span>
                <span className={styles.detail} data-menu-detail>
                  <span className={styles.code} aria-hidden>{item.value.toUpperCase()}</span>
                  <Check size={17} className={styles.check} aria-hidden />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
