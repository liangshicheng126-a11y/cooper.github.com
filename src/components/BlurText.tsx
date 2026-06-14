"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import useMotionTier from "@/hooks/useMotionTier";
import { useIntroRevealReady } from "@/components/motion/IntroPlaybackContext";

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "characters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  stepDuration?: number;
  onAnimationComplete?: () => void;
};

const buildKeyframes = (
  from: Record<string, unknown>,
  steps: Record<string, unknown>[]
) => {
  const keys = new Set([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);
  const keyframes: Record<string, unknown[]> = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
};

export default function BlurText({
  text = "",
  delay = 120,
  className = "",
  animateBy = "words",
  direction = "bottom",
  threshold = 0.1,
  rootMargin = "0px",
  stepDuration = 0.38,
  onAnimationComplete,
}: BlurTextProps) {
  const tier = useMotionTier();
  const introRevealReady = useIntroRevealReady();
  const useBlur = tier === "full";
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!introRevealReady) return;
    setInView(false);
  }, [text, introRevealReady]);

  useEffect(() => {
    if (!introRevealReady) return;
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [introRevealReady, threshold, rootMargin, text]);

  const defaultFrom = useMemo(() => {
    if (useBlur) {
      return direction === "top"
        ? { filter: "blur(6px)", opacity: 0, y: -28 }
        : { filter: "blur(6px)", opacity: 0, y: 28 };
    }
    return direction === "top"
      ? { opacity: 0, y: -28 }
      : { opacity: 0, y: 28 };
  }, [direction, useBlur]);

  const defaultTo = useMemo(() => {
    if (useBlur) {
      return [{ filter: "blur(0px)", opacity: 1, y: 0 }];
    }
    return [{ opacity: 1, y: 0 }];
  }, [useBlur]);

  const stepCount = defaultTo.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(defaultFrom, defaultTo);
        const isLast = index === elements.length - 1;

        return (
          <motion.span
            key={`${text}-${index}`}
            initial={defaultFrom as Record<string, number | string>}
            animate={
              inView
                ? (animateKeyframes as Record<string, (number | string)[]>)
                : (defaultFrom as Record<string, number | string>)
            }
            transition={{
              duration: totalDuration,
              times,
              delay: (index * delay) / 1000,
              ease: "easeOut",
            }}
            onAnimationComplete={
              isLast && onAnimationComplete ? onAnimationComplete : undefined
            }
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {segment === " " ? "\u00A0" : segment}
            {animateBy === "words" && !isLast ? "\u00A0" : ""}
          </motion.span>
        );
      })}
    </p>
  );
}
