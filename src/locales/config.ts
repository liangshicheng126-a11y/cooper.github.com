export const languageOptions = [
  { value: "zh", label: "中文", shortLabel: "中", htmlLang: "zh-CN", locale: "zh-CN" },
  { value: "en", label: "English", shortLabel: "EN", htmlLang: "en", locale: "en-US" },
  { value: "ja", label: "日本語", shortLabel: "日", htmlLang: "ja", locale: "ja-JP" },
  { value: "ko", label: "한국어", shortLabel: "한", htmlLang: "ko", locale: "ko-KR" },
] as const;

export type Language = (typeof languageOptions)[number]["value"];

export const DEFAULT_LANGUAGE: Language = "en";

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && languageOptions.some((option) => option.value === value);
}

export function parseLanguageTag(value: unknown): Language | undefined {
  if (typeof value !== "string") return undefined;
  const match = value.trim().match(/^([a-z]{2})(?:[-_][a-z0-9]+)*$/i);
  const primaryLanguage = match?.[1].toLowerCase();
  // All Chinese regions/scripts use the site's existing Simplified Chinese copy.
  return isLanguage(primaryLanguage) ? primaryLanguage : undefined;
}

export function resolveInitialLanguage(
  savedLanguage: unknown,
  preferredLanguages: readonly unknown[] = [],
  deviceLanguage?: unknown,
): Language {
  if (isLanguage(savedLanguage)) return savedLanguage;

  for (const preferredLanguage of preferredLanguages) {
    const supportedLanguage = parseLanguageTag(preferredLanguage);
    if (supportedLanguage) return supportedLanguage;
  }

  return parseLanguageTag(deviceLanguage) ?? DEFAULT_LANGUAGE;
}

export function getLanguageOption(language: Language) {
  return languageOptions.find((option) => option.value === language) ?? languageOptions[0];
}
