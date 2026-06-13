/**
 * Copy personal-website component artboards — no crop/trim.
 * Run: node scripts/import-p2-personal-website-components.mjs
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(os.homedir(), ".cursor", "projects", "x-A-1", "assets");
const OUT = path.join(__dirname, "..", "public", "photos", "portfolio", "p2");

/** @type {Array<{ src: string, dest: string }>} */
const IMPORTS = [
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_230154-9f6234b4-22cb-4b87-90bd-c84c068118dc.png",
    dest: "design-components-nav.png",
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_230458-f40deba0-d2fa-49f4-ab5c-570a50c3fa98.png",
    dest: "design-icons.png",
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_225940-e1eb62be-2b06-42df-89ed-f2a60c86d47c.png",
    dest: "design-components-tags.png",
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_225450-c9a49cc8-3e90-4661-8317-0c7f929626c8.png",
    dest: "design-modules-buttons.png",
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_225810-287ce99f-e4e3-455c-8296-5f278e7fc796.png",
    dest: "design-modules-process.png",
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_225800-6a7f8b4a-128f-4c41-89ae-2d0b26198acc.png",
    dest: "design-modules-stats.png",
  },
  {
    src: "c__Users_L_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______2026-06-13_225751-25de4495-8e60-44c5-8f0e-f7b7f83f7b69.png",
    dest: "design-modules-stats-card.png",
  },
];

const LEGACY = ["design-components-board.png", "design-components-home.png", "design-components-about.png"];

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  console.log("Importing component artboards (no trim)…");
  for (const { src, dest } of IMPORTS) {
    const absSrc = path.join(ASSETS, src);
    const absDest = path.join(OUT, dest);
    await fs.copyFile(absSrc, absDest);
    const stat = await fs.stat(absDest);
    console.log(`  ${dest} (${Math.round(stat.size / 1024)} KB)`);
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
