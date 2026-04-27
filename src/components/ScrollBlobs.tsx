"use client";

import { motion } from "framer-motion";

export default function ScrollBlobs() {
  return (
    <div className="liquid-bg pointer-events-none">
      <motion.div
        aria-hidden
        className="blob blob-indigo"
        animate={{
          x: [0, 36, -28, 18, -14, 0],
          y: [0, -26, 22, -18, 10, 0],
          rotate: [0, 10, -8, 6, -4, 0],
          scale: [1, 1.12, 0.94, 1.08, 0.98, 1],
        }}
        transition={{
          duration: 34,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror",
        }}
        style={{ top: "-6%", left: "-4%", width: "min(52vw, 620px)", opacity: 0.3 }}
      >
        <div className="blob-glow" />
        <div className="blob-noise" />
      </motion.div>
      <motion.div
        aria-hidden
        className="blob blob-cyan"
        animate={{
          x: [0, -34, 24, -18, 12, 0],
          y: [0, 22, -28, 14, -10, 0],
          rotate: [0, -12, 9, -7, 5, 0],
          scale: [1.05, 0.92, 1.12, 0.97, 1.04, 1.05],
        }}
        transition={{
          duration: 39,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror",
        }}
        style={{
          top: "28%",
          left: "80%",
          width: "min(46vw, 560px)",
          opacity: 0.26,
        }}
      >
        <div className="blob-glow" />
        <div className="blob-noise" />
      </motion.div>
      <motion.div
        aria-hidden
        className="blob blob-rose"
        animate={{
          x: [0, 28, -30, 20, -12, 0],
          y: [0, -20, 24, -16, 12, 0],
          rotate: [0, 8, -11, 6, -3, 0],
          scale: [1, 1.1, 0.9, 1.06, 0.96, 1],
        }}
        transition={{
          duration: 43,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror",
        }}
        style={{
          top: "86%",
          left: "20%",
          width: "min(42vw, 520px)",
          opacity: 0.24,
        }}
      >
        <div className="blob-glow" />
        <div className="blob-noise" />
      </motion.div>
    </div>
  );
}

