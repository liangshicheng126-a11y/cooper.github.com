"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
} from "react";

import styles from "./DepthText.module.css";

const MAX_LAYERS = 64;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getLayerColor = (
  faceColor: string,
  depthColor: string,
  index: number,
  total: number,
) => {
  const progress = total <= 1 ? 1 : index / total;
  const eased = progress * progress;
  const faceMix = Math.round((1 - eased) * 72 + 4);
  return `color-mix(in srgb, ${faceColor} ${faceMix}%, ${depthColor})`;
};

const getTransform = (rotateX: number, rotateY: number) =>
  `rotateX(${rotateX.toFixed(3)}deg) rotateY(${rotateY.toFixed(3)}deg)`;

type DepthTextProps = {
  text?: string;
  layers?: number;
  depth?: number;
  faceColor?: string;
  depthColor?: string;
  tilt?: number;
  pointerTracking?: boolean;
  smoothing?: number;
  perspective?: number;
  autoOrbit?: boolean;
  orbitSpeed?: number;
  fontSize?: string;
  fontWeight?: CSSProperties["fontWeight"];
  shadow?: boolean;
  wrap?: boolean;
  className?: string;
  style?: CSSProperties;
};

type DepthTextStyle = CSSProperties &
  Record<`--depth-text-${string}`, string | number>;

export default function DepthText({
  text = "Elevate",
  layers = 34,
  depth = 2.4,
  faceColor = "#f8fafc",
  depthColor = "#7c3aed",
  tilt = 7.5,
  pointerTracking = true,
  smoothing = 0.14,
  perspective = 900,
  autoOrbit = true,
  orbitSpeed = 0.35,
  fontSize = "clamp(2.75rem, 8.2vw, 6rem)",
  fontWeight = 900,
  shadow = true,
  wrap = false,
  className = "",
  style = {},
}: DepthTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);

  const safeLayers = clamp(Math.round(Number(layers) || 1), 2, MAX_LAYERS);
  const safeDepth = clamp(Number(depth) || 0, 0, 12);
  const safeTilt = clamp(Number(tilt) || 0, 0, 12);
  const safeSmoothing = clamp(Number(smoothing) || 0.14, 0.02, 0.35);
  const safePerspective = clamp(Number(perspective) || 900, 300, 2000);
  const safeOrbitSpeed = clamp(Number(orbitSpeed) || 0, 0, 2);

  const baseRotation = useMemo(
    () => ({ x: -safeTilt * 0.32, y: safeTilt * 0.42 }),
    [safeTilt],
  );

  const depthLayers = useMemo(
    () =>
      Array.from({ length: safeLayers }, (_, layerIndex) => {
        const index = safeLayers - layerIndex;
        return {
          index,
          color: getLayerColor(faceColor, depthColor, index, safeLayers),
          transform: `translateZ(${-index * safeDepth}px)`,
        };
      }),
    [safeLayers, safeDepth, faceColor, depthColor],
  );

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const canTrackPointer = pointerTracking && finePointer && !reducedMotion;

    let frameId = 0;
    let activePointer = false;
    let inView = true;
    let pageVisible = document.visibilityState === "visible";
    const startTime = performance.now();
    const current = { ...baseRotation };
    const target = { ...baseRotation };

    const applyTransform = () => {
      stage.style.transform = getTransform(current.x, current.y);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      activePointer = true;
      const x = clamp(
        (event.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.8),
        -1,
        1,
      );
      const y = clamp(
        (event.clientY - (rect.top + rect.height / 2)) / (rect.height * 0.8),
        -1,
        1,
      );

      target.x = baseRotation.x - y * safeTilt;
      target.y = baseRotation.y + x * safeTilt;
    };

    const handlePointerLeave = () => {
      activePointer = false;
      target.x = baseRotation.x;
      target.y = baseRotation.y;
    };

    const tick = (now: number) => {
      frameId = 0;
      if (!inView || !pageVisible) return;

      if ((!canTrackPointer || !activePointer) && autoOrbit) {
        const elapsed = (now - startTime) / 1000;
        const orbit = elapsed * safeOrbitSpeed * Math.PI * 2;
        const fallbackAmount = canTrackPointer ? 0.18 : 0.55;
        target.x =
          baseRotation.x + Math.sin(orbit) * safeTilt * fallbackAmount;
        target.y =
          baseRotation.y +
          Math.cos(orbit * 0.85) * safeTilt * fallbackAmount;
      }

      current.x += (target.x - current.x) * safeSmoothing;
      current.y += (target.y - current.y) * safeSmoothing;
      applyTransform();
      frameId = requestAnimationFrame(tick);
    };

    const syncAnimation = () => {
      const shouldRun =
        !reducedMotion && inView && pageVisible && (canTrackPointer || autoOrbit);
      stage.style.willChange = shouldRun ? "transform" : "auto";
      if (shouldRun && !frameId) frameId = requestAnimationFrame(tick);
      if (!shouldRun && frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const handleVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      syncAnimation();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncAnimation();
      },
      { rootMargin: "12%" },
    );

    applyTransform();
    observer.observe(root);
    document.addEventListener("visibilitychange", handleVisibility);

    if (canTrackPointer) {
      root.addEventListener("pointermove", handlePointerMove);
      root.addEventListener("pointerleave", handlePointerLeave);
    }

    syncAnimation();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      if (frameId) cancelAnimationFrame(frameId);
      stage.style.willChange = "auto";
    };
  }, [
    autoOrbit,
    baseRotation,
    pointerTracking,
    safeOrbitSpeed,
    safeSmoothing,
    safeTilt,
  ]);

  const rootStyle: DepthTextStyle = {
    ...style,
    "--depth-text-perspective": `${safePerspective}px`,
    "--depth-text-font-size": fontSize,
    "--depth-text-font-weight": String(fontWeight),
    "--depth-text-face-color": faceColor,
    "--depth-text-depth-color": depthColor,
    "--depth-text-shadow": shadow
      ? `0 22px 34px color-mix(in srgb, ${depthColor} 26%, transparent), 0 4px 8px rgba(0, 0, 0, 0.28)`
      : "none",
  };

  return (
    <span
      ref={rootRef}
      className={`${styles.root} ${wrap ? styles.wrap : ""} ${className}`.trim()}
      style={rootStyle}
    >
      <span ref={stageRef} className={styles.stage}>
        {depthLayers.map((layer) => (
          <span
            aria-hidden="true"
            className={styles.layer}
            key={layer.index}
            style={{ color: layer.color, transform: layer.transform }}
          >
            {text}
          </span>
        ))}
        <span className={styles.face}>{text}</span>
      </span>
    </span>
  );
}
