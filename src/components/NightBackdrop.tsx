"use client";

import dynamic from "next/dynamic";

const FloatingLines = dynamic(() => import("@/components/ui/FloatingLines"), {
  ssr: false,
});

const NIGHT_LINE_GRADIENT = ["#E945F5", "#2F4BC0", "#E945F5"];

export default function NightBackdrop() {
  return (
    <div className="night-backdrop" aria-hidden>
      <div className="night-backdrop__lines">
        <FloatingLines
          linesGradient={NIGHT_LINE_GRADIENT}
          animationSpeed={1}
          interactive={false}
          bendRadius={5}
          bendStrength={-0.5}
          mouseDamping={0.05}
          parallax
          parallaxStrength={0.2}
        />
      </div>
      <div className="night-backdrop__vignette" />
    </div>
  );
}
