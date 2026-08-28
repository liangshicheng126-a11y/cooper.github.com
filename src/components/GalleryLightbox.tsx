"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import useMotionTier from "@/hooks/useMotionTier";
import { useTranslation } from "@/locales/LanguageProvider";

type Props = {
  photos: string[];
  /** Original full paths when `photos` are optimized variants. */
  fallbackPhotos?: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  backLabel: string;
  closeLabel: string;
  altPrefix: string;
  galleryLabel: string;
};

const SWIPE_THRESHOLD_PX = 48;
const MIN_SCALE = 1;
const MAX_SCALE = 6;
const WHEEL_ZOOM_SENSITIVITY = 0.0018;
const HI_RES_SCALE = 1.35;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function preloadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export default function GalleryLightbox({
  photos,
  fallbackPhotos,
  index,
  onClose,
  onIndexChange,
  backLabel,
  closeLabel,
  altPrefix,
  galleryLabel,
}: Props) {
  const { t } = useTranslation();
  const tier = useMotionTier();
  const softMotion = tier !== "minimal";
  const touchStartX = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const loadedCache = useRef(new Set<string>());
  const [mounted, setMounted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const displaySrc = photos[index] ?? "";
  const originalSrc = fallbackPhotos?.[index];
  const [paintSrc, setPaintSrc] = useState(displaySrc);
  const [imageReady, setImageReady] = useState(() =>
    displaySrc ? loadedCache.current.has(displaySrc) : false,
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setOverlayVisible(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setDragging(false);
  }, [photos, index]);

  // Swap only after the next display image is ready — never blank the stage.
  useEffect(() => {
    const nextDisplay = photos[index] ?? "";
    if (!nextDisplay) return;

    if (loadedCache.current.has(nextDisplay)) {
      setPaintSrc(nextDisplay);
      setImageReady(true);
      return;
    }

    // First open: paint the URL immediately; opacity fades in onLoad.
    // Index change: keep previous paintSrc until preload finishes.
    if (paintSrc === nextDisplay || !paintSrc) {
      setPaintSrc(nextDisplay);
    }

    let cancelled = false;
    preloadImage(nextDisplay)
      .then((src) => {
        if (cancelled) return;
        loadedCache.current.add(src);
        setPaintSrc(src);
        setImageReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        // Let <img onError> try original fallback.
        setPaintSrc(nextDisplay);
      });

    return () => {
      cancelled = true;
    };
    // paintSrc intentionally omitted — only react to gallery index / list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, photos]);

  // Prefetch current original + neighbors so zoom / swipe stay seamless.
  useEffect(() => {
    const candidates = [
      displaySrc,
      originalSrc,
      photos.length > 1
        ? photos[(index - 1 + photos.length) % photos.length]
        : undefined,
      photos.length > 1 ? photos[(index + 1) % photos.length] : undefined,
      photos.length > 1
        ? fallbackPhotos?.[(index - 1 + photos.length) % photos.length]
        : undefined,
      photos.length > 1
        ? fallbackPhotos?.[(index + 1) % photos.length]
        : undefined,
    ].filter((src): src is string => Boolean(src));

    candidates.forEach((src) => {
      if (loadedCache.current.has(src)) return;
      preloadImage(src)
        .then((loaded) => loadedCache.current.add(loaded))
        .catch(() => undefined);
    });
  }, [displaySrc, fallbackPhotos, index, originalSrc, photos]);

  // Upgrade to full-resolution only after preload — never blank the stage mid-zoom.
  useEffect(() => {
    const wantHiRes =
      scale > HI_RES_SCALE &&
      Boolean(originalSrc) &&
      originalSrc !== displaySrc &&
      paintSrc !== originalSrc;

    if (!wantHiRes || !originalSrc) return;

    if (loadedCache.current.has(originalSrc)) {
      setPaintSrc(originalSrc);
      setImageReady(true);
      return;
    }

    let cancelled = false;
    preloadImage(originalSrc)
      .then((src) => {
        if (cancelled) return;
        loadedCache.current.add(src);
        setPaintSrc(src);
        setImageReady(true);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [displaySrc, originalSrc, paintSrc, scale]);

  // Cached images can be complete before onLoad; reveal immediately.
  useEffect(() => {
    if (!paintSrc || imageReady) return;
    const probe = new window.Image();
    probe.src = paintSrc;
    if (probe.complete && probe.naturalWidth > 0) {
      loadedCache.current.add(paintSrc);
      setImageReady(true);
    }
  }, [imageReady, paintSrc]);

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

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = stage.getBoundingClientRect();
      const cursorX = event.clientX - rect.left - rect.width / 2;
      const cursorY = event.clientY - rect.top - rect.height / 2;

      setScale((prevScale) => {
        const nextScale = clamp(
          prevScale * Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY),
          MIN_SCALE,
          MAX_SCALE,
        );
        if (nextScale === prevScale) return prevScale;

        const ratio = nextScale / prevScale;
        setOffset((prevOffset) => {
          if (nextScale <= MIN_SCALE) return { x: 0, y: 0 };
          return {
            x: cursorX - (cursorX - prevOffset.x) * ratio,
            y: cursorY - (cursorY - prevOffset.y) * ratio,
          };
        });
        return nextScale;
      });
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [mounted]);

  if (!mounted) return null;

  const fallbackSrc = fallbackPhotos?.[index];
  const zoomed = scale > 1.01;
  const fadeMs = softMotion ? 220 : 0;

  return createPortal(
    <div
      className="gallery-lightbox-overlay fixed inset-0 z-[200] flex h-[100dvh] max-h-[100dvh] flex-col bg-black/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={galleryLabel}
      style={{
        opacity: overlayVisible ? 1 : 0,
        transition: softMotion ? `opacity ${fadeMs}ms ease-out` : undefined,
      }}
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
        ref={stageRef}
        className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 ${zoomed ? "cursor-grab active:cursor-grabbing" : ""}`}
        onTouchStart={(event) => {
          if (zoomed) return;
          touchStartX.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (zoomed || photos.length <= 1 || touchStartX.current === null) return;
          const endX = event.changedTouches[0]?.clientX;
          if (endX === undefined) return;
          const delta = endX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
          if (delta > 0) goPrev();
          else goNext();
        }}
        onPointerDown={(event) => {
          if (!zoomed || event.button !== 0) return;
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: offset.x,
            originY: offset.y,
            moved: false,
          };
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          const dx = event.clientX - drag.startX;
          const dy = event.clientY - drag.startY;
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) drag.moved = true;
          setOffset({ x: drag.originX + dx, y: drag.originY + dy });
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          dragRef.current = null;
          setDragging(false);
          try {
            event.currentTarget.releasePointerCapture(event.pointerId);
          } catch {
            /* already released */
          }
        }}
        onPointerCancel={() => {
          dragRef.current = null;
          setDragging(false);
        }}
        onDoubleClick={(event) => {
          event.preventDefault();
          if (zoomed) {
            setScale(1);
            setOffset({ x: 0, y: 0 });
            return;
          }
          const stage = stageRef.current;
          if (!stage) {
            setScale(2.5);
            return;
          }
          const rect = stage.getBoundingClientRect();
          const cursorX = event.clientX - rect.left - rect.width / 2;
          const cursorY = event.clientY - rect.top - rect.height / 2;
          const nextScale = 2.5;
          setScale(nextScale);
          setOffset({
            x: cursorX - cursorX * nextScale,
            y: cursorY - cursorY * nextScale,
          });
        }}
      >
        {photos.length > 1 && !zoomed && (
          <>
            <button
              type="button"
              className="absolute left-1 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:left-4 sm:h-11 sm:w-11"
              onClick={goPrev}
              aria-label={t.media.previousPhoto}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="absolute right-1 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:right-4 sm:h-11 sm:w-11"
              onClick={goNext}
              aria-label={t.media.nextPhoto}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={paintSrc}
          alt={`${altPrefix} ${index + 1}`}
          className="max-h-[calc(100dvh-5.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] max-w-[min(100%,calc(100vw-4.5rem))] h-auto w-auto select-none object-contain sm:max-w-[min(92vw,1200px)] sm:max-h-[calc(100dvh-6rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))]"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            transformOrigin: "center center",
            opacity: imageReady ? 1 : 0,
            transition: dragging
              ? "none"
              : softMotion
                ? `transform 160ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${fadeMs}ms ease-out`
                : "none",
            willChange: "transform, opacity",
          }}
          draggable={false}
          decoding="async"
          fetchPriority="high"
          onLoad={() => {
            if (paintSrc) loadedCache.current.add(paintSrc);
            setImageReady(true);
          }}
          onError={() => {
            if (fallbackSrc && paintSrc !== fallbackSrc) {
              setPaintSrc(fallbackSrc);
              setImageReady(loadedCache.current.has(fallbackSrc));
            }
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
