const GALLERY_PREFIXES = ["/photos/posters/", "/photos/photography/"] as const;

function isGalleryOriginal(src: string): boolean {
  if (!src.startsWith("/photos/")) return false;
  if (src.includes("/_thumb/") || src.includes("/_display/")) return false;
  return GALLERY_PREFIXES.some((prefix) => src.startsWith(prefix));
}

function variantPath(original: string, variant: "_thumb" | "_display"): string {
  if (!isGalleryOriginal(original)) return original;

  const match = original.match(/^(\/photos\/(?:posters|photography)\/)(.+)$/);
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
