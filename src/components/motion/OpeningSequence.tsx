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
  const filmRef = useRef<HTMLVideoElement>(null);
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
    document.documentElement.removeAttribute("data-intro-film");
    document.documentElement.removeAttribute("data-intro-active");
    document.documentElement.removeAttribute("data-intro-needed");
  }, [setIntroActive, setIntroComplete, setIntroMode]);

  const skipIntro = useCallback(() => {
    if (filmRef.current) filmRef.current.style.display = "none";
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
        paused: true,
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
          },
          undefined,
          "details"
        )
        .to(
          [wordmark, aperture, signal],
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

      // Play the splash film first; its final frame equals this timeline's first frame.
      // It only starts once it can play through, and any mid-play stall skips to the intro,
      // so a slow connection never sees a stuttering film.
      const film = filmRef.current;
      let filmTimer = 0;
      let loadTimer = 0;
      let stallTimer = 0;
      let started = false;
      const startTimeline = () => {
        if (started) return;
        started = true;
        window.clearTimeout(filmTimer);
        window.clearTimeout(loadTimer);
        window.clearTimeout(stallTimer);
        document.documentElement.removeAttribute("data-intro-film");
        if (film) {
          film.pause();
          film.style.display = "none";
        }
        timeline.play(0);
      };
      const onStall = () => {
        window.clearTimeout(stallTimer);
        stallTimer = window.setTimeout(startTimeline, INTRO_TIMING.splashStallMs);
      };
      const onPlaying = () => window.clearTimeout(stallTimer);
      const beginFilm = () => {
        if (!film || started) return;
        film.removeEventListener("canplaythrough", beginFilm);
        window.clearTimeout(loadTimer);
        film.addEventListener("waiting", onStall);
        film.addEventListener("playing", onPlaying);
        // Background canvases pause their GPU work while this attribute is set.
        document.documentElement.setAttribute("data-intro-film", "");
        filmTimer = window.setTimeout(startTimeline, INTRO_TIMING.splashMs + 1200);
        const attempt = film.play();
        if (attempt) attempt.catch(startTimeline);
      };
      const landscape = window.matchMedia("(min-aspect-ratio: 4/3)").matches;
      if (!film || !landscape) {
        startTimeline();
      } else {
        film.addEventListener("ended", startTimeline);
        film.addEventListener("error", startTimeline);
        if (film.readyState >= 4) {
          beginFilm();
        } else {
          film.addEventListener("canplaythrough", beginFilm);
          loadTimer = window.setTimeout(startTimeline, INTRO_TIMING.splashLoadMs);
        }
      }

      return () => {
        document.documentElement.removeAttribute("data-intro-film");
        window.clearTimeout(filmTimer);
        window.clearTimeout(loadTimer);
        window.clearTimeout(stallTimer);
        film?.removeEventListener("ended", startTimeline);
        film?.removeEventListener("error", startTimeline);
        film?.removeEventListener("canplaythrough", beginFilm);
        film?.removeEventListener("waiting", onStall);
        film?.removeEventListener("playing", onPlaying);
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

      <video
        ref={filmRef}
        className="opening-sequence__film"
        src={INTRO_TIMING.splashSrc}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
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

    </div>
  );
}
