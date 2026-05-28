import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const GALLERY_DIRS = [
  path.join(PUBLIC, "photos", "posters"),
  path.join(PUBLIC, "photos", "photography"),
];

const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif)$/i;
const SKIP_DIRS = new Set(["_thumb", "_display"]);

const VARIANTS = [
  { dir: "_thumb", maxEdge: 960, quality: 80 },
  { dir: "_display", maxEdge: 1920, quality: 82 },
];

async function collectImages(dirAbs, relParts = []) {
  let entries;
  try {
    entries = await fs.readdir(dirAbs, { withFileTypes: true });
  } catch {
    return [];
  }

  const out = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(
        ...(await collectImages(path.join(dirAbs, entry.name), [...relParts, entry.name])),
      );
      continue;
    }
    if (!entry.isFile() || !IMAGE_RE.test(entry.name)) continue;
    out.push({ relParts, fileName: entry.name, abs: path.join(dirAbs, entry.name) });
  }
  return out;
}

function webPath(galleryRootName, relParts, fileName) {
  const segments = [galleryRootName, ...relParts, fileName].map((s) => encodeURIComponent(s));
  return `/photos/${segments.join("/")}`;
}

function outputAbs(galleryAbs, variantDir, relParts, fileName) {
  const withoutExt = fileName.replace(/\.[^.]+$/i, "");
  return path.join(galleryAbs, variantDir, ...relParts, `${withoutExt}.webp`);
}

async function needsRegenerate(sourceAbs, targetAbs) {
  try {
    const [srcStat, tgtStat] = await Promise.all([fs.stat(sourceAbs), fs.stat(targetAbs)]);
    return tgtStat.mtimeMs < srcStat.mtimeMs;
  } catch {
    return true;
  }
}

async function resizeToWebp(sourceAbs, targetAbs, maxEdge, quality) {
  await fs.mkdir(path.dirname(targetAbs), { recursive: true });
  await sharp(sourceAbs)
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toFile(targetAbs);
}

async function processGallery(galleryAbs) {
  const galleryRootName = path.basename(path.dirname(galleryAbs)) === "photos"
    ? path.basename(galleryAbs)
    : path.basename(galleryAbs);

  const images = await collectImages(galleryAbs);
  let generated = 0;
  let skipped = 0;

  for (const image of images) {
    for (const variant of VARIANTS) {
      const targetAbs = outputAbs(galleryAbs, variant.dir, image.relParts, image.fileName);
      if (!(await needsRegenerate(image.abs, targetAbs))) {
        skipped += 1;
        continue;
      }
      await resizeToWebp(image.abs, targetAbs, variant.maxEdge, variant.quality);
      generated += 1;
      const originalWeb = webPath(galleryRootName, image.relParts, image.fileName);
      console.log(`  ${variant.dir}: ${originalWeb}`);
    }
  }

  return { generated, skipped, count: images.length };
}

async function main() {
  console.log("Optimizing gallery images…");
  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalSources = 0;

  for (const galleryAbs of GALLERY_DIRS) {
    const name = path.relative(PUBLIC, galleryAbs);
    const result = await processGallery(galleryAbs);
    totalGenerated += result.generated;
    totalSkipped += result.skipped;
    totalSources += result.count;
    console.log(`${name}: ${result.count} source(s), ${result.generated} written, ${result.skipped} up-to-date`);
  }

  console.log(
    `Done. ${totalSources} source image(s); ${totalGenerated} variant(s) written; ${totalSkipped} skipped.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
