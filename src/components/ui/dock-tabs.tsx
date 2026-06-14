"use client";

import { useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import useMotionTier from "@/hooks/useMotionTier";
import { cn } from "@/lib/utils";

export type DockToolItem = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
};

type DockIconProps = {
  item: DockToolItem;
  mouseX: MotionValue<number>;
  magnify: boolean;
  batchReveal?: boolean;
};

function DockIcon({ item, mouseX, magnify, batchReveal }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    if (!magnify) return 0;
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [50, 80, 50]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const heightSync = useTransform(distance, [-150, 0, 150], [50, 80, 50]);
  const height = useSpring(heightSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const iconSize = magnify ? { width, height } : { width: 50, height: 50 };

  return (
    <div
      {...(batchReveal ? { "data-scroll-batch-item": true } : {})}
      className="flex-shrink-0"
    >
      <motion.div
        ref={ref}
        style={iconSize}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsClicked(true)}
        onMouseUp={() => setIsClicked(false)}
        className="aspect-square cursor-default flex items-center justify-center relative group"
        whileTap={magnify ? { scale: 0.95 } : undefined}
      >
        <motion.div
          className="w-full h-full rounded-2xl shadow-lg flex items-center justify-center text-white relative overflow-hidden"
          style={{ backgroundColor: item.color }}
          animate={{
            y: magnify ? (isClicked ? 2 : isHovered ? -8 : 0) : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
        >
          <motion.div
            className="[&_svg]:w-5 [&_svg]:h-5"
            animate={{
              scale: magnify && isHovered ? 1.1 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17,
            }}
          >
            {item.icon}
          </motion.div>

          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"
            animate={{
              opacity: isHovered ? 0.3 : 0.1,
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? -20 : 10,
            scale: isHovered ? 1 : 0.8,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none backdrop-blur-sm z-20"
        >
          {item.name}
        </motion.div>

        <motion.div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/80 rounded-full"
          animate={{
            scale: isClicked ? 1.5 : 1,
            opacity: isClicked ? 1 : 0.7,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </motion.div>
    </div>
  );
}

type DockTabsProps = {
  items: DockToolItem[];
  batchReveal?: boolean;
  className?: string;
};

export function DockTabs({ items, batchReveal, className }: DockTabsProps) {
  const mouseX = useMotionValue(Infinity);
  const tier = useMotionTier();
  const magnify = tier === "full";

  return (
    <div className={cn("flex items-center justify-center w-full py-2", className)}>
      <motion.div
        onMouseMove={magnify ? (e) => mouseX.set(e.pageX) : undefined}
        onMouseLeave={magnify ? () => mouseX.set(Infinity) : undefined}
        className="mx-auto flex h-20 items-end gap-3 sm:gap-4 rounded-3xl glass border-white/10 px-3 sm:px-4 pb-3.5 shadow-xl max-w-full overflow-x-auto"
      >
        {items.map((item) => (
          <DockIcon
            key={item.id}
            item={item}
            mouseX={mouseX}
            magnify={magnify}
            batchReveal={batchReveal}
          />
        ))}
      </motion.div>
    </div>
  );
}
