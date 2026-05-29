"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import GsapScrollReveal from "@/components/motion/GsapScrollReveal";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { MOTION_V2_ENABLED, shouldUseGsap } from "@/lib/motion";

const DIST = 48;
const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** When set, uses sticky slide-over stack (homepage) — always opaque, no scrub gaps */
  stackIndex?: number;
};

function ScrollDirectionSectionFramer({ children, className, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: false,
    amount: 0.14,
    margin: "-4% 0px -6% 0px",
  });

  const lastScrollY = useRef(0);
  const scrollDirRef = useRef<"up" | "down">("down");
  const [offY, setOffY] = useState(DIST);
  const [hasEntered, setHasEntered] = useState(false);

  const computeOffY = () => {
    const el = ref.current;
    if (!el) return DIST;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const mid = rect.top + rect.height / 2;
    const dir = scrollDirRef.current;

    if (mid > vh * 0.88) return DIST;
    if (mid < vh * 0.12) return -DIST;
    return dir === "down" ? -DIST : DIST;
  };

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const tick = () => {
      const y = window.scrollY;
      scrollDirRef.current = y > lastScrollY.current ? "down" : "up";
      lastScrollY.current = y;
      setOffY(computeOffY());
    };

    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    tick();
    return () => {
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
    };
  }, []);

  useEffect(() => {
    setOffY(computeOffY());
  }, [isInView]);

  useEffect(() => {
    if (isInView) setHasEntered(true);
  }, [isInView]);

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: DIST }}
      animate={{
        opacity: isInView || hasEntered ? 1 : 0,
        y: isInView ? 0 : offY,
      }}
      transition={{ duration: 0.55, ease }}
      className={cn(className)}
    >
      {children}
    </motion.section>
  );
}

export default function ScrollDirectionSection({
  children,
  className,
  id,
  stackIndex,
}: Props) {
  const reduced = usePrefersReducedMotion();

  if (stackIndex != null && MOTION_V2_ENABLED && !reduced) {
    return (
      <section
        id={id}
        className={cn("home-stack-panel", className)}
        style={{ zIndex: 20 + stackIndex * 10 }}
        data-stack-index={stackIndex}
      >
        {children}
      </section>
    );
  }

  if (MOTION_V2_ENABLED && shouldUseGsap(reduced)) {
    return (
      <GsapScrollReveal
        as="section"
        id={id}
        className={className}
        y={32}
        scrub={false}
        once
        start="top 92%"
      >
        {children}
      </GsapScrollReveal>
    );
  }

  return (
    <ScrollDirectionSectionFramer className={className} id={id}>
      {children}
    </ScrollDirectionSectionFramer>
  );
}
