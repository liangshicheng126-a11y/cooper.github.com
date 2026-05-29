"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={
          reduced
            ? { opacity: 0 }
            : { opacity: 0, y: 16, scale: 0.985 }
        }
        animate={
          reduced
            ? { opacity: 1 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        exit={
          reduced
            ? { opacity: 0 }
            : { opacity: 0, y: -12, scale: 0.99 }
        }
        transition={{
          duration: reduced ? 0.15 : 0.38,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
