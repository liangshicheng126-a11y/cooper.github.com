"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const LanguageToggle = () => {
  const { language, setLanguage, mounted } = useTranslation();
  const pathname = usePathname();
  const [pinged, setPinged] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setPinged(true), 2200);
    return () => clearTimeout(t);
  }, [mounted, pathname]);

  if (!mounted) return null;

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh");
  };

  const isZh = language === "zh";

  return (
    <div className="hidden xl:block fixed top-8 right-8 z-[60]">
      <div className="relative">
        {/* Ping ring — fires once after page load to catch attention */}
        {pinged && (
          <span className="absolute inset-0 rounded-full border border-indigo-400/60 animate-ping-once pointer-events-none" />
        )}

        <motion.button
          onClick={toggleLanguage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          title={isZh ? "Switch to English" : "切换至中文"}
          className="relative flex items-center gap-1.5 px-4 py-2.5 rounded-full glass border border-indigo-400/30 shadow-lg shadow-indigo-500/15 hover:border-indigo-400/60 hover:shadow-indigo-500/25 transition-all duration-300 group"
        >
          {/* Active-language pill indicator */}
          <span className="relative flex h-1.5 w-1.5 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
          </span>

          {/* ZH label */}
          <span
            className={cn(
              "text-[11px] font-bold tracking-widest transition-colors duration-200",
              isZh ? "text-indigo-400" : "text-foreground/35"
            )}
          >
            中
          </span>

          <span className="text-foreground/20 text-[10px] font-light select-none">/</span>

          {/* EN label */}
          <span
            className={cn(
              "text-[11px] font-bold tracking-widest transition-colors duration-200",
              !isZh ? "text-indigo-400" : "text-foreground/35"
            )}
          >
            EN
          </span>
        </motion.button>
      </div>
    </div>
  );
};

export default LanguageToggle;
