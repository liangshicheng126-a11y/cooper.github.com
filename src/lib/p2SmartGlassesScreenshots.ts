import { promises as fs } from "node:fs";
import path from "node:path";

export type SmartGlassesGroupId = "core" | "calendar" | "files" | "data";

export type SmartGlassesScreenshotGroup = {
  groupId: SmartGlassesGroupId;
  images: string[];
};

const SCREENSHOTS_DIR = path.join(
  process.cwd(),
  "public",
  "photos",
  "portfolio",
  "p2",
  "smart-glasses",
);

const GROUP_FILES: Array<{ groupId: SmartGlassesGroupId; files: readonly string[] }> = [
  {
    groupId: "core",
    files: ["home-dashboard.png", "glasses-detail.png", "profile.png", "personal-info.png"],
  },
  {
    groupId: "calendar",
    files: ["calendar-day.png", "calendar-week.png", "calendar-year.png"],
  },
  {
    groupId: "files",
    files: [
      "files-teleprompter.png",
      "files-detail.png",
      "files-map.png",
      "files-translate.png",
      "files-video.png",
    ],
  },
  {
    groupId: "data",
    files: ["data-month.png", "data-year.png", "data-detail.png"],
  },
];

const joinWebPath = (fileName: string) =>
  `/photos/portfolio/p2/smart-glasses/${encodeURIComponent(fileName)}`;

export async function getP2SmartGlassesScreenshotGroups(): Promise<SmartGlassesScreenshotGroup[]> {
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
