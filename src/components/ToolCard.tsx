"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import useMotionTier from "@/hooks/useMotionTier";

type ToolCardProps = {
  name: string;
  icon: React.ElementType;
  color: string;
  index: number;
  /** When true, entrance is handled by GsapScrollBatch — skip Framer whileInView */
  batchReveal?: boolean;
};

const spring = { damping: 22, stiffness: 180, mass: 0.8 };

export default function ToolCard({
  name,
  icon: Icon,
  color,
  index,
  batchReveal = false,
}: ToolCardProps) {
  const tier = useMotionTier();
  const enableTilt = tier === "full";
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [10, -10]), spring);
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-10, 10]), spring);
  const scale = useSpring(1, spring);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    if (enableTilt) {
      rawX.set(nx);
      rawY.set(ny);
    }
    ref.current.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  const handleMouseEnter = () => {
    scale.set(1.06);
    ref.current?.style.setProperty("--spot-opacity", "1");
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    scale.set(1);
    ref.current?.style.setProperty("--spot-opacity", "0");
  };

  const motionProps = batchReveal
    ? {}
    : {
        initial: { opacity: 0, y: 28, scale: 0.92 } as const,
        whileInView: { opacity: 1, y: 0, scale: 1 } as const,
        viewport: { once: true, amount: 0.3 } as const,
        transition: {
          duration: 0.48,
          delay: index * 0.07,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

  return (
    <motion.div
      {...motionProps}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...(enableTilt
          ? {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d" as const,
              transformOrigin: "center center",
            }
          : {}),
        scale,
        ["--spot-x" as string]: "50%",
        ["--spot-y" as string]: "50%",
        ["--spot-opacity" as string]: "0",
      }}
      className="relative glass p-6 rounded-3xl border-white/5 flex flex-col items-center text-center overflow-hidden cursor-default group"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
        style={{
          opacity: "var(--spot-opacity, 0)",
          background: `radial-gradient(120px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${color}22, transparent 70%)`,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 rounded-3xl border transition-opacity duration-300"
        style={{
          opacity: "var(--spot-opacity, 0)",
          borderColor: `${color}55`,
        }}
      />

      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
        style={{
          backgroundColor: `${color}20`,
          boxShadow: `0 0 20px ${color}30`,
        }}
      >
        <div className="transition-transform duration-300 group-hover:-translate-y-1">
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
      </div>

      <p className="text-sm font-medium text-foreground/70 relative z-10">{name}</p>
    </motion.div>
  );
}
