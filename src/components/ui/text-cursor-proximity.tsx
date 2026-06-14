"use client";

import React, { CSSProperties, forwardRef, useRef } from "react";
import {
  motion,
  MotionValue,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref";

type CSSPropertiesWithValues = {
  [K in keyof CSSProperties]: string | number;
};

interface StyleValue<T extends keyof CSSPropertiesWithValues> {
  from: CSSPropertiesWithValues[T];
  to: CSSPropertiesWithValues[T];
}

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  styles: Partial<{
    [K in keyof CSSPropertiesWithValues]: StyleValue<K>;
  }>;
  containerRef: React.RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: "linear" | "exponential" | "gaussian";
}

interface LetterProps {
  letter: string;
  styles: TextProps["styles"];
  className?: string;
  containerRef: React.RefObject<HTMLElement | null>;
  mousePositionRef: React.RefObject<{ x: number; y: number }>;
  radius: number;
  falloff: NonNullable<TextProps["falloff"]>;
}

function calculateDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function calculateFalloff(
  distance: number,
  radius: number,
  falloff: NonNullable<TextProps["falloff"]>
) {
  const normalizedDistance = Math.min(Math.max(1 - distance / radius, 0), 1);

  switch (falloff) {
    case "exponential":
      return normalizedDistance ** 2;
    case "gaussian":
      return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
    case "linear":
    default:
      return normalizedDistance;
  }
}

function ProximityLetter({
  letter,
  styles,
  className,
  containerRef,
  mousePositionRef,
  radius,
  falloff,
}: LetterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const proximity = useMotionValue(0);

  const transformStyle = useTransform(
    proximity,
    [0, 1],
    [styles.transform?.from ?? "scale(1)", styles.transform?.to ?? "scale(1)"]
  );
  const colorStyle = useTransform(
    proximity,
    [0, 1],
    [styles.color?.from ?? "inherit", styles.color?.to ?? "inherit"]
  );

  const motionStyle: Record<string, MotionValue<string | number>> = {};
  if (styles.transform) motionStyle.transform = transformStyle;
  if (styles.color) motionStyle.color = colorStyle;

  useAnimationFrame(() => {
    const container = containerRef.current;
    const letterEl = ref.current;
    if (!container || !letterEl) return;

    const containerRect = container.getBoundingClientRect();
    const rect = letterEl.getBoundingClientRect();
    const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
    const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

    const distance = calculateDistance(
      mousePositionRef.current.x,
      mousePositionRef.current.y,
      letterCenterX,
      letterCenterY
    );

    proximity.set(calculateFalloff(distance, radius, falloff));
  });

  return (
    <motion.span
      ref={ref}
      className={className ? `inline-block ${className}` : "inline-block"}
      aria-hidden="true"
      style={motionStyle}
    >
      {letter}
    </motion.span>
  );
}

const TextCursorProximity = forwardRef<HTMLSpanElement, TextProps>(
  (
    {
      label,
      styles,
      containerRef,
      radius = 50,
      falloff = "linear",
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const mousePositionRef = useMousePositionRef(containerRef);
    const words = label.split(" ");
    let letterIndex = 0;

    return (
      <span
        ref={ref}
        className="inline"
        onClick={onClick}
        {...props}
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {word.split("").map((letter) => {
              const currentLetterIndex = letterIndex++;
              return (
                <ProximityLetter
                  key={`${label}-${currentLetterIndex}`}
                  letter={letter}
                  styles={styles}
                  className={className}
                  containerRef={containerRef}
                  mousePositionRef={mousePositionRef}
                  radius={radius}
                  falloff={falloff}
                />
              );
            })}
            {wordIndex < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
        <span className="sr-only">{label}</span>
      </span>
    );
  }
);

TextCursorProximity.displayName = "TextCursorProximity";

function TextCursorProximityKeyed(props: TextProps) {
  return <TextCursorProximity key={props.label} {...props} />;
}

export default TextCursorProximityKeyed;
