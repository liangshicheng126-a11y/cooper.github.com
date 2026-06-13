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
          opacity: 0,
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

      const tl = gsap.timeline({
        delay: bloomStart,
        onComplete: () => {
          routes.forEach((el) => {
            el.style.animationDelay = "0s";
          });

          markIntroPlayed();
          setIntroMode("idle");
          setIntroActive(false);
          setIntroComplete(true);
          document.documentElement.removeAttribute("data-intro-active");
          document.documentElement.removeAttribute("data-intro-needed");

          requestAnimationFrame(() => {
            routes.forEach((el) => {
              gsap.set(el, { clearProps: "all" });
            });
            ScrollTrigger.refresh();
          });
        },
      });

      routes.forEach((el, i) => {
        const start = i * INTRO_TIMING.bloomStagger;
        tl.to(
          el,
          {
            opacity: 1,
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
      setIntroMode("handoff");

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
          el.style.animationDelay = "";
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
