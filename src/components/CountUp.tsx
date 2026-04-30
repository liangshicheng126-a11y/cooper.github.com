"use client";

import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

type CountUpProps = {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  separator?: string;
  suffix?: string;
  onStart?: () => void;
  onEnd?: () => void;
};

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 1.8,
  className = "",
  separator = "",
  suffix = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? to : from);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, { damping, stiffness });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  const getDecimalPlaces = (num: number) => {
    const str = num.toString();
    if (str.includes(".")) {
      const decimals = str.split(".")[1];
      if (parseInt(decimals) !== 0) return decimals.length;
    }
    return 0;
  };

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    (latest: number) => {
      const hasDecimals = maxDecimals > 0;
      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      };
      const formattedNumber = Intl.NumberFormat("en-US", options).format(
        latest
      );
      return separator
        ? formattedNumber.replace(/,/g, separator)
        : formattedNumber;
    },
    [maxDecimals, separator]
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent =
        formatValue(direction === "down" ? to : from) + suffix;
    }
  }, [from, to, direction, formatValue, suffix]);

  useEffect(() => {
    if (isInView) {
      onStart?.();
      const t1 = setTimeout(() => {
        motionValue.set(direction === "down" ? from : to);
      }, delay * 1000);
      const t2 = setTimeout(() => {
        onEnd?.();
      }, delay * 1000 + duration * 1000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isInView, motionValue, direction, from, to, delay, onStart, onEnd, duration]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest) + suffix;
      }
    });
  }, [springValue, formatValue, suffix]);

  return <span ref={ref} className={className} />;
}
