/**
 * Copy a full component artboard into public/photos/portfolio/p2 — no crop/trim.
 * Run: node scripts/import-p2-personal-website-components.mjs [source.png]
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "photos", "portfolio", "p2");
const DEST = "design-components-board.png";

const LEGACY = [
  "design-components-home.png",
  "design-components-about.png",
  "design-components-nav.png",
  "design-icons.png",
  "design-components-tags.png",
  "design-modules-buttons.png",
  "design-modules-process.png",
  "design-modules-stats.png",
  "design-modules-stats-card.png",
];

async function main() {
  const srcArg = process.argv[2];
  const src = srcArg
    ? path.resolve(srcArg)
    : path.join(
        os.homedir(),
        ".cursor",
        "projects",
        "x-A-1",
        "assets",
        "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-2388a329-ec21-4b78-9136-3d52e2eda825.png",
      );

  await fs.mkdir(OUT, { recursive: true });
  await fs.copyFile(src, path.join(OUT, DEST));
  console.log(`Copied (no trim): ${src} → ${DEST}`);

  for (const file of LEGACY) {
    try {
      await fs.unlink(path.join(OUT, file));
      console.log(`Removed legacy ${file}`);
    } catch {
      /* already gone */
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
