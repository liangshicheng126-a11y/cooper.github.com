"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Layout } from "lucide-react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { shouldUseGsap } from "@/lib/motion";

type ConstructionHeroProps = {
  title: string;
  subtitle: string;
};

export default function ConstructionHero({ title, subtitle }: ConstructionHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const useGsap = shouldUseGsap(reduced);

  useGSAP(
    () => {
      if (!useGsap || !iconRef.current || !ringRef.current || !barRef.current) return;

      gsap.to(iconRef.current, {
        y: -10,
        rotation: 2,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(ringRef.current, {
        scale: 1.12,
        opacity: 0.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.fromTo(
        barRef.current,
        { xPercent: -100 },
        {
          xPercent: 100,
          duration: 1.8,
          repeat: -1,
          ease: "none",
        }
      );
    },
    { scope: rootRef, dependencies: [useGsap] }
  );

  return (
    <div
      ref={rootRef}
      className="min-h-[55vh] rounded-[40px] glass border-white/10 flex flex-col items-center justify-center text-center px-6 py-16"
    >
      <div ref={iconRef} className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
          <Layout className="w-10 h-10 text-indigo-400" />
        </div>
        <span
          ref={ringRef}
          className="absolute -inset-2 rounded-3xl border border-indigo-400/30"
          style={useGsap ? undefined : { opacity: 0.45 }}
        />
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">{title}</h1>
      <p className="text-lg sm:text-xl text-foreground/60 mb-10">{subtitle}</p>

      <div className="w-full max-w-md h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          ref={barRef}
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400"
        />
      </div>
    </div>
  );
}
