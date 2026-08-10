"use client";

import { useEffect, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Desktop composition width — layout is authored at this width, then scaled. */
export const VIEWPORT_CANVAS_WIDTH = 1440;
/** Below this, keep native responsive layout (mobile / tablet). */
export const VIEWPORT_CANVAS_MIN_WIDTH = 1280;

let scrollTriggerReady = false;

function ensureScrollTrigger() {
  if (scrollTriggerReady || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerReady = true;
}

function supportsCssZoom() {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  return CSS.supports("zoom", "1");
}

/**
 * Desktop-only uniform scale: lock layout to a design width and zoom the whole
 * chrome so text/modules grow proportionally instead of stretching with aspect ratio.
 */
export default function ViewportCanvas({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  const [active, setActive] = useState(false);
  const [zoomOk, setZoomOk] = useState(true);

  useEffect(() => {
    setZoomOk(supportsCssZoom());

    const update = () => {
      const width = document.documentElement.clientWidth;
      if (width < VIEWPORT_CANVAS_MIN_WIDTH || !supportsCssZoom()) {
        setActive(false);
        setScale(1);
        document.documentElement.removeAttribute("data-viewport-canvas");
        document.documentElement.style.removeProperty("--viewport-canvas-scale");
        return;
      }

      const next = width / VIEWPORT_CANVAS_WIDTH;
      setActive(true);
      setScale(next);
      document.documentElement.setAttribute("data-viewport-canvas", "on");
      document.documentElement.style.setProperty(
        "--viewport-canvas-scale",
        String(next),
      );
    };

    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      document.documentElement.removeAttribute("data-viewport-canvas");
      document.documentElement.style.removeProperty("--viewport-canvas-scale");
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    ensureScrollTrigger();
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [active, scale]);

  if (!active || !zoomOk) {
    return <>{children}</>;
  }

  return (
    <div
      className="viewport-canvas-root"
      data-viewport-canvas-root=""
      style={{
        width: VIEWPORT_CANVAS_WIDTH,
        zoom: scale,
      }}
    >
      {children}
    </div>
  );
}
