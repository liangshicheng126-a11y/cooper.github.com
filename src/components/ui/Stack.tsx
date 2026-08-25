"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import styles from "./Stack.module.css";

type AnimationConfig = {
  stiffness: number;
  damping: number;
};

type StackProps = {
  randomRotation?: boolean;
  sensitivity?: number;
  cards?: ReactNode[];
  animationConfig?: AnimationConfig;
  sendToBackOnClick?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  className?: string;
  ariaLabel?: string;
};

type CardRotateProps = {
  children: ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
  disableDrag: boolean;
  enableClick: boolean;
  isTop: boolean;
};

function CardRotate({
  children,
  onSendToBack,
  sensitivity,
  disableDrag,
  enableClick,
  isTop,
}: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [12, -12]);
  const rotateY = useTransform(x, [-100, 100], [-12, 12]);
  const didDrag = useRef(false);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    const passedThreshold =
      Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity;

    if (passedThreshold) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }

    window.setTimeout(() => {
      didDrag.current = false;
    }, 0);
  };

  const commonStyle = {
    x,
    y,
    rotateX,
    rotateY,
    zIndex: isTop ? 2 : 1,
    pointerEvents: isTop ? ("auto" as const) : ("none" as const),
  };

  if (disableDrag) {
    return (
      <motion.div
        className={styles.rotateDisabled}
        style={commonStyle}
        onClick={() => enableClick && onSendToBack()}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.rotate}
      style={commonStyle}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.58}
      whileTap={{ cursor: "grabbing" }}
      onDrag={() => {
        didDrag.current = true;
      }}
      onDragEnd={handleDragEnd}
      onClick={() => {
        if (enableClick && !didDrag.current) onSendToBack();
      }}
    >
      {children}
    </motion.div>
  );
}

export default function Stack({
  randomRotation = false,
  sensitivity = 140,
  cards = [],
  animationConfig = { stiffness: 260, damping: 24 },
  sendToBackOnClick = false,
  autoplay = false,
  autoplayDelay = 3600,
  pauseOnHover = false,
  className,
  ariaLabel = "Drag or click to browse the photo stack",
}: StackProps) {
  const reduced = usePrefersReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const [stack, setStack] = useState(() =>
    cards.map((content, index) => ({ id: index + 1, content })),
  );

  useEffect(() => {
    setStack(cards.map((content, index) => ({ id: index + 1, content })));
  }, [cards]);

  const rotations = useMemo(
    () => cards.map((_, index) => (randomRotation ? ((index * 7 + 3) % 9) - 4 : 0)),
    [cards, randomRotation],
  );

  const sendToBack = (id: number) => {
    setStack((current) => {
      if (current.length < 2) return current;
      const next = [...current];
      const index = next.findIndex((card) => card.id === id);
      if (index < 0) return current;
      const [card] = next.splice(index, 1);
      next.unshift(card);
      return next;
    });
  };

  useEffect(() => {
    if (!autoplay || reduced || stack.length < 2 || isPaused) return;

    const interval = window.setInterval(() => {
      const top = stack[stack.length - 1];
      if (top) sendToBack(top.id);
    }, autoplayDelay);

    return () => window.clearInterval(interval);
  }, [autoplay, autoplayDelay, isPaused, reduced, stack]);

  const topCard = stack[stack.length - 1];

  return (
    <div
      className={cn(styles.stack, className)}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && topCard) {
          event.preventDefault();
          sendToBack(topCard.id);
        }
      }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {stack.map((card, index) => {
        const isTop = index === stack.length - 1;
        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
            disableDrag={reduced}
            enableClick={sendToBackOnClick || reduced}
            isTop={isTop}
          >
            <motion.div
              className={styles.card}
              initial={false}
              animate={{
                rotateZ: reduced ? 0 : (stack.length - index - 1) * 2.6 + rotations[card.id - 1],
                scale: 1 + index * 0.048 - stack.length * 0.048,
                transformOrigin: "88% 88%",
              }}
              transition={
                reduced
                  ? { duration: 0.01 }
                  : {
                      type: "spring",
                      stiffness: animationConfig.stiffness,
                      damping: animationConfig.damping,
                    }
              }
              aria-hidden={!isTop}
            >
              {card.content}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}
