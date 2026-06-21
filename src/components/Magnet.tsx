"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type MagnetProps = {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  wrapperClassName?: string;
  innerClassName?: string;
};

export default function Magnet({
  children,
  padding = 60,
  disabled = false,
  magnetStrength = 2.5,
  wrapperClassName = "",
  innerClassName = "",
}: MagnetProps) {
  const magnetRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafId = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const noHover =
      typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
    if (noHover) {
      return;
    }

    const inner = innerRef.current;
    if (!inner || disabled) {
      if (inner) gsap.set(inner, { x: 0, y: 0, clearProps: "transform" });
      return;
    }

    xTo.current = gsap.quickTo(inner, "x", { duration: 0.2, ease: "power2.out" });
    yTo.current = gsap.quickTo(inner, "y", { duration: 0.5, ease: "power2.inOut" });

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      gsap.set(inner, { x: 0, y: 0, clearProps: "transform" });
      xTo.current = null;
      yTo.current = null;
      rectRef.current = null;
      pointerRef.current.active = false;
    };
  }, [disabled]);

  const flush = () => {
    rafId.current = 0;
    const rect = rectRef.current;
    if (!rect || !xTo.current || !yTo.current) return;

    if (pointerRef.current.active) {
      const { left, top, width, height } = rect;
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      xTo.current((pointerRef.current.x - centerX) / magnetStrength);
      yTo.current((pointerRef.current.y - centerY) / magnetStrength);
      return;
    }

    xTo.current(0);
    yTo.current(0);
  };

  const scheduleFlush = () => {
    if (!rafId.current) rafId.current = requestAnimationFrame(flush);
  };

  const reset = () => {
    pointerRef.current.active = false;
    scheduleFlush();
  };

  return (
    <div
      ref={magnetRef}
      className={wrapperClassName}
      style={{
        display: "inline-flex",
        padding,
        margin: -padding,
      }}
      onPointerEnter={(event) => {
        if (disabled || window.matchMedia("(hover: none)").matches) return;
        const inner = innerRef.current;
        rectRef.current = inner?.getBoundingClientRect() ?? null;
        pointerRef.current = {
          x: event.clientX,
          y: event.clientY,
          active: Boolean(rectRef.current),
        };
        scheduleFlush();
      }}
      onPointerMove={(event) => {
        if (disabled || !rectRef.current) return;
        pointerRef.current.x = event.clientX;
        pointerRef.current.y = event.clientY;
        pointerRef.current.active = true;
        scheduleFlush();
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <div
        ref={innerRef}
        className={innerClassName}
        style={{
          display: "inline-flex",
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
