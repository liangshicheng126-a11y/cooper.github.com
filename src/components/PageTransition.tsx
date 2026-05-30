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
            : { opacity: 0, y: 8 }
        }
        animate={
          reduced
            ? { opacity: 1 }
            : { opacity: 1, y: 0 }
        }
        exit={
          reduced
            ? { opacity: 0 }
            : { opacity: 0, y: -8 }
        }
        transition={{
          duration: reduced ? 0.15 : 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
