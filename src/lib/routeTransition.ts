/** Sidebar nav order — used for directional page transitions. */
const NAV_SECTION_ORDER = [
  "/",
  "/portfolio",
  "/about",
  "/contact",
] as const;

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  const trimmed = path.endsWith("/") ? path.slice(0, -1) : path;
  return trimmed || "/";
}

/** Map pathname to sidebar section index (nested routes inherit parent section). */
export function getRouteSectionIndex(pathname: string): number {
  const current = normalizePath(pathname);

  if (current === "/") return 0;

  for (let i = NAV_SECTION_ORDER.length - 1; i >= 1; i--) {
    const section = NAV_SECTION_ORDER[i];
    if (current === section || current.startsWith(`${section}/`)) {
      return i;
    }
  }

  return 0;
}

/** 1 = forward (down sidebar), -1 = backward, 0 = same section (detail ↔ list). */
export function getRouteTransitionDirection(from: string, to: string): number {
  const prev = getRouteSectionIndex(from);
  const next = getRouteSectionIndex(to);

  if (prev === next) return 0;
  return next > prev ? 1 : -1;
}
