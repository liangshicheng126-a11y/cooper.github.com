/**
 * Real, localized @2x website captures for the /portfolio/p2 design showcase.
 * Start the site separately, then run: node scripts/capture-p2-design.mjs
 * SITE_URL may override http://localhost:3030. Existing source assets are untouched.
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SITE = new URL(process.env.SITE_URL ?? "http://localhost:3030");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "photos", "portfolio", "p2", "localized");
const READY_TIMEOUT = 45_000;
const LANGUAGES = [
  { code: "zh", htmlLang: "zh-CN", locale: "zh-CN" },
  { code: "en", htmlLang: "en", locale: "en-US" },
  { code: "ja", htmlLang: "ja", locale: "ja-JP" },
  { code: "ko", htmlLang: "ko", locale: "ko-KR" },
];
const CAPTURES = [
  { file: "home-hero", pathname: "/" },
  { file: "portfolio-grid", pathname: "/portfolio/" },
  { file: "about-page", pathname: "/about/" },
  { file: "contact-page", pathname: "/contact/" },
  { file: "home-services", pathname: "/", scrollTo: "#services-block" },
  { file: "p2-detail", pathname: "/portfolio/p2/" },
  { file: "language-menu", pathname: "/portfolio/", openLanguageMenu: true },
  { file: "xiaocoo-page", pathname: "/xiaocoo/" },
];

async function waitForFonts(page) {
  await page.evaluate(async (timeoutMs) => {
    let timer;
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error("Fonts did not finish loading")), timeoutMs);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }, READY_TIMEOUT);
}

async function waitForVisibleImages(page) {
  // Off-screen lazy images need not load; every image actually in the capture must.
  await page.waitForFunction(() => Array.from(document.images).every((image) => {
    const rect = image.getBoundingClientRect();
    const inView = rect.width > 0 && rect.height > 0 && rect.bottom > 0 &&
      rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
    return !inView || (image.complete && image.naturalWidth > 0);
  }), undefined, { timeout: READY_TIMEOUT });
  await page.evaluate(async () => {
    const visible = Array.from(document.images).filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 &&
        rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
    });
    await Promise.all(visible.map((image) => image.decode()));
  });
}

async function waitForReadableText(page, selector) {
  await page.locator(selector).first().waitFor({ state: "visible" });
  await page.waitForFunction((textSelector) => {
    const elements = Array.from(document.querySelectorAll(textSelector));
    return elements.length > 0 && elements.every((element) => {
      for (let node = element; node instanceof HTMLElement; node = node.parentElement) {
        const style = getComputedStyle(node);
        const blur = Number(style.filter.match(/blur\(([\d.]+)px\)/)?.[1] ?? 0);
        if (Number(style.opacity) < 0.99 || blur > 0.1 || style.visibility === "hidden") return false;
      }
      return true;
    });
  }, selector, { timeout: READY_TIMEOUT });
}

async function waitForStableContent(page) {
  // Observe text/layout and the heading's entrance animation, not continuously
  // orbiting DepthText children or the live WebGL background. No motion is frozen.
  await page.evaluate(({ timeoutMs, stableMs }) => new Promise((resolve, reject) => {
    const started = performance.now();
    let stableSince = started;
    let previous = "";
    const sample = () => {
      const main = document.querySelector("main");
      const text = main?.innerText.trim() ?? "";
      const rect = main?.getBoundingClientRect();
      const entrance = [];
      for (let node = main?.querySelector("h1"); node instanceof HTMLElement; node = node.parentElement) {
        const style = getComputedStyle(node);
        entrance.push(style.opacity, style.filter, style.transform, style.clipPath);
      }
      const snapshot = JSON.stringify([
        text, rect && [rect.x, rect.y, rect.width, rect.height].map(Math.round),
        main?.scrollHeight, document.fonts.status, entrance,
      ]);
      const now = performance.now();
      if (snapshot !== previous || text.length < 20 || document.fonts.status !== "loaded") {
        previous = snapshot;
        stableSince = now;
      }
      if (now - stableSince >= stableMs) return resolve();
      if (now - started >= timeoutMs) return reject(new Error("Page content did not settle"));
      setTimeout(sample, 100);
    };
    sample();
  }), { timeoutMs: READY_TIMEOUT, stableMs: 650 });
}

async function openLanguageMenu(page) {
  // Next.js devtools also have menu buttons; only use the real site header.
  const trigger = page.locator('header.site-header button[aria-haspopup="menu"]');
  await trigger.click();
  const menu = page.getByRole("menu");
  await menu.waitFor({ state: "visible" });
  const menuId = await trigger.getAttribute("aria-controls");
  await page.waitForFunction((id) => {
    const menu = document.getElementById(id);
    const root = menu?.closest('[data-open="true"]');
    if (!root || !menu.parentElement) return false;
    const nodes = [menu.parentElement, ...root.querySelectorAll(
      "[data-menu-layer], [data-menu-label], [data-menu-detail]",
    )];
    return nodes.every((node) => {
      const style = getComputedStyle(node);
      const matrix = new DOMMatrixReadOnly(style.transform === "none" ? undefined : style.transform);
      return Number(style.opacity) >= 0.99 && Math.abs(matrix.m41) < 0.1 &&
        Math.abs(matrix.m42) < 0.1 && Math.abs(matrix.m12) < 0.001;
    });
  }, menuId, { timeout: READY_TIMEOUT });
}

const browser = await chromium.launch();
try {
  for (const language of LANGUAGES) {
    const outDir = path.join(OUT, language.code);
    await fs.mkdir(outDir, { recursive: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: "dark",
      reducedMotion: "no-preference",
      locale: language.locale,
      serviceWorkers: "block",
    });
    try {
      await context.addInitScript(({ code, origin }) => {
        if (location.origin !== origin) return;
        localStorage.setItem("language", code);
        // Skip only the opening sequence; all normal page animations stay active.
        sessionStorage.setItem("cooper-opening-sequence-v3", "1");
      }, { code: language.code, origin: SITE.origin });
      await context.route("**/*", async (route) => {
        const request = route.request();
        const pathname = new URL(request.url()).pathname;
        // Asset generation never submits a contact/chat form or visits retired tasks.
        if (!["GET", "HEAD", "OPTIONS"].includes(request.method()) ||
            /(?:^|\/)task-brief(?:\/|$)/.test(pathname)) {
          await route.abort("blockedbyclient");
          return;
        }
        await route.continue();
      });
      const page = await context.newPage();
      page.setDefaultTimeout(READY_TIMEOUT);
      for (const shot of CAPTURES) {
        const name = `${language.code}/${shot.file}.webp`;
        console.log(`Capturing ${name}`);
        try {
          const response = await page.goto(new URL(shot.pathname, SITE).href, {
            waitUntil: "domcontentloaded", timeout: 90_000,
          });
          if (!response?.ok()) throw new Error(`Page returned HTTP ${response?.status() ?? "unknown"}`);
          await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
          await page.waitForFunction((expected) => document.documentElement.lang === expected &&
            !document.documentElement.hasAttribute("data-intro-active"), language.htmlLang,
          { timeout: READY_TIMEOUT });
          await waitForFonts(page);
          await waitForReadableText(page, "main h1");
          if (shot.pathname === "/") await waitForReadableText(page, ".hero-support p > span");
          await waitForStableContent(page);

          if (shot.scrollTo) {
            await page.locator(shot.scrollTo).evaluate((section) => {
              const header = document.querySelector("header.site-header")?.getBoundingClientRect();
              const offset = Math.max(0, header?.bottom ?? 0) + 24;
              window.scrollTo({ top: Math.max(0, scrollY + section.getBoundingClientRect().top - offset), behavior: "instant" });
            });
            await waitForReadableText(page, `${shot.scrollTo} h2`);
          }
          if (shot.openLanguageMenu) await openLanguageMenu(page);
          // Keep the pointer away from cards so their normal default state is shown.
          await page.mouse.move(1, 1);
          await waitForFonts(page);
          await waitForVisibleImages(page);
          await waitForStableContent(page);

          const buffer = await page.screenshot({
            type: "png", fullPage: false, scale: "device", animations: "allow", caret: "initial",
          });
          const meta = await sharp(buffer).webp({ quality: 88 }).toFile(path.join(outDir, `${shot.file}.webp`));
          console.log(`  → ${meta.width}×${meta.height} (${Math.round(meta.size / 1024)} KB)`);
        } catch (error) {
          throw new Error(`Could not capture ${name}: ${error.message}`, { cause: error });
        }
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
console.log(`\nDone: ${LANGUAGES.length * CAPTURES.length} localized WebP assets in ${OUT}`);
