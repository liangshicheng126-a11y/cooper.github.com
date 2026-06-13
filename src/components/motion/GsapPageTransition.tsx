"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { getRouteTransitionDirection } from "@/lib/routeTransition";
import { MOTION_V2_ENABLED, shouldUseGsap } from "@/lib/motion";
import { useIntroPlayback } from "@/components/motion/IntroPlaybackContext";
import { cn } from "@/lib/utils";

type GsapPageTransitionProps = {
  children: ReactNode;
};

export default function GsapPageTransition({ children }: GsapPageTransitionProps) {
  const pathname = usePathname();
  const tier = useMotionTier();
  const reduced = usePrefersReducedMotion();
  const useGsap = shouldUseGsap(reduced);
  const { shouldPlayIntro, introComplete } = useIntroPlayback();

  const shellRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef(pathname);
  const pendingChildrenRef = useRef(children);
  const animatingRef = useRef(false);
  const isFirstMountRef = useRef(true);

  const [displayChildren, setDisplayChildren] = useState(children);
  pendingChildrenRef.current = children;

  useLayoutEffect(() => {
    const el = contentRef.current;

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      prevPathRef.current = pathname;
      setDisplayChildren(children);

      if (!el || !useGsap || tier === "minimal") return;

      if (shouldPlayIntro && !introComplete) {
        gsap.set(el, { autoAlpha: 0, y: 18, force3D: true });
        return;
      }

      animatingRef.current = true;
      el.style.willChange = "transform, opacity";

      gsap.fromTo(
        el,
        tier === "full"
          ? { autoAlpha: 0, y: 18, force3D: true }
          : { autoAlpha: 0, y: 10, force3D: true },
        {
          autoAlpha: 1,
          y: 0,
          duration: tier === "full" ? 0.42 : 0.28,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(el, { clearProps: "transform" });
            el.style.willChange = "auto";
            animatingRef.current = false;
            requestAnimationFrame(() => ScrollTrigger.refresh());
          },
        }
      );
      return;
    }

    if (pathname === prevPathRef.current) {
      if (!animatingRef.current) {
        setDisplayChildren(children);
      }
      return;
    }

    const instant = !useGsap || tier === "minimal";

    if (instant || !el) {
      prevPathRef.current = pathname;
      setDisplayChildren(children);
      return;
    }

    if (animatingRef.current) {
      gsap.killTweensOf(el);
    }

    animatingRef.current = true;
    shellRef.current?.classList.add("is-page-transitioning");
    el.style.willChange = "transform, opacity";

    const direction = getRouteTransitionDirection(prevPathRef.current, pathname);
    const forward = direction >= 0;
    const fromX = forward ? 28 : -28;

    prevPathRef.current = pathname;
    setDisplayChildren(pendingChildrenRef.current);

    requestAnimationFrame(() => {
      const node = contentRef.current;
      if (!node) {
        animatingRef.current = false;
        shellRef.current?.classList.remove("is-page-transitioning");
        return;
      }

      node.style.willChange = "transform, opacity";

      gsap.fromTo(
        node,
        tier === "full"
          ? { autoAlpha: 0, x: fromX, scale: 0.992, force3D: true }
          : { autoAlpha: 0, y: 10, force3D: true },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: tier === "full" ? 0.42 : 0.3,
          ease: "power3.out",
          overwrite: "auto",
          onComplete: () => {
            gsap.set(node, { clearProps: "transform" });
            node.style.willChange = "auto";
            animatingRef.current = false;
            shellRef.current?.classList.remove("is-page-transitioning");
          },
        }
      );
    });

    return () => {
      gsap.killTweensOf(el);
    };
  }, [pathname, children, tier, useGsap, shouldPlayIntro, introComplete]);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el || !useGsap || tier === "minimal") return;
    if (!shouldPlayIntro || !introComplete) return;
    if (animatingRef.current) return;

    const currentOpacity = gsap.getProperty(el, "opacity") as number;
    if (currentOpacity >= 1) return;

    animatingRef.current = true;
    el.style.willChange = "transform, opacity";

    gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      duration: tier === "full" ? 0.45 : 0.28,
      ease: "power3.out",
      onComplete: () => {
        gsap.set(el, { clearProps: "transform" });
        el.style.willChange = "auto";
        animatingRef.current = false;
        requestAnimationFrame(() => ScrollTrigger.refresh());
      },
    });
  }, [introComplete, shouldPlayIntro, useGsap, tier]);

  return (
    <div
      ref={shellRef}
      className={cn(
        "gsap-page-transition w-full",
        useGsap && MOTION_V2_ENABLED && "gsap-page-transition--active",
      )}
    >
      <div ref={contentRef} className="gsap-page-transition__content w-full">
        {displayChildren}
      </div>
    </div>
  );
}
