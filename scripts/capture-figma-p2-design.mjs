/**
 * Export cooper Figma frames into public/photos/portfolio/p2 via Playwright.
 * Bypasses Figma REST API when rate-limited (Viewer seat quota).
 * Run: node scripts/capture-figma-p2-design.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";
import { cropFigmaFrame } from "./lib/cropFigmaFrame.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "photos", "portfolio", "p2");
const FILE_KEY = "d9lhv5NK51QSRrS2zRqeip";
const VIEWPORT_HEIGHT = 900;
const DISPLAY_SCALE = 2;

/** @type {Array<{ file: string, nodeId: string, pick?: "largest" | "leftmost" | "rightmost" | "center" | "none", crop?: { top: number, height: number } }>} */
const EXPORTS = [
  { file: "home-hero.png", nodeId: "2:623", pick: "leftmost", crop: { top: 0, height: VIEWPORT_HEIGHT } },
  { file: "home-services.png", nodeId: "2:623", pick: "leftmost", crop: { top: 529, height: VIEWPORT_HEIGHT } },
  { file: "portfolio-grid.png", nodeId: "2:1925", pick: "none", crop: { top: 0, height: VIEWPORT_HEIGHT } },
  { file: "about-page.png", nodeId: "2:1434", pick: "none", crop: { top: 0, height: VIEWPORT_HEIGHT } },
  { file: "p2-detail.png", nodeId: "2:2417", pick: "none", crop: { top: 0, height: VIEWPORT_HEIGHT } },
  { file: "contact-page.png", nodeId: "2:2417", pick: "none", crop: { top: 529, height: VIEWPORT_HEIGHT } },
];

const nodeUrl = (nodeId) =>
  `https://www.figma.com/design/${FILE_KEY}/cooper?node-id=${nodeId.replace(":", "-")}`;

async function captureNode(page, nodeId, pick = "largest") {
  const url = nodeUrl(nodeId);
  console.log(`  Loading ${nodeId}…`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(8000);

  const blocked = await page.locator("text=403 ERROR").count();
  if (blocked > 0) throw new Error(`CloudFront 403 for node ${nodeId}`);

  await page.keyboard.press("Shift+2");
  await page.waitForTimeout(2500);

  const raw = await page.screenshot({ type: "png", fullPage: false });
  return cropFigmaFrame(raw, pick);
}

async function saveExport(buffer, item) {
  const base = sharp(buffer).rotate();
  const meta = await base.metadata();
  if (!meta.width || !meta.height) throw new Error(`Missing dimensions for ${item.file}`);

  let width = meta.width;
  let height = meta.height;
  let top = 0;

  if (item.crop) {
    top = Math.min(item.crop.top, Math.max(0, meta.height - 1));
    height = Math.min(item.crop.height, meta.height - top);
  }

  const outPath = path.join(OUT, item.file);
  const info = await sharp(buffer)
    .rotate()
    .extract({ left: 0, top, width, height })
    .resize({
      width: Math.round(width * DISPLAY_SCALE),
      height: Math.round(height * DISPLAY_SCALE),
      fit: "fill",
    })
    .png({ compressionLevel: 6 })
    .toFile(outPath);

  const stat = await fs.stat(outPath);
  console.log(`  → ${item.file} ${info.width}×${info.height} (${Math.round(stat.size / 1024)} KB)`);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  console.log(`Capturing Figma frames → ${OUT}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  const uniqueNodes = [
    ...new Map(EXPORTS.map((e) => [e.nodeId, e.pick ?? "largest"])).entries(),
  ];

  for (const [nodeId, pick] of uniqueNodes) {
    let buffer;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        buffer = await captureNode(page, nodeId, pick);
        break;
      } catch (err) {
        const wait = 12_000 * (attempt + 1);
        console.warn(`  Retry ${attempt + 1} for ${nodeId}: ${err.message} (wait ${wait / 1000}s)`);
        await page.waitForTimeout(wait);
        if (attempt === 3) throw err;
      }
    }
    const items = EXPORTS.filter((e) => e.nodeId === nodeId);
    for (const item of items) {
      console.log(`Writing ${item.file}…`);
      await saveExport(buffer, item);
    }
    await page.waitForTimeout(5000);
  }

  await browser.close();
  console.log("\nDone. Run npm run optimize-images to refresh WebP variants.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
