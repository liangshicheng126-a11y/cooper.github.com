"use client";

import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { shouldUseGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";
import GsapGlassHover from "@/components/motion/GsapGlassHover";
import Stack from "@/components/ui/Stack";

const ACCENT = "#6366f1";

type GsapAboutAvatarProps = {
  experienceLabel: string;
  className?: string;
};

export default function GsapAboutAvatar({
  experienceLabel,
  className,
}: GsapAboutAvatarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const idleTweenRef = useRef<gsap.core.Tween | null>(null);
  const hoveredRef = useRef(false);

  const tier = useMotionTier();
  const reduced = usePrefersReducedMotion();
  const gsapActive = shouldUseGsap(reduced);
  const cards = useMemo(
    () => [
      <img
        key="snow-journey"
        src="/photos/about-stack/snow-journey.webp"
        alt="Cooper in a snowy mountain landscape"
      />,
      <img
        key="ice-climb"
        src="/photos/about-stack/ice-climb.webp"
        alt="Ice climbing outdoors"
      />,
      <img
        key="ice-climb-action"
        src="/photos/about-stack/ice-climb-action.webp"
        alt="Cooper ice climbing with two ice axes"
      />,
      <img
        key="mountain-shell"
        src="/photos/about-stack/mountain-shell.webp"
        alt="Cooper facing a mountain ridge in outdoor gear"
      />,
      <img
        key="meadow-rest"
        src="/photos/about-stack/meadow-rest.webp"
        alt="Cooper resting in a mountain meadow"
      />,
    ],
    [],
  );

  const pauseIdle = () => {
    idleTweenRef.current?.pause();
    if (badgeRef.current) gsap.set(badgeRef.current, { clearProps: "y" });
  };

  const resumeIdle = () => {
    if (hoveredRef.current) return;
    if (tier === "full" && gsapActive) idleTweenRef.current?.restart();
  };

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      const frame = frameRef.current;
      const image = imageRef.current;
      const overlay = overlayRef.current;
      const badge = badgeRef.current;
      if (!wrapper || !frame || !image || !overlay || !badge) return;

      if (!gsapActive || tier === "minimal") {
        gsap.set(wrapper, { autoAlpha: 1, y: 0, scale: 1, clearProps: "all" });
        gsap.set(frame, { autoAlpha: 1, scale: 1 });
        gsap.set(image, { autoAlpha: 1, scale: 1 });
        gsap.set(overlay, { opacity: 0.35 });
        gsap.set(badge, { autoAlpha: 1, scale: 1, rotation: 0, y: 0 });
        return;
      }

      gsap.set(wrapper, { autoAlpha: 0, y: 18, scale: 0.96 });
      gsap.set(frame, { scale: 0.96, autoAlpha: 0 });
      gsap.set(image, { scale: 1.14, autoAlpha: 0 });
      gsap.set(overlay, { opacity: 0.35 });
      gsap.set(badge, { scale: 0, autoAlpha: 0, rotation: -18, y: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(wrapper, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42 }, 0)
        .to(frame, { autoAlpha: 1, scale: 1, duration: 0.35 }, 0.06)
        .to(
          image,
          {
            autoAlpha: 1,
            scale: tier === "full" ? 1.1 : 1.06,
            duration: 0.6,
          },
          0.12
        )
        .to(
          badge,
          {
            autoAlpha: 1,
            scale: 1,
            rotation: 0,
            duration: 0.48,
            ease: "back.out(1.6)",
          },
          0.25
        );

      if (tier === "full" && !reduced) {
        tl.add(() => {
          idleTweenRef.current?.kill();
          idleTweenRef.current = gsap.to(badge, {
            y: -5,
            duration: 2.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });
      }

      return () => {
        idleTweenRef.current?.kill();
        idleTweenRef.current = null;
      };
    },
    { scope: wrapperRef, dependencies: [tier, gsapActive, reduced] }
  );

  return (
    <div ref={wrapperRef} className="w-full h-full aspect-[4/5] max-h-[36rem]">
      <GsapGlassHover
        accent={ACCENT}
        variant="avatar"
        className={cn(
          "h-full w-full rounded-2xl glass p-3 sm:p-4 border-white/10 overflow-visible",
          className
        )}
        onHoverChange={(hovered) => {
          hoveredRef.current = hovered;
          if (hovered) pauseIdle();
          else resumeIdle();
        }}
      >
        <div
          ref={frameRef}
          className="relative h-full w-full p-3 sm:p-4"
        >
          <div
            ref={imageRef}
            data-gsh-image
            className="relative h-full w-full will-change-transform"
          >
            <Stack
              cards={cards}
              randomRotation
              sensitivity={110}
              sendToBackOnClick
              pauseOnHover
              ariaLabel="Drag, click, or press Enter to browse Cooper's photo stack"
            />
          </div>
          <div
            ref={overlayRef}
            data-gsh-overlay
            className="absolute inset-3 sm:inset-4 rounded-2xl bg-indigo-500/[0.06] mix-blend-overlay pointer-events-none"
            aria-hidden
          />
        </div>

        <div
          ref={badgeRef}
          data-gsh-badge
          className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 z-30 w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-2xl border border-white/30 overflow-hidden text-center flex flex-col items-center justify-center will-change-transform pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.95), rgba(79,70,229,0.9) 45%, rgba(67,56,202,0.95))",
          }}
        >
          <div
            className="absolute inset-0 bg-black/40 pointer-events-none"
            aria-hidden
          />
          <span className="relative z-10 text-3xl font-bold text-white tabular-nums">
            5+
          </span>
          <span className="relative z-10 text-[10px] uppercase font-bold text-white/90 tracking-widest">
            {experienceLabel}
          </span>
        </div>
      </GsapGlassHover>
    </div>
  );
}
