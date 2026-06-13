/**
 * Rasterize icon.svg circles to source.png for brand-intro QA overlays.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/brand-intro");
mkdirSync(outDir, { recursive: true });

const iconSvg = readFileSync(join(root, "src/app/icon.svg"), "utf8");
const transparentSvg = iconSvg
  .replace(/<rect[^>]*\/>/g, "")
  .replace(/filter="url\(#blur\)"/g, 'opacity="0.9"')
  .replace(/<defs>[\s\S]*?<\/defs>/g, "");

const { chromium } = await import("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 256, height: 256 } });
await page.setContent(
  `<!DOCTYPE html><html><body style="margin:0;background:transparent">${transparentSvg}</body></html>`
);
await page.screenshot({
  path: join(outDir, "source.png"),
  omitBackground: true,
});
await browser.close();
console.log("Wrote docs/brand-intro/source.png");
