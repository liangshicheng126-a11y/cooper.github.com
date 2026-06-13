import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const P2_DIR = path.join(__dirname, "..", "public", "photos", "portfolio", "p2");
const COVERS_DIR = path.join(P2_DIR, "covers");

const COVER_SIZE = { width: 1600, height: 900 };

/**
 * Crop a tall screenshot to a landscape hub-card cover.
 * topRatio / heightRatio select the vertical slice before 16:9 resize.
 */
async function makeCover(
  sourceRel,
  destName,
  { topRatio = 0, heightRatio = 0.52, trimThreshold } = {},
) {
  const sourceAbs = path.join(P2_DIR, sourceRel);
  let pipeline = sharp(sourceAbs);
  if (trimThreshold != null) {
    pipeline = sharp(await pipeline.trim({ threshold: trimThreshold }).toBuffer());
  }
  const meta = await pipeline.metadata();
  const top = Math.round(meta.height * topRatio);
  const extractHeight = Math.min(
    Math.round(meta.height * heightRatio),
    meta.height - top,
  );

  const destAbs = path.join(COVERS_DIR, destName);
  await pipeline
    .extract({ left: 0, top, width: meta.width, height: extractHeight })
    .resize(COVER_SIZE.width, COVER_SIZE.height, { fit: "cover", position: "centre" })
    .png({ compressionLevel: 9 })
    .toFile(destAbs);

  const out = await sharp(destAbs).metadata();
  console.log(`  ${destName}: ${sourceRel} slice ${topRatio}–${topRatio + heightRatio} → ${out.width}×${out.height}`);
}

async function main() {
  await fs.mkdir(COVERS_DIR, { recursive: true });

  console.log("Generating P2 hub cover images…");

  // Home page: services, stats, tools, workflow — matches hub card preview
  await makeCover("home.png", "personal-website.png", {
    topRatio: 0.31,
    heightRatio: 0.38,
  });

  // Dashboard grid: todo + stock widgets (below flight card)
  await makeCover(path.join("smart-glasses", "home-dashboard.png"), "smart-glasses.png", {
    topRatio: 0.43,
    heightRatio: 0.27,
    trimThreshold: 12,
  });

  console.log(`\nDone. Covers → ${COVERS_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
