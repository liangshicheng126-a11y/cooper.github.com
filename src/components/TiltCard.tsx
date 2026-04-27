"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode } from "react";

type TiltCardProps = {
  className?: string;
  children: ReactNode;
  maxTilt?: number;
  maxShift?: number;
};

export default function TiltCard({
  className,
  children,
  maxTilt = 8,
  maxShift = 10,
}: TiltCardProps) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const shiftX = useMotionValue(0);
  const shiftY = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.45 };
  const rx = useSpring(rotateX, springConfig);
  const ry = useSpring(rotateY, springConfig);
  const x = useSpring(shiftX, springConfig);
  const y = useSpring(shiftY, springConfig);

  const reset = () => {
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
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const nx = px * 2 - 1;
        const ny = py * 2 - 1;

        rotateY.set(nx * maxTilt);
        rotateX.set(-ny * maxTilt);
        shiftX.set(nx * maxShift);
        shiftY.set(ny * maxShift);
      }}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}

