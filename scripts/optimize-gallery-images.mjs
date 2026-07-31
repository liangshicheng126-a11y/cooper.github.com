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
  path.join(PUBLIC, "photos", "portfolio", "p2"), // includes smart-glasses/ subtree
];

const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif)$/i;
const SKIP_DIRS = new Set(["_thumb", "_display"]);

const VARIANTS = [
  { dir: "_thumb", maxEdge: 960, quality: 80 },
  { dir: "_display", maxEdge: 1920, quality: 82 },
];

/** Ultra-tall pages (e.g. e-commerce details) get a top crop for grid thumbs. */
const TALL_HEIGHT_RATIO = 2.2;
/** Thumb crop width/height — keeps brand/hero readable in masonry. */
const TALL_THUMB_ASPECT = 3 / 4;

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

function webPath(galleryWebPrefix, relParts, fileName) {
  const segments = [...galleryWebPrefix.split("/"), ...relParts, fileName].map((s) =>
    encodeURIComponent(s),
  );
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

async function resizeToWebp(sourceAbs, targetAbs, maxEdge, quality, { cropTopTall = false } = {}) {
  await fs.mkdir(path.dirname(targetAbs), { recursive: true });
  const baseMeta = await sharp(sourceAbs).rotate().metadata();
  const width = baseMeta.width ?? 1;
  const height = baseMeta.height ?? 1;
  const isTall = height / width >= TALL_HEIGHT_RATIO;

  let pipeline = sharp(sourceAbs).rotate();

  if (cropTopTall && isTall) {
    const cropHeight = Math.min(height, Math.round(width / TALL_THUMB_ASPECT));
    pipeline = sharp(sourceAbs).rotate().extract({
      left: 0,
      top: 0,
      width,
      height: cropHeight,
    });
    await pipeline
      .resize({
        width: maxEdge,
        height: maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 })
      .toFile(targetAbs);
    return;
  }

  // Tall e-commerce pages: constrain by width so lightbox stays readable.
  if (isTall) {
    await pipeline
      .resize({
        width: maxEdge,
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 })
      .toFile(targetAbs);
    return;
  }

  await pipeline
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toFile(targetAbs);
}

async function readImageDimensions(sourceAbs) {
  const meta = await sharp(sourceAbs).rotate().metadata();
  return {
    width: meta.width ?? 1,
    height: meta.height ?? 1,
  };
}

async function processGallery(galleryAbs, manifest) {
  const photosRoot = path.join(PUBLIC, "photos");
  const galleryWebPrefix = path.relative(photosRoot, galleryAbs).split(path.sep).join("/");

  const images = await collectImages(galleryAbs);
  let generated = 0;
  let skipped = 0;

  for (const image of images) {
    const originalWeb = webPath(galleryWebPrefix, image.relParts, image.fileName);
    manifest[originalWeb] = await readImageDimensions(image.abs);

    for (const variant of VARIANTS) {
      const targetAbs = outputAbs(galleryAbs, variant.dir, image.relParts, image.fileName);
      if (!(await needsRegenerate(image.abs, targetAbs))) {
        skipped += 1;
        continue;
      }
      await resizeToWebp(image.abs, targetAbs, variant.maxEdge, variant.quality, {
        cropTopTall: variant.dir === "_thumb",
      });
      generated += 1;
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
  const manifest = {};

  for (const galleryAbs of GALLERY_DIRS) {
    const name = path.relative(PUBLIC, galleryAbs);
    const result = await processGallery(galleryAbs, manifest);
    totalGenerated += result.generated;
    totalSkipped += result.skipped;
    totalSources += result.count;
    console.log(`${name}: ${result.count} source(s), ${result.generated} written, ${result.skipped} up-to-date`);
  }

  const manifestPath = path.join(PUBLIC, "photos", "gallery-manifest.json");
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote manifest: ${path.relative(ROOT, manifestPath)} (${Object.keys(manifest).length} entries)`);

  console.log(
    `Done. ${totalSources} source image(s); ${totalGenerated} variant(s) written; ${totalSkipped} skipped.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
