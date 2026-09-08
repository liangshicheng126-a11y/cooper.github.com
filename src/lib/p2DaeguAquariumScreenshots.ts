import { promises as fs } from "node:fs";
import path from "node:path";

export type DaeguAquariumGroupId = "overview" | "interactions" | "responsive";

export type DaeguAquariumScreenshotGroup = {
  groupId: DaeguAquariumGroupId;
  images: string[];
};

const SCREENSHOTS_DIR = path.join(
  process.cwd(),
  "public",
  "photos",
  "portfolio",
  "p2",
  "daegu-aquarium",
);

const GROUP_FILES: Array<{
  groupId: DaeguAquariumGroupId;
  files: readonly string[];
}> = [
  {
    groupId: "overview",
    files: ["home-desktop.webp", "events.webp", "story-system.webp"],
  },
  {
    groupId: "interactions",
    files: [
      "navigation-menu.webp",
      "language-menu.webp",
      "quick-guide.webp",
      "sns-gallery.webp",
    ],
  },
  {
    groupId: "responsive",
    files: ["home-mobile.webp"],
  },
];

const joinWebPath = (fileName: string) =>
  `/photos/portfolio/p2/daegu-aquarium/${encodeURIComponent(fileName)}`;

export async function getP2DaeguAquariumScreenshotGroups(): Promise<
  DaeguAquariumScreenshotGroup[]
> {
  try {
    const entries = await fs.readdir(SCREENSHOTS_DIR, { withFileTypes: true });
    const available = new Set(
      entries.filter((entry) => entry.isFile()).map((entry) => entry.name),
    );

    return GROUP_FILES.map(({ groupId, files }) => ({
      groupId,
      images: files.filter((file) => available.has(file)).map(joinWebPath),
    })).filter((group) => group.images.length > 0);
  } catch {
    return [];
  }
}
