import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const P2_DIR = path.join(__dirname, "..", "public", "photos", "portfolio", "p2");

/** Full-page Figma exports: trim workspace padding from top-left colour. */
const PAGE_FILES = ["home.png", "portfolio.png", "about.png", "project-detail.png"];
const PAGE_TRIM_THRESHOLD = 15;

/** Component strips: trim dark Figma canvas margins on the sides. */
const COMPONENT_FILES = [
  "design-components-nav.png",
  "design-icons.png",
  "design-components-tags.png",
  "design-modules-buttons.png",
  "design-modules-process.png",
  "design-modules-stats.png",
  "design-modules-stats-card.png",
];
const COMPONENT_TRIM_THRESHOLD = 50;

async function trimInPlace(fileName, threshold) {
  const abs = path.join(P2_DIR, fileName);
  const before = await sharp(abs).metadata();
  const buffer = await sharp(abs).trim({ threshold }).png({ compressionLevel: 9 }).toBuffer();
  const after = await sharp(buffer).metadata();
  await fs.writeFile(abs, buffer);
  console.log(
    `  ${fileName}: ${before.width}×${before.height} → ${after.width}×${after.height}`,
  );
}

async function main() {
  const colorsPath = path.join(P2_DIR, "design-colors.png");
  try {
    await fs.unlink(colorsPath);
    console.log("Removed design-colors.png");
  } catch {
    /* already gone */
  }

  console.log("Trimming page screenshots…");
  for (const file of PAGE_FILES) {
    await trimInPlace(file, PAGE_TRIM_THRESHOLD);
  }

  console.log("Trimming component strips…");
  console.log("  skip all component artboards (imported without trim)");

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
