/** Shared helpers for scroll-driven motion — avoid layout gaps from hidden content */

export function isElementInViewport(
  el: Element,
  threshold = 0.92
): boolean {
  if (typeof window === "undefined") return true;
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * threshold && rect.bottom > 0;
}

export function primeElementsForScrollReveal(
  elements: Element[] | NodeListOf<Element>,
  hiddenY = 20
): Element[] {
  const toAnimate: Element[] = [];
  elements.forEach((el) => {
    if (isElementInViewport(el)) {
      return;
    }
    toAnimate.push(el);
  });
  return toAnimate;
}
