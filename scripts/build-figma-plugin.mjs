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

async function placeScreenshot(parent, item, yOffset) {
  const data = PAYLOAD.images[item.fileName];
  if (!data) return yOffset;
  const img = await loadImage(data.base64);
  const size = await img.getSizeAsync();
  const scale = item.width / size.width;
  const h = size.height * scale;

  const frame = figma.createFrame();
  frame.name = item.frameName;
  frame.resize(item.width, h);
  frame.x = 0;
  frame.y = yOffset;
  frame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  frame.clipsContent = true;

  const rect = figma.createRectangle();
  rect.resize(item.width, h);
  rect.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" }];
  frame.appendChild(rect);

  parent.appendChild(frame);
  return yOffset + h + 120;
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

async function buildScreensPage(pageName, viewport) {
  const page = figma.createPage();
  page.name = pageName;
  figma.currentPage = page;

  const items = PAYLOAD.manifest.filter((s) => s.viewport === viewport);
  let y = 0;
  const wrapper = figma.createFrame();
  wrapper.name = \`\${viewport} screens\`;
  wrapper.layoutMode = "VERTICAL";
  wrapper.primaryAxisSizingMode = "AUTO";
  wrapper.counterAxisSizingMode = "AUTO";
  wrapper.itemSpacing = 120;
  wrapper.fills = [];
  wrapper.x = 0;
  wrapper.y = 0;
  page.appendChild(wrapper);

  for (const item of items) {
    y = await placeScreenshot(wrapper, item, y);
  }
}

async function run() {
  await ensureFont("Bold");
  await ensureFont("Regular");

  figma.notify("Importing cooperliang.top…");

  await createColorStyles(PAYLOAD.tokens);
  await createTextStyles(PAYLOAD.tokens);
  await buildTokensPage(PAYLOAD.tokens);
  await buildScreensPage("🖥 Desktop", "desktop");
  await buildScreensPage("📱 Mobile", "mobile");

  const cover = figma.createPage();
  cover.name = "📋 Cover";
  figma.currentPage = cover;
  await ensureFont("Bold");
  const t = figma.createText();
  t.fontName = { family: "Inter", style: "Bold" };
  t.characters = "cooperliang.top\\nFigma export — reference screens + tokens\\nRegenerate: npm run export-figma";
  t.fontSize = 28;
  t.x = 120;
  t.y = 120;
  t.resize(900, 200);
  cover.appendChild(t);

  figma.currentPage = cover;
  figma.viewport.scrollAndZoomIntoView(cover.children);
  figma.notify("Import complete ✓");
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
