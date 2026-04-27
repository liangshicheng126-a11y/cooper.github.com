"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollBlobs() {
  const { scrollYProgress } = useScroll();

  const blob1Y = useTransform(scrollYProgress, [0, 1], ["-8%", "18%"]);
  const blob1X = useTransform(scrollYProgress, [0, 1], ["-6%", "4%"]);
  const blob1Scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const blob2Y = useTransform(scrollYProgress, [0, 1], ["30%", "10%"]);
  const blob2X = useTransform(scrollYProgress, [0, 1], ["86%", "76%"]);
  const blob2Scale = useTransform(scrollYProgress, [0, 1], [1.05, 0.95]);

  const blob3Y = useTransform(scrollYProgress, [0, 1], ["88%", "70%"]);
  const blob3X = useTransform(scrollYProgress, [0, 1], ["18%", "28%"]);
  const blob3Scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div className="liquid-bg pointer-events-none">
      <motion.div
        aria-hidden
        className="blob"
        style={{ top: blob1Y, left: blob1X, scale: blob1Scale }}
      />
      <motion.div
        aria-hidden
        className="blob"
        style={{
          top: blob2Y,
          left: blob2X,
          scale: blob2Scale,
          background: "linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)",
          opacity: 0.13,
        }}
      />
      <motion.div
        aria-hidden
        className="blob"
        style={{
          top: blob3Y,
          left: blob3X,
          scale: blob3Scale,
          background: "linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)",
          opacity: 0.12,
        }}
      />
    </div>
  );
}

