/**
 * Capture cooperliang.top screens + build Figma plugin payload.
 * Run: node scripts/export-figma-design.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

/** Figma raster limit — taller/wider images fail silently in plugins */
const MAX_EDGE = 4096;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "design-export");
const SHOTS = path.join(OUT, "screenshots");
const SITE = process.env.SITE_URL ?? "https://cooperliang.top";

const PAGES = [
  { id: "home", path: "/" },
  { id: "portfolio", path: "/portfolio/" },
  { id: "portfolio-p1", path: "/portfolio/p1/" },
  { id: "about", path: "/about/" },
  { id: "contact", path: "/contact/" },
];

const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];

async function capture() {
  await fs.mkdir(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const manifest = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const route of PAGES) {
      const url = `${SITE}${route.path}`;
      const fileName = `${vp.id}-${route.id}.png`;
      const filePath = path.join(SHOTS, fileName);

      console.log(`Capturing ${url} @ ${vp.id}…`);
      await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
      await page.waitForTimeout(1500);

      // Viewport capture — fullPage often exceeds Figma's 4096px image limit
      await page.screenshot({ path: filePath, fullPage: false });

      const meta = await sharp(filePath)
        .rotate()
        .resize({
          width: MAX_EDGE,
          height: MAX_EDGE,
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFile(`${filePath}.opt`);

      await fs.rename(`${filePath}.opt`, filePath);
      const stat = await fs.stat(filePath);

      manifest.push({
        viewport: vp.id,
        page: route.id,
        label: `${vp.id === "desktop" ? "Desktop" : "Mobile"} / ${route.id}`,
        fileName,
        width: meta.width,
        height: meta.height,
        frameName: `${route.id} (${vp.id})`,
      });
      console.log(`  → ${fileName} (${Math.round(stat.size / 1024)} KB)`);
    }

    await context.close();
  }

  await browser.close();
  return manifest;
}

async function main() {
  console.log(`Exporting ${SITE} for Figma…\n`);
  const screenshots = await capture();

  const tokens = JSON.parse(
    await fs.readFile(path.join(OUT, "figma-tokens.json"), "utf8"),
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    site: SITE,
    figmaFileKey: "nKd47PkEOE3f2HgK62BAAZ",
    tokens,
    screenshots,
  };

  await fs.writeFile(
    path.join(OUT, "export-manifest.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );

  console.log("\nRunning plugin bundler…");
  const { execSync } = await import("node:child_process");
  execSync("node scripts/build-figma-plugin.mjs", { cwd: ROOT, stdio: "inherit" });

  console.log("\nDone. Next: import design-export/figma-plugin in Figma → Run plugin.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
