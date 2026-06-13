"use client";

import { useMemo, useState } from "react";
import LazyInViewImage from "@/components/LazyInViewImage";
import GalleryLightbox from "@/components/GalleryLightbox";
import MasonryGallery, { MasonryItem } from "@/components/MasonryGallery";
import GsapGalleryStagger from "@/components/motion/GsapGalleryStagger";
import { mapDisplaySources, thumbSrc } from "@/lib/galleryImageUrl";

type Labels = {
  title: string;
  countLabel: string;
  altPrefix: string;
  lightboxBack: string;
  lightboxClose: string;
};

type Props = {
  screenshots: string[];
  labels: Labels;
};

export default function DesignGallerySection({ screenshots, labels }: Props) {
  const [lightboxPhotos, setLightboxPhotos] = useState<string[] | null>(null);
  const [lightboxFallbacks, setLightboxFallbacks] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const designDisplay = useMemo(() => mapDisplaySources(screenshots), [screenshots]);

  if (screenshots.length === 0) return null;

  return (
    <>
      <section className="gallery-section mb-16 lg:mb-24">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{labels.title}</h2>
          <span className="text-base sm:text-lg text-foreground/55 font-medium">
            {labels.countLabel} {screenshots.length}
          </span>
        </div>
        <GsapGalleryStagger>
          <MasonryGallery
            items={screenshots}
            getOriginalSrc={(shot) => shot}
            renderItem={(shot, index) => (
              <MasonryItem className="gallery-thumb group shadow-[0_2px_16px_rgba(15,23,42,0.08)] transition-shadow duration-300 sm:hover:shadow-[0_12px_32px_rgba(15,23,42,0.14)]">
                <LazyInViewImage
                  src={thumbSrc(shot)}
                  fallbackSrc={shot}
                  alt={`${labels.altPrefix} ${index + 1}`}
                  variant="natural"
                  className="cursor-pointer transition-transform duration-500 sm:group-hover:scale-[1.02]"
                  onClick={() => {
                    setLightboxPhotos(designDisplay);
                    setLightboxFallbacks(screenshots);
                    setLightboxIndex(index);
                  }}
                />
              </MasonryItem>
            )}
          />
        </GsapGalleryStagger>
      </section>

      {lightboxPhotos && (
        <GalleryLightbox
          photos={lightboxPhotos}
          fallbackPhotos={lightboxFallbacks ?? undefined}
          index={lightboxIndex}
          onClose={() => {
            setLightboxPhotos(null);
            setLightboxFallbacks(null);
          }}
          onIndexChange={setLightboxIndex}
          backLabel={labels.lightboxBack}
          closeLabel={labels.lightboxClose}
          altPrefix={labels.altPrefix}
          galleryLabel={labels.title}
        />
      )}
    </>
  );
}
