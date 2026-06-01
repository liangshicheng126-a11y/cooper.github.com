"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";

export type VideoPreviewItem = {
  title: string;
  href: string;
  embedUrl?: string;
  mp4Url?: string;
  poster?: string;
  fallbackHref?: string;
};

type Props = {
  videos: VideoPreviewItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  backLabel: string;
  closeLabel: string;
  openOriginalLabel: string;
  galleryLabel: string;
  videoLoadErrors: Record<string, boolean>;
  onVideoError: (href: string) => void;
};

export default function VideoPreviewLightbox({
  videos,
  index,
  onClose,
  onIndexChange,
  backLabel,
  closeLabel,
  openOriginalLabel,
  galleryLabel,
  videoLoadErrors,
  onVideoError,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const video = videos[index];

  useEffect(() => setMounted(true), []);

  const goPrev = useCallback(() => {
    if (videos.length <= 1) return;
    onIndexChange((index - 1 + videos.length) % videos.length);
  }, [index, onIndexChange, videos.length]);

  const goNext = useCallback(() => {
    if (videos.length <= 1) return;
    onIndexChange((index + 1) % videos.length);
  }, [index, onIndexChange, videos.length]);

  useEffect(() => {
    document.body.classList.add("lightbox-open");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (videos.length <= 1) return;
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goNext, goPrev, onClose, videos.length]);

  if (!mounted || !video) return null;

  const originalHref = video.fallbackHref || video.href;
  const canPlayMp4 = Boolean(video.mp4Url && !videoLoadErrors[video.href]);
  const canEmbed = Boolean(video.embedUrl);

  return createPortal(
    <div
      className="gallery-lightbox-overlay fixed inset-0 z-[200] flex h-[100dvh] max-h-[100dvh] flex-col bg-black/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={galleryLabel}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="rounded-xl p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-4 sm:px-6">
        <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
          {canPlayMp4 ? (
            <video
              key={video.mp4Url}
              src={video.mp4Url}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              preload="auto"
              className="aspect-video w-full bg-black"
              onError={() => onVideoError(video.href)}
            />
          ) : canEmbed ? (
            <div className="aspect-video w-full">
              <iframe
                src={video.embedUrl}
                className="h-full w-full"
                scrolling="no"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title={video.title}
              />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-500/20 via-cyan-500/20 to-fuchsia-500/20 p-8 text-center">
              <p className="max-w-md text-sm text-white/70">当前视频源不支持站内播放，请使用下方链接在原平台观看。</p>
            </div>
          )}
        </div>

        <div className="mt-5 flex w-full max-w-5xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-white sm:text-xl">{video.title}</p>
            {videos.length > 1 && (
              <p className="mt-1 text-sm text-white/50">
                {index + 1} / {videos.length}
              </p>
            )}
          </div>
          <a
            href={originalHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
          >
            {openOriginalLabel}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {videos.length > 1 && (
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous video"
              className="rounded-xl border border-white/15 p-2.5 text-white/80 transition-colors hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next video"
              className="rounded-xl border border-white/15 p-2.5 text-white/80 transition-colors hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
