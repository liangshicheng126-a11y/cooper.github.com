"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, Language, TranslationType } from "./translations";
import { DEFAULT_LANGUAGE, getLanguageOption, isLanguage, resolveInitialLanguage } from "./config";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let savedLanguage: string | null = null;
    try {
      savedLanguage = localStorage.getItem("language");
    } catch {
      // Blocked storage must not prevent device-language detection or switching.
    }
    // Read browser preferences only after hydration; automatic choices are not persisted.
    setLanguageState(resolveInitialLanguage(savedLanguage, navigator.languages, navigator.language));
    setMounted(true);

    const syncLanguage = (event: StorageEvent) => {
      if (event.key === "language" && isLanguage(event.newValue)) {
        setLanguageState(event.newValue);
      }
    };
    window.addEventListener("storage", syncLanguage);
    return () => window.removeEventListener("storage", syncLanguage);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (!isLanguage(lang)) return;
    setLanguageState(lang);
    try {
      localStorage.setItem("language", lang);
    } catch {
      // A storage failure must not block the user's language choice.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = getLanguageOption(language).htmlLang;
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, mounted }}>
      <title>{`COOPER. · ${t.ui.siteTitle}`}</title>
      <meta name="description" content={t.hero.subtitle} />
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
