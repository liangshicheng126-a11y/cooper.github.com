const GALLERY_PREFIXES = [
  "/photos/posters/",
  "/photos/photography/",
  "/photos/portfolio/p2/",
  "/photos/portfolio/p2/smart-glasses/",
] as const;

/** Matches optimize-gallery-images.mjs — tall pages crop to this width/height in grid thumbs. */
export const GALLERY_TALL_HEIGHT_RATIO = 2.2;
export const GALLERY_TALL_THUMB_ASPECT = 3 / 4;

export function isTallGalleryImage(width: number, height: number): boolean {
  return height / Math.max(width, 1) >= GALLERY_TALL_HEIGHT_RATIO;
}

/** Aspect used for masonry balance when the source is ultra-tall. */
export function masonryAspectRatio(width: number, height: number): number {
  const raw = width / Math.max(height, 1);
  if (!isTallGalleryImage(width, height)) return raw;
  return GALLERY_TALL_THUMB_ASPECT;
}

function isGalleryOriginal(src: string): boolean {
  if (!src.startsWith("/photos/")) return false;
  if (src.includes("/_thumb/") || src.includes("/_display/")) return false;
  return GALLERY_PREFIXES.some((prefix) => src.startsWith(prefix));
}

function variantPath(original: string, variant: "_thumb" | "_display"): string {
  if (!isGalleryOriginal(original)) return original;

  const match = original.match(
    /^(\/photos\/(?:posters|photography|portfolio\/p2)\/)(.+)$/,
  );
  if (!match) return original;

  const [, prefix, rest] = match;
  const withoutExt = rest.replace(/\.[^.]+$/i, "");
  return `${prefix}${variant}/${withoutExt}.webp`;
}

/** List/grid: small WebP generated at build time. */
export function thumbSrc(original: string): string {
  return variantPath(original, "_thumb");
}

/** Lightbox: medium WebP; falls back to original in UI if missing. */
export function displaySrc(original: string): string {
  return variantPath(original, "_display");
}

export function mapDisplaySources(originals: string[]): string[] {
  return originals.map(displaySrc);
}
