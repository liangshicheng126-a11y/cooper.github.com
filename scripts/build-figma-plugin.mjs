/**
 * Bundle screenshots + tokens into a Figma development plugin (code.js).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "design-export");
const PLUGIN = path.join(OUT, "figma-plugin");

async function main() {
  const manifest = JSON.parse(
    await fs.readFile(path.join(OUT, "export-manifest.json"), "utf8"),
  );
  const tokens = manifest.tokens;

  const images = {};
  for (const shot of manifest.screenshots) {
    const buf = await fs.readFile(path.join(OUT, "screenshots", shot.fileName));
    images[shot.fileName] = {
      base64: buf.toString("base64"),
      width: shot.width,
      label: shot.label,
      frameName: shot.frameName,
      viewport: shot.viewport,
      page: shot.page,
    };
  }

  const pluginCode = `// Auto-generated — do not edit. Run: node scripts/export-figma-design.mjs
const PAYLOAD = ${JSON.stringify({ tokens, images, manifest: manifest.screenshots })};

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

async function loadImage(base64) {
  const bytes = figma.base64Decode(base64);
  return figma.createImage(bytes);
}

function ensureFont(style) {
  return figma.loadFontAsync({ family: "Inter", style }).catch(() =>
    figma.loadFontAsync({ family: "Roboto", style }),
  );
}

async function createColorStyles(tokens) {
  const created = [];
  for (const [name, value] of Object.entries(tokens.colors)) {
    if (!value.hex) continue;
    const style = figma.createPaintStyle();
    style.name = \`Color/\${name}\`;
    const rgb = hexToRgb(value.hex);
    style.paints = [{
      type: "SOLID",
      color: rgb,
      opacity: value.opacity != null ? value.opacity : 1,
    }];
    created.push(style.name);
  }
  return created;
}

async function createTextStyles(tokens) {
  const created = [];
  for (const [name, spec] of Object.entries(tokens.typography)) {
    const style = figma.createTextStyle();
    style.name = \`Type/\${name}\`;
    style.fontSize = spec.size;
    style.lineHeight = { unit: "PERCENT", value: (spec.lineHeight || 1.4) * 100 };
    if (spec.letterSpacing) {
      style.letterSpacing = { unit: "PERCENT", value: spec.letterSpacing * 100 };
    }
    style.fontName = { family: "Inter", style: spec.weight >= 600 ? "Bold" : "Regular" };
    created.push(style.name);
  }
  return created;
}

const FIGMA_MAX_EDGE = 4096;

async function createScreenshotFrame(item) {
  const data = PAYLOAD.images[item.fileName];
  if (!data) throw new Error("missing image data");

  const img = await loadImage(data.base64);
  const size = await img.getSizeAsync();
  if (size.width > FIGMA_MAX_EDGE || size.height > FIGMA_MAX_EDGE) {
    throw new Error("image exceeds 4096px (" + size.width + "x" + size.height + ")");
  }

  const w = item.width || size.width;
  const scale = w / size.width;
  const h = Math.round(size.height * scale);

  const frame = figma.createFrame();
  frame.name = item.frameName;
  frame.resize(w, h);
  frame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  frame.clipsContent = true;

  const rect = figma.createRectangle();
  rect.resize(w, h);
  rect.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" }];
  frame.appendChild(rect);
  return frame;
}

function findOrCreatePage(name) {
  const existing = figma.root.children.find((p) => p.type === "PAGE" && p.name === name);
  if (existing) {
    for (const child of [...existing.children]) child.remove();
    return existing;
  }
  return figma.createPage();
}

async function buildTokensPage(tokens) {
  const page = figma.createPage();
  page.name = "🎨 Design Tokens";
  figma.currentPage = page;

  await ensureFont("Bold");
  await ensureFont("Regular");

  const title = figma.createText();
  title.fontName = { family: "Inter", style: "Bold" };
  title.characters = "cooperliang.top — Design Tokens";
  title.fontSize = 32;
  title.x = 80;
  title.y = 80;
  page.appendChild(title);

  let x = 80;
  let y = 160;
  let i = 0;
  for (const [name, value] of Object.entries(tokens.colors)) {
    if (!value.hex) continue;
    const swatch = figma.createRectangle();
    swatch.resize(64, 64);
    swatch.x = x;
    swatch.y = y;
    swatch.cornerRadius = 12;
    swatch.fills = [{
      type: "SOLID",
      color: hexToRgb(value.hex),
      opacity: value.opacity != null ? value.opacity : 1,
    }];
    page.appendChild(swatch);

    const label = figma.createText();
    label.fontName = { family: "Inter", style: "Regular" };
    label.characters = name + "\\n" + value.hex;
    label.fontSize = 11;
    label.x = x;
    label.y = y + 72;
    page.appendChild(label);

    i += 1;
    x += 120;
    if (i % 8 === 0) {
      x = 80;
      y += 160;
    }
  }
}

async function buildScreensPage(pageName) {
  const page = findOrCreatePage(pageName);
  page.name = pageName;
  figma.currentPage = page;

  const gap = 80;
  const colGap = 120;
  let desktopY = 0;
  let mobileY = 0;
  let desktopX = 0;
  let mobileX = 1560;
  let placed = 0;

  const desktopItems = PAYLOAD.manifest.filter((s) => s.viewport === "desktop");
  const mobileItems = PAYLOAD.manifest.filter((s) => s.viewport === "mobile");

  for (const item of desktopItems) {
    try {
      const frame = await createScreenshotFrame(item);
      frame.x = desktopX;
      frame.y = desktopY;
      page.appendChild(frame);
      desktopY += frame.height + gap;
      placed += 1;
    } catch (err) {
      figma.notify("Skip " + item.fileName + ": " + err.message, { error: true });
    }
  }

  for (const item of mobileItems) {
    try {
      const frame = await createScreenshotFrame(item);
      frame.x = mobileX;
      frame.y = mobileY;
      page.appendChild(frame);
      mobileY += frame.height + gap;
      placed += 1;
    } catch (err) {
      figma.notify("Skip " + item.fileName + ": " + err.message, { error: true });
    }
  }

  if (placed === 0) throw new Error("no screenshots placed — re-run npm run export-figma");

  const labelDesktop = figma.createText();
  await ensureFont("Bold");
  labelDesktop.fontName = { family: "Inter", style: "Bold" };
  labelDesktop.characters = "Desktop (1440 viewport)";
  labelDesktop.fontSize = 14;
  labelDesktop.x = desktopX;
  labelDesktop.y = -36;
  page.appendChild(labelDesktop);

  const labelMobile = figma.createText();
  labelMobile.fontName = { family: "Inter", style: "Bold" };
  labelMobile.characters = "Mobile (390 viewport)";
  labelMobile.fontSize = 14;
  labelMobile.x = mobileX;
  labelMobile.y = -36;
  page.appendChild(labelMobile);

  figma.viewport.scrollAndZoomIntoView(page.children);
  return placed;
}

async function run() {
  await ensureFont("Bold");
  await ensureFont("Regular");

  figma.notify("Importing cooperliang.top…");

  const hasTokensPage = figma.root.children.some(
    (p) => p.type === "PAGE" && String(p.name).includes("Design Tokens"),
  );
  if (!hasTokensPage) {
    await createColorStyles(PAYLOAD.tokens);
    await createTextStyles(PAYLOAD.tokens);
    await buildTokensPage(PAYLOAD.tokens);
  }

  const count = await buildScreensPage("Desktop");
  figma.currentPage = figma.root.children.find((p) => p.name === "Desktop");
  figma.notify("Import complete — " + count + " screens");
  figma.closePlugin();
}

run().catch((err) => {
  figma.notify("Import failed: " + err.message, { error: true });
  figma.closePlugin();
});
`;

  await fs.mkdir(PLUGIN, { recursive: true });
  await fs.writeFile(
    path.join(PLUGIN, "manifest.json"),
    `${JSON.stringify(
      {
        name: "Cooper Site Import",
        id: "cooper-site-import-local",
        api: "1.0.0",
        main: "code.js",
        editorType: ["figma"],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(path.join(PLUGIN, "code.js"), pluginCode, "utf8");

  const totalBytes = Object.values(images).reduce((s, i) => s + i.base64.length, 0);
  console.log(
    `Wrote figma-plugin/code.js (${Math.round(totalBytes / 1024 / 1024)} MB embedded images)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
