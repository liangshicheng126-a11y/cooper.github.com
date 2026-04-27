"use client";

import React from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "@/locales/LanguageProvider";
import { cn } from "@/lib/utils";

const LanguageToggle = () => {
  const { language, setLanguage, mounted } = useTranslation();

  if (!mounted) return null;

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh");
  };

  return (
    <div className="fixed top-4 right-4 sm:top-8 sm:right-8 z-[60]">
      <button
        onClick={toggleLanguage}
        className="glass w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-foreground/70 hover:text-indigo-500 hover:border-indigo-500/30 transition-all duration-300 group hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95"
        title={language === "zh" ? "Switch to English" : "切换至中文"}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <Languages className="w-4 h-4 transition-all duration-500 group-hover:opacity-0 group-hover:scale-0" />
          <span className="absolute opacity-0 scale-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110 uppercase font-mono tracking-tighter">
            {language === "zh" ? "EN" : "ZH"}
          </span>
        </div>
      </button>
    </div>
  );
};

export default LanguageToggle;
