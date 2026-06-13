"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import {
  type BlobIntroMode,
  readIntroNeededFromDom,
  shouldPlayBlobIntro,
} from "@/lib/blobIntro";
import { INTRO_ENABLED } from "@/lib/motion";

type IntroPlaybackContextValue = {
  introActive: boolean;
  introComplete: boolean;
  shouldPlayIntro: boolean;
  introMode: BlobIntroMode;
  setIntroActive: (active: boolean) => void;
  setIntroComplete: (complete: boolean) => void;
  setIntroMode: (mode: BlobIntroMode) => void;
};

const IntroPlaybackContext = createContext<IntroPlaybackContextValue | null>(
  null
);

export function IntroPlaybackProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const tier = useMotionTier();
  const reduced = usePrefersReducedMotion();

  const [shouldPlayIntro, setShouldPlayIntro] = useState(readIntroNeededFromDom);
  const [introActive, setIntroActive] = useState(readIntroNeededFromDom);
  const [introComplete, setIntroComplete] = useState(
    () => !readIntroNeededFromDom()
  );
  const [introMode, setIntroMode] = useState<BlobIntroMode>(() =>
    readIntroNeededFromDom() ? "hold" : "idle"
  );

  useEffect(() => {
    const next = shouldPlayBlobIntro({
      pathname,
      tier,
      reducedMotion: reduced,
      introEnabled: INTRO_ENABLED,
    });
    setShouldPlayIntro(next);
    if (!next) {
      setIntroActive(false);
      setIntroComplete(true);
      setIntroMode("idle");
      document.documentElement.removeAttribute("data-intro-active");
      document.documentElement.removeAttribute("data-intro-needed");
    }
  }, [pathname, tier, reduced]);

  const value = useMemo(
    () => ({
      introActive,
      introComplete,
      shouldPlayIntro,
      introMode,
      setIntroActive,
      setIntroComplete,
      setIntroMode,
    }),
    [introActive, introComplete, shouldPlayIntro, introMode]
  );

  return (
    <IntroPlaybackContext.Provider value={value}>
      {children}
    </IntroPlaybackContext.Provider>
  );
}

export function useIntroPlayback(): IntroPlaybackContextValue {
  const ctx = useContext(IntroPlaybackContext);
  if (!ctx) {
    return {
      introActive: false,
      introComplete: true,
      shouldPlayIntro: false,
      introMode: "idle",
      setIntroActive: () => {},
      setIntroComplete: () => {},
      setIntroMode: () => {},
    };
  }
  return ctx;
}

export function useIntroRevealReady(): boolean {
  const { introComplete, shouldPlayIntro } = useIntroPlayback();
  return !shouldPlayIntro || introComplete;
}
