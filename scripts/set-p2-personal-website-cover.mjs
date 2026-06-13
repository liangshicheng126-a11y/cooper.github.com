import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = process.argv[2];
const DEST = path.join(
  __dirname,
  "..",
  "public",
  "photos",
  "portfolio",
  "p2",
  "covers",
  "personal-website.png",
);

if (!SOURCE) {
  console.error("Usage: node scripts/set-p2-personal-website-cover.mjs <source-image>");
  process.exit(1);
}

await fs.mkdir(path.dirname(DEST), { recursive: true });
const meta = await sharp(SOURCE).metadata();
await sharp(SOURCE)
  .resize(1600, 900, { fit: "cover", position: "centre" })
  .png({ compressionLevel: 9 })
  .toFile(DEST);

const out = await sharp(DEST).metadata();
console.log(`Cover updated: ${out.width}×${out.height} ← ${path.basename(SOURCE)} (was ${meta.width}×${meta.height})`);
