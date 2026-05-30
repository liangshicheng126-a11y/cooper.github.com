"use client";

import { useRef } from "react";
import {
  motion,
  type HTMLMotionProps,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import useMotionTier from "@/hooks/useMotionTier";
import { cn } from "@/lib/utils";

const spring = { damping: 22, stiffness: 180, mass: 0.8 };

type GlassHoverCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  accent: string;
  children: React.ReactNode;
  /** 3D tilt on desktop full tier */
  enableTilt?: boolean;
  /** Scale on hover when tier is full */
  hoverScale?: number;
  /** Scale on hover when tier is reduced */
  reducedHoverScale?: number;
};

export default function GlassHoverCard({
  accent,
  children,
  className,
  enableTilt = true,
  hoverScale = 1.03,
  reducedHoverScale = 1.02,
  style,
  ...motionProps
}: GlassHoverCardProps) {
  const tier = useMotionTier();
  const tiltActive = tier === "full" && enableTilt;
  const spotlightActive = tier === "full";
  const reducedActive = tier === "reduced";
  const scaleTarget = tier === "full" ? hoverScale : reducedHoverScale;

  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [10, -10]), spring);
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-10, 10]), spring);
  const scale = useSpring(1, spring);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !spotlightActive) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    if (tiltActive) {
      rawX.set(nx);
      rawY.set(ny);
    }
    ref.current.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  const handleMouseEnter = () => {
    if (tier === "minimal") {
      ref.current?.style.setProperty("border-color", `${accent}33`);
      return;
    }
    scale.set(scaleTarget);
    ref.current?.style.setProperty("--spot-opacity", "1");
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    scale.set(1);
    ref.current?.style.setProperty("--spot-opacity", "0");
    if (tier === "minimal") {
      ref.current?.style.removeProperty("border-color");
    }
  };

  return (
    <motion.div
      ref={ref}
      {...motionProps}
      onMouseMove={tier === "minimal" ? undefined : handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        ...(tiltActive
          ? {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d" as const,
              transformOrigin: "center center",
            }
          : {}),
        ...(tier !== "minimal" ? { scale } : {}),
        ["--spot-x" as string]: "50%",
        ["--spot-y" as string]: "50%",
        ["--spot-opacity" as string]: "0",
      }}
      className={cn(
        "relative glass border-white/5 overflow-hidden cursor-default group transition-colors",
        className,
      )}
    >
      {(spotlightActive || reducedActive) && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
            style={{
              opacity: "var(--spot-opacity, 0)",
              background: spotlightActive
                ? `radial-gradient(120px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${accent}22, transparent 70%)`
                : `radial-gradient(ellipse at 50% 50%, ${accent}18, transparent 72%)`,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] border transition-opacity duration-300"
            style={{
              opacity: "var(--spot-opacity, 0)",
              borderColor: `${accent}55`,
            }}
          />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
