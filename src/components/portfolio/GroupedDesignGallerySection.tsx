"use client";

import { useMemo, useState } from "react";
import LazyInViewImage from "@/components/LazyInViewImage";
import GalleryLightbox from "@/components/GalleryLightbox";
import MasonryGallery, { MasonryItem } from "@/components/MasonryGallery";
import GsapGalleryStagger from "@/components/motion/GsapGalleryStagger";
import { mapDisplaySources, thumbSrc } from "@/lib/galleryImageUrl";

export type DesignGalleryGroup = {
  groupId: string;
  title: string;
  caption: string;
  images: string[];
};

type Labels = {
  sectionTitle: string;
  countLabel: string;
  altPrefix: string;
  lightboxBack: string;
  lightboxClose: string;
};

type Props = {
  groups: DesignGalleryGroup[];
  labels: Labels;
};

export default function GroupedDesignGallerySection({ groups, labels }: Props) {
  const [lightboxPhotos, setLightboxPhotos] = useState<string[] | null>(null);
  const [lightboxFallbacks, setLightboxFallbacks] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const flatScreenshots = useMemo(
    () => groups.flatMap((group) => group.images),
    [groups],
  );
  const designDisplay = useMemo(() => mapDisplaySources(flatScreenshots), [flatScreenshots]);

  const groupOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let offset = 0;
    for (const group of groups) {
      offsets[group.groupId] = offset;
      offset += group.images.length;
    }
    return offsets;
  }, [groups]);

  if (flatScreenshots.length === 0) return null;

  return (
    <>
      <section className="gallery-section mb-16 lg:mb-24">
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{labels.sectionTitle}</h2>
          <span className="text-base sm:text-lg text-foreground/55 font-medium">
            {labels.countLabel} {flatScreenshots.length}
          </span>
        </div>

        <div className="space-y-12 sm:space-y-16">
          {groups.map((group) => (
            <div key={group.groupId}>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-3">{group.title}</h3>
              <p className="text-base sm:text-lg text-foreground/60 leading-relaxed max-w-3xl mb-6 sm:mb-8">
                {group.caption}
              </p>
              <GsapGalleryStagger>
                <MasonryGallery
                  items={group.images}
                  getOriginalSrc={(shot) => shot}
                  renderItem={(shot, index) => (
                    <MasonryItem className="gallery-thumb group shadow-[0_2px_16px_rgba(15,23,42,0.08)] transition-shadow duration-300 sm:hover:shadow-[0_12px_32px_rgba(15,23,42,0.14)]">
                      <LazyInViewImage
                        src={thumbSrc(shot)}
                        fallbackSrc={shot}
                        alt={`${labels.altPrefix} ${group.title} ${index + 1}`}
                        variant="natural"
                        className="cursor-pointer transition-transform duration-500 sm:group-hover:scale-[1.02]"
                        onClick={() => {
                          setLightboxPhotos(designDisplay);
                          setLightboxFallbacks(flatScreenshots);
                          setLightboxIndex(groupOffsets[group.groupId] + index);
                        }}
                      />
                    </MasonryItem>
                  )}
                />
              </GsapGalleryStagger>
            </div>
          ))}
        </div>
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
          galleryLabel={labels.sectionTitle}
        />
      )}
    </>
  );
}
