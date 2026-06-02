"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { MOTION_V2_ENABLED, shouldUseGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ACCENT = "#6366f1";
const IMAGE_SRC = "/experience-badge.png";

type GsapAboutAvatarProps = {
  experienceLabel: string;
  className?: string;
};

type QuickRefs = {
  cardScale: gsap.QuickToFunc | null;
  rotateX: gsap.QuickToFunc | null;
  rotateY: gsap.QuickToFunc | null;
  imgScale: gsap.QuickToFunc | null;
  imgX: gsap.QuickToFunc | null;
  imgY: gsap.QuickToFunc | null;
  overlayOpacity: gsap.QuickToFunc | null;
  badgeScale: gsap.QuickToFunc | null;
  badgeY: gsap.QuickToFunc | null;
  badgeRot: gsap.QuickToFunc | null;
};

export default function GsapAboutAvatar({
  experienceLabel,
  className,
}: GsapAboutAvatarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const quick = useRef<QuickRefs>({
    cardScale: null,
    rotateX: null,
    rotateY: null,
    imgScale: null,
    imgX: null,
    imgY: null,
    overlayOpacity: null,
    badgeScale: null,
    badgeY: null,
    badgeRot: null,
  });
  const hoveredRef = useRef(false);
  const idleTweenRef = useRef<gsap.core.Tween | null>(null);

  const tier = useMotionTier();
  const reduced = usePrefersReducedMotion();
  const gsapActive = shouldUseGsap(reduced);
  const interactive = gsapActive && tier !== "minimal";
  const tiltActive = interactive && tier === "full";
  const spotlightActive = interactive && tier === "full";

  useGSAP(
    () => {
      const card = cardRef.current;
      const frame = frameRef.current;
      const image = imageRef.current;
      const badge = badgeRef.current;
      if (!card || !frame || !image || !badge) return;

      if (!gsapActive) {
        gsap.set([card, frame, image, badge], { clearProps: "all" });
        return;
      }

      const q = quick.current;

      if (interactive) {
        q.cardScale = gsap.quickTo(card, "scale", { duration: 0.5, ease: "power2.out" });

        if (tiltActive) {
          gsap.set(card, { transformPerspective: 1000, transformStyle: "preserve-3d" });
          q.rotateX = gsap.quickTo(card, "rotateX", { duration: 0.4, ease: "power2.out" });
          q.rotateY = gsap.quickTo(card, "rotateY", { duration: 0.4, ease: "power2.out" });
        }

        gsap.set(image, { scale: tiltActive ? 1.1 : 1.06, force3D: true });
        q.imgScale = gsap.quickTo(image, "scale", { duration: 0.65, ease: "power2.out" });
        if (tiltActive) {
          q.imgX = gsap.quickTo(image, "x", { duration: 0.45, ease: "power2.out" });
          q.imgY = gsap.quickTo(image, "y", { duration: 0.45, ease: "power2.out" });
        }

        if (overlayRef.current) {
          gsap.set(overlayRef.current, { opacity: 0.35 });
          q.overlayOpacity = gsap.quickTo(overlayRef.current, "opacity", {
            duration: 0.35,
            ease: "power2.out",
          });
        }

        q.badgeScale = gsap.quickTo(badge, "scale", { duration: 0.4, ease: "power2.out" });
        q.badgeY = gsap.quickTo(badge, "y", { duration: 0.45, ease: "power2.out" });
        q.badgeRot = gsap.quickTo(badge, "rotation", { duration: 0.45, ease: "power2.out" });
      }

      gsap.set(card, { autoAlpha: 0, y: 28, scale: 0.94 });
      gsap.set(frame, { scale: 0.96, autoAlpha: 0 });
      gsap.set(image, { scale: 1.14, autoAlpha: 0 });
      gsap.set(badge, { scale: 0, autoAlpha: 0, rotation: -18 });

      const tl = gsap.timeline({
        delay: 0.12,
        defaults: { ease: "power3.out" },
      });

      tl.to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 0.72 }, 0)
        .to(frame, { autoAlpha: 1, scale: 1, duration: 0.55 }, 0.08)
        .to(image, { autoAlpha: 1, scale: tiltActive ? 1.1 : 1.06, duration: 0.8 }, 0.14)
        .to(
          badge,
          {
            autoAlpha: 1,
            scale: 1,
            rotation: 0,
            duration: 0.55,
            ease: "back.out(1.6)",
          },
          0.32
        );

      if (tier === "full" && !reduced) {
        tl.add(() => {
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
    { scope: rootRef, dependencies: [gsapActive, interactive, tiltActive, tier, reduced] }
  );

  const pauseIdle = () => {
    idleTweenRef.current?.pause();
    gsap.set(badgeRef.current, { clearProps: "y" });
  };

  const resumeIdle = () => {
    if (!hoveredRef.current && tier === "full" && interactive) {
      idleTweenRef.current?.restart();
    }
  };

  const resetHover = () => {
    hoveredRef.current = false;
    const q = quick.current;

    q.cardScale?.(1);
    q.rotateX?.(0);
    q.rotateY?.(0);
    q.imgScale?.(tiltActive ? 1.1 : 1.06);
    q.imgX?.(0);
    q.imgY?.(0);
    q.overlayOpacity?.(0.35);
    q.badgeScale?.(1);
    q.badgeY?.(0);
    q.badgeRot?.(0);

    spotlightRef.current?.style.setProperty("--spot-opacity", "0");
    cardRef.current?.style.setProperty("will-change", "auto");

    resumeIdle();
  };

  const applyHover = () => {
    if (!interactive) return;

    hoveredRef.current = true;
    pauseIdle();

    const q = quick.current;
    const hoverCardScale = tier === "full" ? 1.02 : 1.012;

    cardRef.current?.style.setProperty("will-change", "transform");
    q.cardScale?.(hoverCardScale);
    q.imgScale?.(tier === "full" ? 1.16 : 1.1);
    q.overlayOpacity?.(0.18);
    q.badgeScale?.(1.1);
    q.badgeY?.(-8);
    q.badgeRot?.(6);

    spotlightRef.current?.style.setProperty("--spot-opacity", "1");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !hoveredRef.current || !tiltActive) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    const q = quick.current;

    q.rotateX?.(-ny * 5);
    q.rotateY?.(nx * 5);
    q.imgX?.(-nx * 12);
    q.imgY?.(-ny * 12);

    if (spotlightActive && spotlightRef.current) {
      spotlightRef.current.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      spotlightRef.current.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "gsap-about-avatar relative aspect-square w-full",
        gsapActive && MOTION_V2_ENABLED && "gsap-about-avatar--active",
        className,
      )}
      onMouseEnter={applyHover}
      onMouseLeave={resetHover}
      onMouseMove={interactive ? handleMouseMove : undefined}
    >
      <div
        ref={cardRef}
        data-about-avatar-part
        className="relative h-full w-full rounded-[40px] glass border-white/10 p-4 overflow-visible"
      >
        {spotlightActive && (
          <div
            ref={spotlightRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300"
            style={{
              opacity: "var(--spot-opacity, 0)",
              background: `radial-gradient(160px circle at var(--spot-x, 55%) var(--spot-y, 45%), ${ACCENT}28, transparent 72%)`,
              ["--spot-x" as string]: "55%",
              ["--spot-y" as string]: "45%",
              ["--spot-opacity" as string]: "0",
            }}
          />
        )}

        <div
          ref={frameRef}
          className="relative h-full w-full overflow-hidden rounded-[30px]"
        >
          <div
            ref={imageRef}
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{
              backgroundImage: `url(${IMAGE_SRC})`,
            }}
            aria-hidden
          />
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay pointer-events-none"
            aria-hidden
          />
        </div>
      </div>

      <div
        ref={badgeRef}
        data-about-avatar-part
        data-about-badge
        className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 z-30 w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-2xl border border-white/30 overflow-hidden text-center flex flex-col items-center justify-center will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.95), rgba(79,70,229,0.9) 45%, rgba(67,56,202,0.95))",
        }}
      >
        <div className="absolute inset-0 bg-black/40 pointer-events-none" aria-hidden />
        <span className="relative z-10 text-3xl font-bold text-white tabular-nums">5+</span>
        <span className="relative z-10 text-[10px] uppercase font-bold text-white/90 tracking-widest">
          {experienceLabel}
        </span>
      </div>
    </div>
  );
}
