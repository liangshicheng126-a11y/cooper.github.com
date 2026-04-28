"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DIST = 72;
const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export default function ScrollDirectionSection({ children, className, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: false,
    amount: 0.2,
    margin: "-8% 0px -10% 0px",
  });

  const lastScrollY = useRef(0);
  const scrollDirRef = useRef<"up" | "down">("down");
  const [offY, setOffY] = useState(DIST);

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

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: DIST }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : offY,
      }}
      transition={{ duration: 0.55, ease }}
      className={cn(className)}
    >
      {children}
    </motion.section>
  );
}
