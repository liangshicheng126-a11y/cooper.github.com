"use client";

import { balanceMasonryColumns, getMasonryColumnCount } from "@/lib/masonryBalance";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type ManifestEntry = { width: number; height: number };
type GalleryManifest = Record<string, ManifestEntry>;

const ITEM_GAP_MOBILE_PX = 12;
const ITEM_GAP_DESKTOP_PX = 16;

function getItemGap(containerWidth: number): number {
  return containerWidth >= 640 ? ITEM_GAP_DESKTOP_PX : ITEM_GAP_MOBILE_PX;
}

function lookupAspectRatio(manifest: GalleryManifest | null, originalSrc: string): number {
  if (!manifest || !originalSrc) return 3 / 4;
  const entry = manifest[originalSrc] ?? manifest[decodeURIComponent(originalSrc)];
  if (!entry?.width || !entry?.height) return 3 / 4;
  return entry.width / entry.height;
}

type MasonryGalleryProps<T> = {
  items: T[];
  getOriginalSrc: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
};

export default function MasonryGallery<T>({
  items,
  getOriginalSrc,
  renderItem,
  className = "",
}: MasonryGalleryProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const getOriginalSrcRef = useRef(getOriginalSrc);
  getOriginalSrcRef.current = getOriginalSrc;
  const [manifest, setManifest] = useState<GalleryManifest | null>(null);
  const [columnCount, setColumnCount] = useState(2);
  const [containerWidth, setContainerWidth] = useState(0);

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

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateLayout = () => {
      setColumnCount(getMasonryColumnCount(window.innerWidth));
      setContainerWidth(node.offsetWidth);
    };

    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    observer.observe(node);
    window.addEventListener("resize", updateLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, []);

  const itemGap = getItemGap(containerWidth);
  const columnWidth =
    columnCount > 0 ? Math.max((containerWidth - itemGap * (columnCount - 1)) / columnCount, 1) : containerWidth;

  const columns = useMemo(
    () =>
      balanceMasonryColumns(items, columnCount, {
        columnWidth,
        itemGap,
        getAspectRatio: (item, index) =>
          lookupAspectRatio(manifest, getOriginalSrcRef.current(item, index)),
      }),
    [items, columnCount, columnWidth, itemGap, manifest],
  );

  return (
    <div ref={containerRef} className={`masonry-grid w-full ${className}`.trim()}>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="masonry-grid_column">
          {column.map(({ item, index }) => (
            <div key={`${index}-${getOriginalSrc(item, index)}`} className="masonry-item-slot">
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

type MasonryItemProps = {
  children: ReactNode;
  className?: string;
};

export function MasonryItem({ children, className = "" }: MasonryItemProps) {
  return (
    <div
      className={`masonry-item w-full overflow-hidden rounded-2xl leading-[0] [font-size:0] ${className}`.trim()}
    >
      {children}
    </div>
  );
}
