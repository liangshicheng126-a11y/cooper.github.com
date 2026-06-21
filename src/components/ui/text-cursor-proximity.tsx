"use client";

import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  motion,
  MotionValue,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from "motion/react";

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
  positionsRef: React.RefObject<Array<{ x: number; y: number }>>;
  activeRef: React.RefObject<boolean>;
  index: number;
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
  positionsRef,
  activeRef,
  index,
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
    if (!activeRef.current) {
      if (proximity.get() !== 0) proximity.set(0);
      return;
    }

    const letterCenter = positionsRef.current[index];
    if (!letterCenter) return;
    const distance = calculateDistance(
      mousePositionRef.current.x,
      mousePositionRef.current.y,
      letterCenter.x,
      letterCenter.y
    );

    proximity.set(calculateFalloff(distance, radius, falloff));
  });

  return (
    <motion.span
      ref={ref}
      data-proximity-letter
      data-proximity-index={index}
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
    const localRef = useRef<HTMLSpanElement | null>(null);
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const positionsRef = useRef<Array<{ x: number; y: number }>>([]);
    const activeRef = useRef(false);
    const words = label.split(" ");
    let letterIndex = 0;

    const setRefs = useCallback(
      (node: HTMLSpanElement | null) => {
        localRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const measureLetters = useCallback(() => {
      const container = containerRef.current;
      const root = localRef.current;
      if (!container || !root) return;

      const containerRect = container.getBoundingClientRect();
      const nextPositions: Array<{ x: number; y: number }> = [];
      root.querySelectorAll<HTMLElement>("[data-proximity-letter]").forEach((el) => {
        const indexAttr = el.dataset.proximityIndex;
        if (indexAttr == null) return;

        const rect = el.getBoundingClientRect();
        nextPositions[Number(indexAttr)] = {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        };
      });
      positionsRef.current = nextPositions;
    }, [containerRef]);

    useEffect(() => {
      let rafId = requestAnimationFrame(measureLetters);
      const handleResize = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(measureLetters);
      };

      window.addEventListener("resize", handleResize);
      document.fonts?.ready.then(measureLetters).catch(() => {});

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", handleResize);
      };
    }, [label, measureLetters]);

    const updateMouse = (event: React.PointerEvent<HTMLSpanElement>) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mousePositionRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    return (
      <span
        ref={setRefs}
        className="inline"
        onClick={onClick}
        onPointerEnter={(event) => {
          activeRef.current = true;
          measureLetters();
          updateMouse(event);
        }}
        onPointerMove={updateMouse}
        onPointerLeave={() => {
          activeRef.current = false;
        }}
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
                  positionsRef={positionsRef}
                  activeRef={activeRef}
                  index={currentLetterIndex}
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
