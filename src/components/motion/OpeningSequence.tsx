"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useIntroPlayback } from "@/components/motion/IntroPlaybackContext";
import { INTRO_TIMING, markIntroPlayed } from "@/lib/openingIntro";

const WORDMARK = Array.from("COOPER.");

export default function OpeningSequence() {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const {
    shouldPlayIntro,
    introComplete,
    setIntroActive,
    setIntroComplete,
    setIntroMode,
  } = useIntroPlayback();

  const finishIntro = useCallback(() => {
    markIntroPlayed();
    setIntroMode("idle");
    setIntroActive(false);
    setIntroComplete(true);
    document.documentElement.removeAttribute("data-intro-active");
    document.documentElement.removeAttribute("data-intro-needed");
  }, [setIntroActive, setIntroComplete, setIntroMode]);

  const skipIntro = useCallback(() => {
    const timeline = timelineRef.current;
    if (timeline) {
      timeline.progress(1);
      return;
    }
    finishIntro();
  }, [finishIntro]);

  useEffect(() => {
    if (!shouldPlayIntro || introComplete) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") skipIntro();
    };
    const failsafe = window.setTimeout(skipIntro, INTRO_TIMING.failsafeMs);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(failsafe);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [introComplete, shouldPlayIntro, skipIntro]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !shouldPlayIntro || introComplete) return;

      const topShutter = root.querySelector<HTMLElement>("[data-opening-shutter='top']");
      const bottomShutter = root.querySelector<HTMLElement>("[data-opening-shutter='bottom']");
      const signal = root.querySelector<HTMLElement>("[data-opening-signal]");
      const aperture = root.querySelector<HTMLElement>("[data-opening-aperture]");
      const wordmark = root.querySelector<HTMLElement>("[data-opening-wordmark]");
      const skip = root.querySelector<HTMLElement>("[data-opening-skip]");
      const glyphs = Array.from(root.querySelectorAll<HTMLElement>("[data-opening-glyph]"));
      const backgroundLines = document.querySelector<HTMLElement>(".night-backdrop__lines");
      const backgroundLineOpacity = window.matchMedia("(max-width: 640px)").matches
        ? 0.44
        : 0.58;

      gsap.set(root, { autoAlpha: 1 });
      gsap.set([topShutter, bottomShutter], {
        clipPath: "inset(0 0% 0 0%)",
        force3D: true,
      });
      if (backgroundLines) {
        gsap.set(backgroundLines, {
          clipPath: "inset(0 100% 0 0%)",
          autoAlpha: 0,
          willChange: "clip-path, opacity",
        });
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power4.out" },
        onComplete: finishIntro,
      });
      timelineRef.current = timeline;

      timeline
        .addLabel("brand", 0)
        .to(
          wordmark,
          { autoAlpha: 1, duration: 0.12, ease: "power2.out" },
          "brand"
        )
        .to(
          glyphs,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: INTRO_TIMING.glyphDuration,
            stagger: INTRO_TIMING.glyphStagger,
          },
          "brand+=0.08"
        )
        .to(skip, { autoAlpha: 1, duration: 0.24, ease: "power2.out" }, "brand+=0.38")
        .addLabel("lines", `+=${INTRO_TIMING.holdDuration}`)
        .set(root, { backgroundColor: "rgba(5, 5, 6, 0)" }, "lines")
        .to(
          signal,
          {
            autoAlpha: 1,
            scale: 1,
            duration: INTRO_TIMING.signalDuration,
          },
          "lines"
        )
        .to(
          aperture,
          {
            scaleX: 1,
            autoAlpha: 1,
            duration: INTRO_TIMING.lineDuration,
            ease: "power2.inOut",
          },
          "lines"
        )
        .to(
          [topShutter, bottomShutter],
          {
            clipPath: "inset(0 0% 0 100%)",
            duration: INTRO_TIMING.lineDuration,
            ease: "power2.inOut",
            force3D: true,
          },
          "lines"
        );

      if (backgroundLines) {
        timeline.to(
          backgroundLines,
          {
            clipPath: "inset(0 0% 0 0%)",
            autoAlpha: backgroundLineOpacity,
            duration: INTRO_TIMING.lineDuration,
            ease: "power2.inOut",
          },
          "lines"
        );
      }

      timeline
        .addLabel("details", ">+=0.14")
        .call(
          () => {
            setIntroMode("handoff");
            document.documentElement.removeAttribute("data-intro-needed");
          },
          undefined,
          "details"
        )
        .to(
          [wordmark, aperture, signal, skip],
          {
            autoAlpha: 0,
            y: -8,
            filter: "blur(7px)",
            duration: INTRO_TIMING.releaseDuration,
            ease: "power2.in",
          },
          "details"
        )
        .to(root, { autoAlpha: 0, duration: 0.14, ease: "none" }, ">-=0.08");

      return () => {
        timeline.kill();
        timelineRef.current = null;
        if (backgroundLines) {
          backgroundLines.style.willChange = "";
        }
      };
    },
    {
      scope: rootRef,
      dependencies: [finishIntro, introComplete, shouldPlayIntro, setIntroMode],
      revertOnUpdate: true,
    }
  );

  if (!shouldPlayIntro || introComplete) return null;

  return (
    <div ref={rootRef} className="opening-sequence">
      <div
        className="opening-sequence__shutter opening-sequence__shutter--top"
        data-opening-shutter="top"
        aria-hidden
      />
      <div
        className="opening-sequence__shutter opening-sequence__shutter--bottom"
        data-opening-shutter="bottom"
        aria-hidden
      />

      <div className="opening-sequence__stage">
        <span className="opening-sequence__signal" data-opening-signal aria-hidden />
        <span className="opening-sequence__aperture" data-opening-aperture aria-hidden />
        <span
          className="opening-sequence__wordmark"
          data-opening-wordmark
          role="img"
          aria-label="COOPER."
        >
          {WORDMARK.map((glyph, index) => (
            <span key={`${glyph}-${index}`} data-opening-glyph aria-hidden>
              {glyph}
            </span>
          ))}
        </span>
      </div>

      <button
        type="button"
        className="opening-sequence__skip"
        data-opening-skip
        onClick={skipIntro}
        aria-label="跳过网站开场动画"
      >
        跳过 <span aria-hidden>/ SKIP</span>
      </button>
    </div>
  );
}
