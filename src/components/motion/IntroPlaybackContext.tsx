"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import {
  type BlobIntroMode,
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

  const shouldPlayIntro = useMemo(
    () =>
      shouldPlayBlobIntro({
        pathname,
        tier,
        reducedMotion: reduced,
        introEnabled: INTRO_ENABLED,
      }),
    [pathname, tier, reduced]
  );

  const [introActive, setIntroActive] = useState(shouldPlayIntro);
  const [introComplete, setIntroComplete] = useState(!shouldPlayIntro);
  const [introMode, setIntroMode] = useState<BlobIntroMode>(
    shouldPlayIntro ? "hold" : "idle"
  );

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
