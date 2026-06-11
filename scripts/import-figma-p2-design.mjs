/**
 * Export cooper Figma frames into public/photos/portfolio/p2 for the p2 design showcase.
 * Run: npm run import-figma-p2
 *
 * Token: FIGMA_ACCESS_TOKEN env, or auto-read from ~/.cursor/mcp.json
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "photos", "portfolio", "p2");
const SITE = process.env.SITE_URL ?? "https://cooperliang.top";

const FILE_KEY = process.env.FIGMA_FILE_KEY ?? "d9lhv5NK51QSRrS2zRqeip";
const PNG_SCALE = Number(process.env.FIGMA_EXPORT_SCALE ?? 1);
const DISPLAY_SCALE = Number(process.env.FIGMA_DISPLAY_SCALE ?? 2);
const VIEWPORT_HEIGHT = 900;

/** @type {Array<{ file: string, nodeId?: string, crop?: { top: number, height: number }, fallback?: { path: string, scrollTo?: string, waitMs?: number } }>} */
const EXPORTS = [
  { file: "home-hero.png", nodeId: "2:623", crop: { top: 0, height: VIEWPORT_HEIGHT } },
  { file: "home-services.png", nodeId: "2:623", crop: { top: 529, height: VIEWPORT_HEIGHT } },
  { file: "portfolio-grid.png", nodeId: "2:1925", crop: { top: 0, height: VIEWPORT_HEIGHT } },
  {
    file: "p2-detail.png",
    fallback: { path: "/portfolio/p2", waitMs: 2500 },
  },
  { file: "about-page.png", nodeId: "2:1434", crop: { top: 0, height: VIEWPORT_HEIGHT } },
  {
    file: "contact-page.png",
    fallback: { path: "/contact", waitMs: 2500 },
  },
];

async function readFigmaToken() {
  if (process.env.FIGMA_ACCESS_TOKEN) return process.env.FIGMA_ACCESS_TOKEN;

  const mcpPath = path.join(os.homedir(), ".cursor", "mcp.json");
  const raw = await fs.readFile(mcpPath, "utf8");
  const config = JSON.parse(raw);
  const args = config?.mcpServers?.["Framelink MCP for Figma"]?.args ?? [];
  const keyArg = args.find((arg) => typeof arg === "string" && arg.startsWith("--figma-api-key="));
  if (!keyArg) throw new Error("FIGMA_ACCESS_TOKEN not set and no --figma-api-key in ~/.cursor/mcp.json");
  return keyArg.slice("--figma-api-key=".length);
}

async function figmaFetch(token, url) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: { "X-Figma-Token": token } });
    const data = await res.json();
    if (res.status === 429) {
      const waitMs = 4000 * (attempt + 1);
      console.warn(`Rate limited, retrying in ${waitMs / 1000}s…`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    if (!res.ok) throw new Error(`Figma API ${res.status}: ${data.err ?? res.statusText}`);
    return data;
  }
  throw new Error("Figma API rate limit exceeded after retries");
}

async function exportNodePng(token, nodeId) {
  const params = new URLSearchParams({
    ids: nodeId,
    format: "png",
    scale: String(PNG_SCALE),
  });
  const data = await figmaFetch(token, `https://api.figma.com/v1/images/${FILE_KEY}?${params}`);
  const url = data.images?.[nodeId];
  if (!url) throw new Error(`No image URL for node ${nodeId}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${nodeId}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function saveExport(buffer, item) {
  const base = sharp(buffer).rotate();
  const meta = await base.metadata();
  if (!meta.width || !meta.height) throw new Error(`Missing dimensions for ${item.file}`);

  let width = meta.width;
  let height = meta.height;
  let left = 0;
  let top = 0;

  if (item.crop) {
    top = Math.min(Math.round(item.crop.top * PNG_SCALE), Math.max(0, meta.height - 1));
    height = Math.min(Math.round(item.crop.height * PNG_SCALE), meta.height - top);
  }

  let pipeline = sharp(buffer).rotate().extract({ left, top, width, height });

  if (DISPLAY_SCALE > PNG_SCALE) {
    const factor = DISPLAY_SCALE / PNG_SCALE;
    pipeline = pipeline.resize({
      width: Math.round(width * factor),
      height: Math.round(height * factor),
      fit: "fill",
    });
  }

  const outPath = path.join(OUT, item.file);
  const info = await pipeline.png({ compressionLevel: 6 }).toFile(outPath);
  const stat = await fs.stat(outPath);
  console.log(`  → ${item.file} ${info.width}×${info.height} (${Math.round(stat.size / 1024)} KB)`);
}

async function captureFromSite(page, item) {
  const url = `${SITE}${item.fallback.path}`;
  console.log(`Capturing ${item.file} ← ${url}`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(item.fallback.waitMs ?? 2500);
  if (item.fallback.scrollTo) {
    await page.locator(item.fallback.scrollTo).scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
  }

  const rawPath = path.join(OUT, `${item.file}.raw.png`);
  const outPath = path.join(OUT, item.file);
  await page.screenshot({ path: rawPath, fullPage: false, type: "png" });
  const info = await sharp(rawPath).rotate().png({ compressionLevel: 6 }).toFile(outPath);
  await fs.unlink(rawPath);
  const stat = await fs.stat(outPath);
  console.log(`  → ${item.file} ${info.width}×${info.height} (${Math.round(stat.size / 1024)} KB)`);
}

async function main() {
  const token = await readFigmaToken();
  await fs.mkdir(OUT, { recursive: true });

  console.log(`Exporting cooper (${FILE_KEY}) @ ${PNG_SCALE}x → ${DISPLAY_SCALE}x display → ${OUT}\n`);

  const figmaItems = EXPORTS.filter((item) => item.nodeId);
  const fallbackItems = EXPORTS.filter((item) => item.fallback);

  const uniqueNodes = [...new Set(figmaItems.map((e) => e.nodeId))];
  const pngByNode = new Map();
  for (const nodeId of uniqueNodes) {
    console.log(`Fetching ${nodeId}…`);
    pngByNode.set(nodeId, await exportNodePng(token, nodeId));
    await new Promise((r) => setTimeout(r, 1500));
  }

  for (const item of figmaItems) {
    console.log(`Writing ${item.file}…`);
    await saveExport(pngByNode.get(item.nodeId), item);
  }

  if (fallbackItems.length > 0) {
    console.log("\nFigma has no contact / p2-detail frames — capturing from live site…");
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: DISPLAY_SCALE,
      colorScheme: "light",
    });
    const page = await context.newPage();
    for (const item of fallbackItems) {
      await captureFromSite(page, item);
    }
    await browser.close();
  }

  console.log("\nDone. Run npm run optimize-images to refresh WebP variants.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
