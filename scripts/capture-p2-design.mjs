/**
 * High-fidelity @2x captures for /portfolio/p2 design showcase.
 * Run: node scripts/capture-p2-design.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SITE = process.env.SITE_URL ?? "https://cooperliang.top";
const OUT = path.join("public", "photos", "portfolio", "p2");

const CAPTURES = [
  { file: "home-hero.png", path: "/", waitMs: 2800 },
  { file: "home-services.png", path: "/", scrollTo: "#services-block", waitMs: 2000 },
  { file: "portfolio-grid.png", path: "/portfolio", waitMs: 2500 },
  { file: "p2-detail.png", path: "/portfolio/p2", waitMs: 2500 },
  { file: "about-page.png", path: "/about", waitMs: 2500 },
  { file: "contact-page.png", path: "/contact", waitMs: 2500 },
  { file: "task-brief-page.png", path: "/task-brief", waitMs: 2500 },
  { file: "xiaocoo-page.png", path: "/xiaocoo", waitMs: 2500 },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
});

const page = await context.newPage();

for (const shot of CAPTURES) {
  const url = `${SITE}${shot.path}`;
  console.log(`Capturing ${shot.file} ← ${url}`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(shot.waitMs);

  if (shot.scrollTo) {
    await page.locator(shot.scrollTo).scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
  }

  const rawPath = path.join(OUT, `${shot.file}.raw.png`);
  const outPath = path.join(OUT, shot.file);

  await page.screenshot({ path: rawPath, fullPage: false, type: "png" });

  const meta = await sharp(rawPath)
    .rotate()
    .png({ compressionLevel: 6, quality: 95 })
    .toFile(outPath);

  await fs.promises.unlink(rawPath);
  const stat = await fs.promises.stat(outPath);
  console.log(`  → ${shot.file} ${meta.width}×${meta.height} (${Math.round(stat.size / 1024)} KB)`);
}

await browser.close();
console.log("\nDone.");
