export type NavOrigin = {
  x: number;
  y: number;
};

export function getPortfolioNavOrigin(): NavOrigin | null {
  if (typeof document === "undefined") return null;

  const nodes = document.querySelectorAll('[data-nav-genie-origin="portfolio"]');
  for (const node of nodes) {
    const el = node as HTMLElement;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  return null;
}

export function getCardGenieOffset(
  cardEl: HTMLElement,
  origin: NavOrigin
): { x: number; y: number } {
  const rect = cardEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  return {
    x: origin.x - cx,
    y: origin.y - cy,
  };
}
