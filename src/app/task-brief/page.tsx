"use client";

import TaskBriefWizard from "@/components/task-brief/TaskBriefWizard";
import GsapScrollReveal from "@/components/motion/GsapScrollReveal";
import { useTranslation } from "@/locales/LanguageProvider";
import { cn } from "@/lib/utils";

export default function TaskBriefPage() {
  const { language, setLanguage, t, mounted } = useTranslation();

  if (!mounted) return null;

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col pb-10 w-full", !mounted && "opacity-0")}>
      <GsapScrollReveal as="div" className="mb-8 sm:mb-10">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold tracking-[0.18em] text-indigo-500">{t.taskBrief.eyebrow}</p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{t.taskBrief.title}</h1>
            <p className="max-w-3xl text-lg leading-relaxed text-foreground/70 sm:text-xl">{t.taskBrief.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
            aria-label={language === "zh" ? "Switch to English" : "切换至中文"}
            className="hidden h-10 w-fit shrink-0 items-center rounded-xl border border-indigo-300/40 bg-white/45 px-4 text-xs font-bold tracking-[0.12em] text-indigo-500 backdrop-blur-xl transition hover:border-indigo-400 hover:bg-indigo-500 hover:text-white dark:bg-white/5 xl:inline-flex"
          >
            {language === "zh" ? "EN" : "中文"}
          </button>
        </header>
      </GsapScrollReveal>
      <TaskBriefWizard />
    </div>
  );
}
