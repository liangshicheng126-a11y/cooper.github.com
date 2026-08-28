import { languageOptions, type Language } from "../locales/config";

export const PERSONAL_WEBSITE_SCREENSHOT_GROUPS = [
  {
    groupId: "pages",
    files: ["home-hero.webp", "portfolio-grid.webp", "about-page.webp", "contact-page.webp"],
  },
  {
    groupId: "components",
    files: ["home-services.webp", "p2-detail.webp", "language-menu.webp", "xiaocoo-page.webp"],
  },
] as const;

export type PersonalWebsiteGroupId =
  (typeof PERSONAL_WEBSITE_SCREENSHOT_GROUPS)[number]["groupId"];

export type PersonalWebsiteScreenshotGroup = {
  groupId: PersonalWebsiteGroupId;
  images: string[];
};

export type PersonalWebsiteScreenshotGroupsByLanguage = Record<
  Language,
  PersonalWebsiteScreenshotGroup[]
>;

export type PersonalWebsiteScreenshotFilesByLanguage = Record<Language, ReadonlySet<string>>;

export function personalWebsiteScreenshotPath(language: Language, fileName: string) {
  return `/photos/portfolio/p2/localized/${language}/${encodeURIComponent(fileName)}`;
}

/** Resolve only a missing screenshot to its Chinese counterpart, never to the legacy gallery. */
export function buildPersonalWebsiteScreenshotGroups(
  availableFiles: PersonalWebsiteScreenshotFilesByLanguage,
): PersonalWebsiteScreenshotGroupsByLanguage {
  return Object.fromEntries(
    languageOptions.map(({ value: language }) => [
      language,
      PERSONAL_WEBSITE_SCREENSHOT_GROUPS.map(({ groupId, files }) => ({
        groupId,
        images: files.flatMap((fileName) => {
          const sourceLanguage = availableFiles[language].has(fileName)
            ? language
            : availableFiles.zh.has(fileName)
              ? "zh"
              : null;
          return sourceLanguage ? [personalWebsiteScreenshotPath(sourceLanguage, fileName)] : [];
        }),
      })).filter((group) => group.images.length > 0),
    ]),
  ) as PersonalWebsiteScreenshotGroupsByLanguage;
}
