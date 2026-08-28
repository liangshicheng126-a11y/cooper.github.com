import { promises as fs } from "node:fs";
import path from "node:path";
import { languageOptions } from "../locales/config";
import {
  buildPersonalWebsiteScreenshotGroups,
  type PersonalWebsiteScreenshotFilesByLanguage,
  type PersonalWebsiteScreenshotGroupsByLanguage,
} from "./p2PersonalWebsiteScreenshotManifest";

export type {
  PersonalWebsiteGroupId,
  PersonalWebsiteScreenshotGroup,
  PersonalWebsiteScreenshotGroupsByLanguage,
} from "./p2PersonalWebsiteScreenshotManifest";

const SCREENSHOTS_DIR = path.join(
  process.cwd(), "public", "photos", "portfolio", "p2", "localized",
);

export async function getP2PersonalWebsiteScreenshotGroupsByLanguage(): Promise<
  PersonalWebsiteScreenshotGroupsByLanguage
> {
  const availableFiles: PersonalWebsiteScreenshotFilesByLanguage = {
    zh: new Set(), en: new Set(), ja: new Set(), ko: new Set(),
  };
  await Promise.all(
    languageOptions.map(async ({ value: language }) => {
      try {
        const entries = await fs.readdir(path.join(SCREENSHOTS_DIR, language), {
          withFileTypes: true,
        });
        availableFiles[language] = new Set(
          entries.filter((entry) => entry.isFile()).map((entry) => entry.name),
        );
      } catch {
        // Keep this locale empty so individual screenshots can use Chinese fallbacks.
      }
    }),
  );

  return buildPersonalWebsiteScreenshotGroups(availableFiles);
}
