/**
 * Crop a Figma full-canvas export (cooper.png) into p2 design showcase images.
 * Run: node scripts/crop-cooper-p2-design.mjs [sourcePath]
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "photos", "portfolio", "p2");
const SOURCE = process.argv[2] ?? "C:/Users/L/Downloads/cooper.png";

/** Figma artboard bounds detected from cooper.png (13073×4712). */
const FRAMES = {
  home: { left: 100, top: 100, width: 1916, height: 2580 },
  about: { left: 2436, top: 100, width: 1490, height: 2580 },
  portfolio: { left: 4364, top: 100, width: 1922, height: 2580 },
  graphic: { left: 6728, top: 100, width: 1916, height: 3932 },
};

const DISPLAY_MAX_WIDTH = 2560;
const MAX_OUTPUT_HEIGHT = 2400;

/** @type {Array<{ file: string, frame: keyof typeof FRAMES, crop: { top: number, height: number } }>} */
const EXPORTS = [
  { file: "home-hero.png", frame: "home", crop: { top: 0, height: 1050 } },
  { file: "home-services.png", frame: "home", crop: { top: 920, height: 1660 } },
  { file: "portfolio-grid.png", frame: "portfolio", crop: { top: 0, height: 2580 } },
  { file: "about-page.png", frame: "about", crop: { top: 0, height: 2580 } },
  { file: "p2-detail.png", frame: "graphic", crop: { top: 0, height: 1180 } },
  { file: "contact-page.png", frame: "graphic", crop: { top: 1080, height: 2852 } },
];

async function exportSlice(source, item) {
  const frame = FRAMES[item.frame];
  const top = frame.top + item.crop.top;
  const height = Math.min(item.crop.height, frame.height - item.crop.top);
  const outPath = path.join(OUT, item.file);

  let pipeline = sharp(source).extract({
    left: frame.left,
    top,
    width: frame.width,
    height,
  });

  const meta = await sharp(source).metadata();
  const scale = meta.width > 8000 ? DISPLAY_MAX_WIDTH / frame.width : 1;
  let outW = Math.round(frame.width * scale);
  let outH = Math.round(height * scale);
  if (outH > MAX_OUTPUT_HEIGHT) {
    outH = MAX_OUTPUT_HEIGHT;
    outW = Math.round((frame.width / height) * outH);
  }
  if (scale !== 1 || outH !== Math.round(height * scale)) {
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
