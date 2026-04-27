"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

type TiltCardProps = {
  className?: string;
  children: ReactNode;
  maxTilt?: number;
  maxShift?: number;
};

export default function TiltCard({
  className,
  children,
  maxTilt = 6,
  maxShift = 7,
}: TiltCardProps) {
  const [enabled, setEnabled] = useState(true);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const shiftX = useMotionValue(0);
  const shiftY = useMotionValue(0);
  const rafId = useRef<number | null>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const springConfig = { stiffness: 170, damping: 24, mass: 0.55 };
  const rx = useSpring(rotateX, springConfig);
  const ry = useSpring(rotateY, springConfig);
  const x = useSpring(shiftX, springConfig);
  const y = useSpring(shiftY, springConfig);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(media.matches && !reduced.matches);
    update();
    media.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  const reset = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    rotateX.set(0);
    rotateY.set(0);
    shiftX.set(0);
    shiftY.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{
        rotateX: rx,
        rotateY: ry,
        x,
        y,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onMouseMove={(e) => {
        if (!enabled) return;
        if (!rectRef.current) rectRef.current = e.currentTarget.getBoundingClientRect();
        const rect = rectRef.current;
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const nx = px * 2 - 1;
        const ny = py * 2 - 1;

        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
          rotateY.set(nx * maxTilt);
          rotateX.set(-ny * maxTilt);
          shiftX.set(nx * maxShift);
          shiftY.set(ny * maxShift);
        });
      }}
      onMouseEnter={(e) => {
        if (!enabled) return;
        rectRef.current = e.currentTarget.getBoundingClientRect();
      }}
      onMouseLeave={() => {
        rectRef.current = null;
        reset();
      }}
    >
      {children}
    </motion.div>
  );
}

