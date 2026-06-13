"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIntroPlayback } from "@/components/motion/IntroPlaybackContext";
import {
  BLOB_ROUTE_ORIGIN,
  BLOB_ROUTE_SELECTORS,
  getBlobCenterPosePixels,
  INTRO_TIMING,
  markIntroPlayed,
} from "@/lib/blobIntro";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * Kill tweens and set animation-delay=0s so CSS keyframes start from 0%.
 * Does NOT call clearProps — we clean GSAP's inline matrix after CSS
 * animations are running (inside resumeBlobRouteCssAnimations).
 */
function snapBlobRoutesToKeyframe0(routes: readonly HTMLElement[]): void {
  routes.forEach((route, i) => {
    if (!BLOB_ROUTE_ORIGIN[i]) return;

    gsap.killTweensOf(route);
    route.style.animationDelay = "0s";

    const visual = route.querySelector<HTMLElement>(".blob-visual");
    if (visual) {
      visual.style.animationDelay = "0s";
    }
  });
}

/**
 * Remove animation:none class so CSS animations take over, then clean up
 * GSAP's inline transform AFTER the CSS animation is running. Because CSS
 * animations sit above inline styles in the cascade, clearProps here won't
 * cause a position flash.
 */
function resumeBlobRouteCssAnimations(
  routes: readonly HTMLElement[],
  container: HTMLElement | null
): void {
  container?.classList.remove("liquid-bg--intro-active");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      routes.forEach((route) => {
        gsap.set(route, { clearProps: "x,y,scale,rotation,opacity" });
        route.style.removeProperty("transform");
      });
      ScrollTrigger.refresh();
    });
  });
}

export default function BlobSplashIntro() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const {
    shouldPlayIntro,
    setIntroActive,
    setIntroComplete,
    setIntroMode,
  } = useIntroPlayback();

  useEffect(() => {
    if (!shouldPlayIntro) return;
    document.documentElement.setAttribute("data-intro-active", "");
    setIntroActive(true);
    setIntroMode("hold");

    return () => {
      document.documentElement.removeAttribute("data-intro-active");
    };
  }, [shouldPlayIntro, setIntroActive, setIntroMode]);

  useGSAP(
    () => {
      if (!shouldPlayIntro) return;

      const routes = BLOB_ROUTE_SELECTORS.map((selector) =>
        document.querySelector<HTMLElement>(selector)
      ).filter((el): el is HTMLElement => Boolean(el));

      if (routes.length !== BLOB_ROUTE_SELECTORS.length) return;

      const container = document.querySelector<HTMLElement>(".liquid-bg");
      container?.classList.add("liquid-bg--intro-active");

      const center = getBlobCenterPosePixels();

      routes.forEach((el) => {
        gsap.set(el, {
          x: center.x,
          y: center.y,
          scale: 0,
          rotation: 0,
          force3D: true,
        });
      });

      const overlay = overlayRef.current;
      if (overlay) {
        gsap.set(overlay, { autoAlpha: 1 });
      }

      const bloomStart = INTRO_TIMING.settleMs / 1000;
      const releaseAt =
        bloomStart +
        INTRO_TIMING.bloomDuration +
        INTRO_TIMING.bloomStagger * 2 +
        INTRO_TIMING.bloomSettleDuration;
      const handoffAt = releaseAt + INTRO_TIMING.releaseDuration;

      const tl = gsap.timeline({
        delay: bloomStart,
        onComplete: () => {
          // CSS animations resume; GSAP cleanup deferred inside resume fn
          resumeBlobRouteCssAnimations(routes, container);

          markIntroPlayed();
          setIntroMode("idle");
          setIntroActive(false);
          setIntroComplete(true);
          document.documentElement.removeAttribute("data-intro-active");
          document.documentElement.removeAttribute("data-intro-needed");
        },
      });

      routes.forEach((el, i) => {
        const start = i * INTRO_TIMING.bloomStagger;
        tl.to(
          el,
          {
            scale: INTRO_TIMING.bloomOvershoot,
            duration: INTRO_TIMING.bloomDuration * 0.75,
            ease: INTRO_TIMING.bloomEase,
          },
          start
        ).to(
          el,
          {
            scale: 1,
            duration: INTRO_TIMING.bloomSettleDuration,
            ease: "power2.out",
          },
          start + INTRO_TIMING.bloomDuration * 0.75
        );
      });

      tl.addLabel("release", releaseAt);
      tl.add(() => setIntroMode("handoff"), releaseAt);

      routes.forEach((el, i) => {
        const target = BLOB_ROUTE_ORIGIN[i];
        tl.to(
          el,
          {
            x: target.x,
            y: target.y,
            scale: target.scale,
            rotation: target.rotation,
            duration: INTRO_TIMING.releaseDuration,
            ease: INTRO_TIMING.releaseEase,
          },
          "release"
        );
      });

      // Snap anim-delays at the exact end of release — before onComplete cleans up
      tl.add(() => snapBlobRoutesToKeyframe0(routes), handoffAt);

      if (overlay) {
        tl.to(
          overlay,
          {
            autoAlpha: 0,
            duration: INTRO_TIMING.revealDuration,
            ease: "power2.out",
          },
          releaseAt + 0.15
        );
      }

      return () => {
        tl.kill();
        container?.classList.remove("liquid-bg--intro-active");
        routes.forEach((el) => {
          gsap.killTweensOf(el);
          gsap.set(el, { clearProps: "all" });
          el.style.removeProperty("transform");
          el.style.animationDelay = "";
          const visual = el.querySelector<HTMLElement>(".blob-visual");
          if (visual) visual.style.animationDelay = "";
        });
      };
    },
    { dependencies: [shouldPlayIntro] }
  );

  if (!shouldPlayIntro) return null;

  return (
    <div
      ref={overlayRef}
      className={cn(
        "blob-splash-overlay pointer-events-none fixed inset-0 z-[45]",
        "bg-gradient-to-br from-indigo-50/40 via-white/20 to-purple-50/30",
        "dark:from-indigo-950/30 dark:via-slate-950/20 dark:to-purple-950/25"
      )}
      aria-hidden
    />
  );
}
