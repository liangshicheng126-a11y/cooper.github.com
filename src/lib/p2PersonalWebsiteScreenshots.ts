import { promises as fs } from "node:fs";
import path from "node:path";

export type PersonalWebsiteGroupId = "pages" | "components";

export type PersonalWebsiteScreenshotGroup = {
  groupId: PersonalWebsiteGroupId;
  images: string[];
};

const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "photos", "portfolio", "p2");

const GROUP_FILES: Array<{ groupId: PersonalWebsiteGroupId; files: readonly string[] }> = [
  {
    groupId: "pages",
    files: ["home-hero.png", "portfolio-grid.png", "about-page.png", "contact-page.png"],
  },
  {
    groupId: "components",
    files: [
      "home-services.png",
      "p2-detail.png",
      "task-brief-page.png",
      "xiaocoo-page.png",
    ],
  },
];

const joinWebPath = (fileName: string) =>
  `/photos/portfolio/p2/${encodeURIComponent(fileName)}`;

export async function getP2PersonalWebsiteScreenshotGroups(): Promise<
  PersonalWebsiteScreenshotGroup[]
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
