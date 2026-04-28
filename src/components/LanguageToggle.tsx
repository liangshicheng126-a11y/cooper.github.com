"use client";

import React from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "@/locales/LanguageProvider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const LanguageToggle = () => {
  const { language, setLanguage, mounted } = useTranslation();
  const pathname = usePathname();
  const [showToggle, setShowToggle] = React.useState(true);

  React.useEffect(() => {
    const root = document.querySelector("main");
    const title = root?.querySelector("h1");
    if (!title) {
      setShowToggle(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowToggle(entry.isIntersecting);
      },
      {
        threshold: 0.08,
        rootMargin: "-10% 0px 0px 0px",
      }
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, [pathname]);

  if (!mounted) return null;

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh");
  };

  return (
    <div
      className={cn(
        "hidden xl:block fixed top-8 right-8 z-[60] transition-all duration-300",
        showToggle ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
      )}
    >
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
