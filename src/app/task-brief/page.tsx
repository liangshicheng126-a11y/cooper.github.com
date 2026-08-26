"use client";

import GsapScrollReveal from "@/components/motion/GsapScrollReveal";
import { useTranslation } from "@/locales/LanguageProvider";
import { cn } from "@/lib/utils";

export default function TaskBriefPage() {
  const { t, mounted } = useTranslation();

  if (!mounted) return null;

  return (
    <div className={cn("task-brief-page flex min-w-0 flex-1 flex-col pb-10 w-full", !mounted && "opacity-0")}>
      <GsapScrollReveal as="div" className="screening-page-intro">
        <header>
          <p className="mb-3 text-sm font-bold tracking-[0.18em] text-indigo-500">{t.taskBrief.eyebrow}</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{t.taskBrief.title}</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-foreground/70 sm:text-xl">{t.taskBrief.subtitle}</p>
        </header>
      </GsapScrollReveal>
    </div>
  );
}
