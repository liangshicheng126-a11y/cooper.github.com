import sharp from "sharp";

function isFramePixel(data, width, channels, x, y) {
  const i = (y * width + x) * channels;
  return data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235;
}

/** Flood-fill one white component; returns bbox or null. */
function floodComponent(data, width, height, channels, startX, startY, visited) {
  const stack = [[startX, startY]];
  let minX = startX;
  let minY = startY;
  let maxX = startX;
  let maxY = startY;
  let count = 0;

  while (stack.length) {
    const [x, y] = stack.pop();
    const key = y * width + x;
    if (x < 0 || y < 0 || x >= width || y >= height || visited[key]) continue;
    if (!isFramePixel(data, width, channels, x, y)) continue;

    visited[key] = 1;
    count++;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;

    stack.push([x + 2, y], [x - 2, y], [x, y + 2], [x, y - 2]);
  }

  const w = maxX - minX;
  const h = maxY - minY;
  if (count < 8000 || w < 500 || h < 400) return null;
  return { left: minX, top: minY, width: w, height: h, area: count };
}

/**
 * @param {Buffer} buffer
 * @param {"largest" | "leftmost" | "rightmost" | "center" | "none"} pick
 */
export async function cropFigmaFrame(buffer, pick = "largest") {
  if (pick === "none") return buffer;
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const boxes = [];

  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const key = y * width + x;
      if (visited[key] || !isFramePixel(data, width, channels, x, y)) continue;
      const box = floodComponent(data, width, height, channels, x, y, visited);
      if (box) boxes.push(box);
    }
  }

  if (!boxes.length) return buffer;

  boxes.sort((a, b) => b.area - a.area);

  let chosen = boxes[0];
  if (pick === "leftmost") {
    chosen = boxes.reduce((a, b) => (a.left < b.left ? a : b));
  } else if (pick === "rightmost") {
    chosen = boxes.reduce((a, b) => (a.left > b.left ? a : b));
  } else if (pick === "center") {
    const mid = width / 2;
    chosen = boxes.reduce((a, b) => {
      const aCx = a.left + a.width / 2;
      const bCx = b.left + b.width / 2;
      return Math.abs(aCx - mid) < Math.abs(bCx - mid) ? a : b;
    });
  } else {
    chosen = boxes[0];
  }

  const pad = 2;
  const left = Math.max(0, chosen.left - pad);
  const top = Math.max(0, chosen.top - pad);
  const w = Math.min(width - left, chosen.width + pad * 2);
  const h = Math.min(height - top, chosen.height + pad * 2);

  return sharp(buffer).extract({ left, top, width: w, height: h }).png().toBuffer();
}
