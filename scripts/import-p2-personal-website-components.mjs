/**
 * Copy uploaded Figma component strips into public/photos/portfolio/p2.
 * Run: node scripts/import-p2-personal-website-components.mjs
 */
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(os.homedir(), ".cursor", "projects", "x-A-1", "assets");
const OUT = path.join(__dirname, "..", "public", "photos", "portfolio", "p2");

/** @type {Array<{ src: string, dest: string, trim?: number }>} */
const IMPORTS = [
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_230154-a9e220af-38ba-473f-87a9-3f5a3e15ded0.png",
    dest: "design-components-nav.png",
    trim: 12,
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_230458-d6534be7-4bb9-42c0-bf72-322cf2bb1eeb.png",
    dest: "design-icons.png",
    trim: 40,
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_225940-2626eef6-0089-4cb6-8398-14797b0819ac.png",
    dest: "design-components-tags.png",
    trim: 40,
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_225450-57a38511-5a92-4764-9e9e-99919a70c553.png",
    dest: "design-modules-buttons.png",
    trim: 40,
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_225810-9ec87f36-1af0-4e42-b824-d798ef247b04.png",
    dest: "design-modules-process.png",
    trim: 40,
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_225800-2220d716-b924-4fb3-ab2a-348b085a3c55.png",
    dest: "design-modules-stats.png",
    trim: 40,
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_225751-0378dfe4-945e-4642-855f-a0918179b7a3.png",
    dest: "design-modules-stats-card.png",
    trim: 40,
  },
];

const LEGACY = ["design-components-home.png", "design-components-about.png"];

async function importOne({ src, dest, trim }) {
  const absSrc = path.join(ASSETS, src);
  const absDest = path.join(OUT, dest);
  const raw = await fs.readFile(absSrc);
  let pipeline = sharp(raw).rotate();
  if (trim != null) {
    pipeline = sharp(await pipeline.trim({ threshold: trim }).png().toBuffer()).rotate();
  }
  const info = await pipeline.png({ compressionLevel: 9 }).toFile(absDest);
  console.log(`  ${dest}: ${info.width}×${info.height}`);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  console.log("Importing personal-website component strips…");
  for (const item of IMPORTS) {
    await importOne(item);
  }

  for (const file of LEGACY) {
    try {
      await fs.unlink(path.join(OUT, file));
      console.log(`Removed legacy ${file}`);
    } catch {
      /* already gone */
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
