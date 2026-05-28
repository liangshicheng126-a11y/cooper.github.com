"use client";

import Masonry from "react-masonry-css";
import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";

const breakpointCols = {
  default: 4,
  1280: 3,
  768: 2,
};

type ManifestEntry = { width: number; height: number };
type GalleryManifest = Record<string, ManifestEntry>;

const ManifestContext = createContext<GalleryManifest | null>(null);

function useGalleryManifest() {
  return useContext(ManifestContext);
}

export function useImageAspectRatio(originalSrc: string): number | undefined {
  const manifest = useGalleryManifest();
  if (!originalSrc || !manifest) return undefined;
  const entry = manifest[originalSrc] ?? manifest[decodeURIComponent(originalSrc)];
  if (!entry?.width || !entry?.height) return undefined;
  return entry.width / entry.height;
}

type MasonryGalleryProps = {
  children: ReactNode;
  className?: string;
};

export default function MasonryGallery({ children, className = "" }: MasonryGalleryProps) {
  const [manifest, setManifest] = useState<GalleryManifest | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/photos/gallery-manifest.json")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (!cancelled) setManifest(data as GalleryManifest);
      })
      .catch(() => {
        if (!cancelled) setManifest({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ManifestContext.Provider value={manifest}>
      <Masonry
        breakpointCols={breakpointCols}
        className={`masonry-grid ${className}`.trim()}
        columnClassName="masonry-grid_column"
      >
        {children}
      </Masonry>
    </ManifestContext.Provider>
  );
}

type MasonryItemProps = {
  children: ReactNode;
  /** Original gallery path for manifest aspect-ratio placeholder, e.g. /photos/posters/foo.jpg */
  originalSrc?: string;
  className?: string;
};

export function MasonryItem({ children, originalSrc, className = "" }: MasonryItemProps) {
  const aspectRatio = useImageAspectRatio(originalSrc ?? "");
  const style: CSSProperties | undefined = aspectRatio
    ? { aspectRatio: String(aspectRatio) }
    : { minHeight: "8rem" };

  return (
    <div className={`masonry-item rounded-2xl ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
