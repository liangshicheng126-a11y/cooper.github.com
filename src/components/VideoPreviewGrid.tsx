"use client";

import { ExternalLink, Play } from "lucide-react";
import type { VideoPreviewItem } from "@/components/VideoPreviewLightbox";

type Props = {
  videos: VideoPreviewItem[];
  watchVideoLabel: string;
  openOriginalLabel: string;
  onOpenPreview: (index: number) => void;
};

function thumbnailFor(video: VideoPreviewItem) {
  return video.poster;
}

export default function VideoPreviewGrid({
  videos,
  watchVideoLabel,
  openOriginalLabel,
  onOpenPreview,
}: Props) {
  return (
    <div className="video-preview-grid grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {videos.map((video, index) => {
        const thumb = thumbnailFor(video);
        const originalHref = video.fallbackHref || video.href;

        return (
          <article
            key={video.href}
            className="gallery-thumb video-preview-card group flex flex-col"
          >
            <button
              type="button"
              onClick={() => onOpenPreview(index)}
              className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 text-left shadow-[0_2px_16px_rgba(15,23,42,0.08)] transition-shadow duration-300 sm:hover:shadow-[0_12px_32px_rgba(15,23,42,0.14)]"
              aria-label={`${watchVideoLabel} ${index + 1}: ${video.title}`}
            >
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element -- local video frame posters, same as gallery thumbs
                <img
                  src={thumb}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 sm:group-hover:scale-[1.03]"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-cyan-500/20 to-fuchsia-500/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform duration-300 sm:group-hover:scale-110">
                  <Play className="h-5 w-5 fill-white translate-x-0.5" />
                </span>
              </span>
            </button>

            <div className="mt-3 flex min-w-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => onOpenPreview(index)}
                className="line-clamp-2 text-left text-sm font-semibold leading-snug text-foreground transition-colors hover:text-indigo-500 sm:text-base"
              >
                {video.title}
              </button>
              <a
                href={originalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-foreground/55 transition-colors hover:text-indigo-500 sm:text-sm"
              >
                <span>{openOriginalLabel}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
