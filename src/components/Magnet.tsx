"use client";

import { useState, useEffect, useRef } from "react";

type MagnetProps = {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  wrapperClassName?: string;
  innerClassName?: string;
};

export default function Magnet({
  children,
  padding = 60,
  disabled = false,
  magnetStrength = 2.5,
  wrapperClassName = "",
  innerClassName = "",
}: MagnetProps) {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const magnetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on non-touch devices
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
      return;
    }

    if (disabled) {
      setPosition({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!magnetRef.current) return;
      const { left, top, width, height } =
        magnetRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distX = Math.abs(centerX - e.clientX);
      const distY = Math.abs(centerY - e.clientY);

      if (distX < width / 2 + padding && distY < height / 2 + padding) {
        setIsActive(true);
        const offsetX = (e.clientX - centerX) / magnetStrength;
        const offsetY = (e.clientY - centerY) / magnetStrength;
        setPosition({ x: offsetX, y: offsetY });
      } else {
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [padding, disabled, magnetStrength]);

  const transitionStyle = isActive
    ? "transform 0.2s ease-out"
    : "transform 0.5s ease-in-out";

  return (
    <div ref={magnetRef} className={wrapperClassName} style={{ display: "inline-flex" }}>
      <div
        className={innerClassName}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: transitionStyle,
          display: "inline-flex",
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
