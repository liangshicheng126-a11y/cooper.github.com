import { baseTranslations } from "./base";
import { ja } from "./ja";
import { ko } from "./ko";
import { interfaceTranslations } from "./interface";
import { mediaTranslations } from "./media";

export const translations = {
  zh: { ...baseTranslations.zh, ui: interfaceTranslations.zh, media: mediaTranslations.zh },
  en: { ...baseTranslations.en, ui: interfaceTranslations.en, media: mediaTranslations.en },
  ja: { ...ja, ui: interfaceTranslations.ja, media: mediaTranslations.ja },
  ko: { ...ko, ui: interfaceTranslations.ko, media: mediaTranslations.ko },
};

export type { Language } from "./config";
export type TranslationType = typeof translations.en;
