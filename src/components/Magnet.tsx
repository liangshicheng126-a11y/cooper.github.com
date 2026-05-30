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

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
      return;
    }

    const inner = innerRef.current;
    if (!inner || disabled) {
      if (inner) gsap.set(inner, { x: 0, y: 0, clearProps: "transform" });
      return;
    }

    xTo.current = gsap.quickTo(inner, "x", { duration: 0.2, ease: "power2.out" });
    yTo.current = gsap.quickTo(inner, "y", { duration: 0.5, ease: "power2.inOut" });

    let rafId = 0;
    let pendingX = 0;
    let pendingY = 0;
    let pendingActive = false;

    const flush = () => {
      rafId = 0;
      if (!magnetRef.current || !xTo.current || !yTo.current) return;

      const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      if (pendingActive) {
        xTo.current((pendingX - centerX) / magnetStrength);
        yTo.current((pendingY - centerY) / magnetStrength);
      } else {
        xTo.current(0);
        yTo.current(0);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!magnetRef.current) return;
      const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
      const distX = Math.abs(left + width / 2 - e.clientX);
      const distY = Math.abs(top + height / 2 - e.clientY);

      pendingActive =
        distX < width / 2 + padding && distY < height / 2 + padding;
      pendingX = e.clientX;
      pendingY = e.clientY;

      if (!rafId) rafId = requestAnimationFrame(flush);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
      gsap.set(inner, { x: 0, y: 0, clearProps: "transform" });
      xTo.current = null;
      yTo.current = null;
    };
  }, [padding, disabled, magnetStrength]);

  return (
    <div ref={magnetRef} className={wrapperClassName} style={{ display: "inline-flex" }}>
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
