"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/locales/LanguageProvider";
import GsapScrollReveal from "@/components/motion/GsapScrollReveal";
import XiaocooChat from "@/components/xiaocoo/XiaocooChat";

export default function XiaocooPage() {
  const { t, mounted } = useTranslation();

  if (!mounted) return null;

  return (
    <div className={cn("flex flex-col flex-1 pb-8 w-full min-w-0", !mounted && "opacity-0")}>
      <GsapScrollReveal as="div" className="mb-8 sm:mb-10">
        <header>
          <p className="mb-3 hidden text-sm font-medium tracking-wide text-indigo-500 xl:block">COOPER.</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            {t.xiaocoo.title}
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-foreground/80 sm:text-xl">
            {t.xiaocoo.subtitle}
          </p>
        </header>
      </GsapScrollReveal>

      <XiaocooChat />
    </div>
  );
}
