import { promises as fs } from "node:fs";
import path from "node:path";

const PREFERRED_ORDER = [
  "home.png",
  "portfolio.png",
  "about.png",
  "project-detail.png",
  "design-components-home.png",
  "design-components-about.png",
] as const;

export async function getP2DesignScreenshots(): Promise<string[]> {
  const screenshotsDir = path.join(process.cwd(), "public", "photos", "portfolio", "p2");
  const isImage = (name: string) => /\.(jpg|jpeg|png|webp|avif)$/i.test(name);
  const joinWebPath = (fileName: string) =>
    `/photos/portfolio/p2/${encodeURIComponent(fileName)}`;

  try {
    const entries = await fs.readdir(screenshotsDir, { withFileTypes: true });
    const images = entries
      .filter((entry) => entry.isFile() && isImage(entry.name))
      .map((entry) => entry.name);
    const ordered = PREFERRED_ORDER.filter((name) => images.includes(name));
    return ordered.map(joinWebPath);
  } catch {
    return [];
  }
}
