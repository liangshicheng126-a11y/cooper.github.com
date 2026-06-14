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
  letterIndex: number;
  proximity: MotionValue<number>;
  styles: TextProps["styles"];
  setRef: (el: HTMLSpanElement | null, index: number) => void;
}

function ProximityLetter({
  letter,
  letterIndex,
  proximity,
  styles,
  setRef,
}: LetterProps) {
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

  return (
    <motion.span
      ref={(el) => setRef(el, letterIndex)}
      className="inline-block"
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
    const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const mousePositionRef = useMousePositionRef(containerRef);

    const letterCount = label.replace(/\s/g, "").length;
    const letterProximities = useRef<MotionValue<number>[]>(
      Array.from({ length: letterCount }, () => useMotionValue(0))
    );

    const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const calculateFalloff = (distance: number) => {
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
    };

    useAnimationFrame(() => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      letterRefs.current.forEach((letterRef, index) => {
        if (!letterRef) return;

        const rect = letterRef.getBoundingClientRect();
        const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
        const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

        const distance = calculateDistance(
          mousePositionRef.current.x,
          mousePositionRef.current.y,
          letterCenterX,
          letterCenterY
        );

        letterProximities.current[index]?.set(calculateFalloff(distance));
      });
    });

    const setLetterRef = (el: HTMLSpanElement | null, index: number) => {
      letterRefs.current[index] = el;
    };

    const words = label.split(" ");
    let letterIndex = 0;

    return (
      <span
        ref={ref}
        className={`${className ?? ""} inline`}
        onClick={onClick}
        {...props}
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {word.split("").map((letter) => {
              const currentLetterIndex = letterIndex++;
              const proximity = letterProximities.current[currentLetterIndex];

              return (
                <ProximityLetter
                  key={currentLetterIndex}
                  letter={letter}
                  letterIndex={currentLetterIndex}
                  proximity={proximity}
                  styles={styles}
                  setRef={setLetterRef}
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
export default TextCursorProximity;
