"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  photos: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  backLabel: string;
  closeLabel: string;
  altPrefix: string;
  galleryLabel: string;
};

const SWIPE_THRESHOLD_PX = 48;

export default function GalleryLightbox({
  photos,
  index,
  onClose,
  onIndexChange,
  backLabel,
  closeLabel,
  altPrefix,
  galleryLabel,
}: Props) {
  const touchStartX = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + photos.length) % photos.length);
  }, [index, onIndexChange, photos.length]);

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % photos.length);
  }, [index, onIndexChange, photos.length]);

  useEffect(() => {
    document.body.classList.add("lightbox-open");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (photos.length <= 1) return;
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goNext, goPrev, onClose, photos.length]);

  if (!mounted) return null;

  const currentSrc = photos[index];

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex h-[100dvh] max-h-[100dvh] flex-col bg-black/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={galleryLabel}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <header className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/10 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
        <button
          type="button"
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 active:scale-[0.98] sm:px-4"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          <span>{backLabel}</span>
        </button>
        {photos.length > 1 ? (
          <span className="text-center text-sm font-medium tabular-nums text-white/70">
            {index + 1} / {photos.length}
          </span>
        ) : (
          <span />
        )}
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:hidden"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6"
        onTouchStart={(event) => {
          touchStartX.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (photos.length <= 1 || touchStartX.current === null) return;
          const endX = event.changedTouches[0]?.clientX;
          if (endX === undefined) return;
          const delta = endX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
          if (delta > 0) goPrev();
          else goNext();
        }}
      >
        {photos.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-1 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:left-4 sm:h-11 sm:w-11"
              onClick={goPrev}
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="absolute right-1 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:right-4 sm:h-11 sm:w-11"
              onClick={goNext}
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={currentSrc}
          src={currentSrc}
          alt={`${altPrefix} ${index + 1}`}
          className="max-h-[calc(100dvh-5.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] max-w-[min(100%,calc(100vw-4.5rem))] h-auto w-auto select-none object-contain sm:max-w-[min(92vw,1200px)] sm:max-h-[calc(100dvh-6rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))]"
          draggable={false}
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </div>,
    document.body,
  );
}
