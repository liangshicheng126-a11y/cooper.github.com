import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const ROUTES = [
  "/",
  "/portfolio",
  "/about",
  "/portfolio/p1",
  "/portfolio/p2",
  "/portfolio/p2/personal-website",
  "/portfolio/p2/smart-glasses",
  "/portfolio/p3",
  "/portfolio/p4",
];
const VIEWPORTS = [
  { name: "mobile-portrait", width: 375, height: 812 },
  { name: "mobile-landscape", width: 812, height: 375 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "desktop", width: 1280, height: 800 },
  { name: "ultrawide", width: 1920, height: 1080 },
  { name: "narrow-320", width: 320, height: 568 },
];

const browser = await chromium.launch();
const page = await browser.newPage();

await page.addInitScript(() => {
  sessionStorage.setItem("blob-intro-played", "1");
});

const issues = [];

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(1200);
      const metrics = await page.evaluate(() => {
        const offenders = [...document.querySelectorAll("body *")]
          .map((el) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            if (style.position === "fixed" || rect.width === 0) return null;
            const overflowRight = rect.right - window.innerWidth;
            if (overflowRight > 2) {
              return {
                tag: el.tagName.toLowerCase(),
                className: typeof el.className === "string" ? el.className.slice(0, 80) : "",
                overflowRight: Math.round(overflowRight),
              };
            }
            return null;
          })
          .filter(Boolean)
          .slice(0, 5);

        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          offenders,
          mainMinHeight: document.querySelector("main")?.getBoundingClientRect().height ?? 0,
          viewportHeight: window.innerHeight,
        };
      });
      if (metrics.overflow || metrics.offenders.length > 0) {
        issues.push({ route, viewport: vp.name, type: "horizontal-overflow", ...metrics });
      }
    } catch (err) {
      issues.push({ route, viewport: vp.name, type: "navigation-error", error: String(err) });
    }
  }
}

await browser.close();
console.log(JSON.stringify({ issueCount: issues.length, issues }, null, 2));
process.exit(issues.some((i) => i.overflow === true || i.type === "navigation-error") ? 1 : 0);
