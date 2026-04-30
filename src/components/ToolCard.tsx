"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type ToolCardProps = {
  name: string;
  icon: React.ElementType;
  color: string;
  index: number;
};

const spring = { damping: 22, stiffness: 180, mass: 0.8 };

export default function ToolCard({ name, icon: Icon, color, index }: ToolCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 });

  // Raw mouse position relative to card center (–1 to 1)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smooth springs for tilt
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [10, -10]), spring);
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-10, 10]), spring);
  const scale = useSpring(1, spring);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    rawX.set(nx);
    rawY.set(ny);
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    setHovered(true);
    scale.set(1.06);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    rawX.set(0);
    rawY.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      // Stagger entry on mount
      initial={{ opacity: 0, y: 28, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.48,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
      }}
      className="relative glass p-6 rounded-3xl border-white/5 flex flex-col items-center text-center overflow-hidden cursor-default"
    >
      {/* Mouse-follow spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(120px circle at ${spotlight.x}px ${spotlight.y}px, ${color}22, transparent 70%)`,
        }}
      />

      {/* Border highlight on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl border transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          borderColor: `${color}55`,
        }}
      />

      {/* Icon container */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
        style={{
          backgroundColor: `${color}20`,
          boxShadow: hovered
            ? `0 8px 32px ${color}50, 0 0 0 1px ${color}30`
            : `0 0 20px ${color}30`,
        }}
      >
        <motion.div
          animate={hovered ? { y: [0, -4, 0] } : { y: 0 }}
          transition={
            hovered
              ? { duration: 0.55, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 }
              : { duration: 0.25 }
          }
        >
          <Icon className="w-7 h-7" style={{ color }} />
        </motion.div>
      </div>

      <p className="text-sm font-medium text-foreground/70 relative z-10">{name}</p>
    </motion.div>
  );
}
