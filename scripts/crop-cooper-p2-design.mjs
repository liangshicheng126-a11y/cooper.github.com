/**
 * Precisely crop cooper.png (Figma full-canvas export) into p2 design showcase images.
 * Coordinates calibrated against user reference crops + canvas probe.
 * Run: npm run crop-cooper-p2
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "photos", "portfolio", "p2");
const SOURCE = process.argv[2] ?? "C:/Users/L/Downloads/cooper.png";

const DISPLAY_MAX_WIDTH = 2560;
const MAX_OUTPUT_HEIGHT = 2400;

/** @type {Array<{ file: string, region: { left: number, top: number, width: number, height: number }, maxWidth?: number }>} */
const EXPORTS = [
  // —— 四张页面画板 ——
  { file: "home-hero.png", region: { left: 100, top: 100, width: 1916, height: 820 } },
  { file: "home-services.png", region: { left: 100, top: 920, width: 1916, height: 1660 } },
  { file: "portfolio-grid.png", region: { left: 4364, top: 100, width: 1922, height: 2580 } },
  { file: "about-page.png", region: { left: 2436, top: 100, width: 1710, height: 2580 } },
  { file: "p2-detail.png", region: { left: 6728, top: 100, width: 1916, height: 1050 } },
  { file: "contact-page.png", region: { left: 6728, top: 1150, width: 1916, height: 2782 } },
  // —— Figma 组件条（首页模块 / 按钮模块 / 图标） ——
  {
    file: "design-modules-stats.png",
    region: { left: 10950, top: 500, width: 720, height: 3700 },
    maxWidth: 1200,
  },
  {
    file: "design-modules-buttons.png",
    region: { left: 11760, top: 180, width: 520, height: 2900 },
    maxWidth: 1200,
  },
  {
    file: "design-icons.png",
    region: { left: 10075, top: 180, width: 700, height: 2200 },
    maxWidth: 900,
  },
];

async function exportSlice(source, item) {
  const { region } = item;
  const outPath = path.join(OUT, item.file);
  const capWidth = item.maxWidth ?? DISPLAY_MAX_WIDTH;

  let pipeline = sharp(source).extract(region);

  const scale = Math.min(1, capWidth / region.width);
  let outW = Math.round(region.width * scale);
  let outH = Math.round(region.height * scale);

  if (outH > MAX_OUTPUT_HEIGHT) {
    outH = MAX_OUTPUT_HEIGHT;
    outW = Math.round((region.width / region.height) * outH);
  }

  if (scale < 1 || outH !== Math.round(region.height * scale)) {
    pipeline = pipeline.resize({ width: outW, height: outH, fit: "fill" });
  }

  const info = await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
  const stat = await fs.stat(outPath);
  console.log(`  → ${item.file} ${info.width}×${info.height} (${Math.round(stat.size / 1024)} KB)`);
}

async function main() {
  await fs.access(SOURCE);
  await fs.mkdir(OUT, { recursive: true });

  const meta = await sharp(SOURCE).metadata();
  console.log(`Cropping ${SOURCE} (${meta.width}×${meta.height}) → ${OUT}\n`);

  for (const item of EXPORTS) {
    console.log(`Writing ${item.file}…`);
    await exportSlice(SOURCE, item);
  }

  console.log("\nDone. Run npm run optimize-images to refresh WebP variants.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
