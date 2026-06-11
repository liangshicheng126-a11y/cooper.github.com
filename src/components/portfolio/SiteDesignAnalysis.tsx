"use client";

import { Target, Palette, Code2, Sparkles } from "lucide-react";
import GsapScrollReveal from "@/components/motion/GsapScrollReveal";
import type { TranslationType } from "@/locales/translations";

type AnalysisDimension = {
  title: string;
  body: string;
  body2?: string;
  points: string[];
};

type P2Analysis = TranslationType["portfolio"]["projectDetail"]["p2Analysis"];

type SiteDesignAnalysisProps = {
  analysis: P2Analysis;
};

const dimensions: Array<{
  key: keyof Omit<P2Analysis, "sectionTitle">;
  icon: typeof Target;
}> = [
  { key: "strategy", icon: Target },
  { key: "visual", icon: Palette },
  { key: "technical", icon: Code2 },
  { key: "emotional", icon: Sparkles },
];

export default function SiteDesignAnalysis({ analysis }: SiteDesignAnalysisProps) {
  return (
    <section className="mb-16 lg:mb-24">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-10 sm:mb-12">
        {analysis.sectionTitle}
      </h2>
      <div className="space-y-8 sm:space-y-10 lg:space-y-12">
        {dimensions.map(({ key, icon: Icon }) => {
          const dim = analysis[key] as AnalysisDimension;
          return (
            <GsapScrollReveal
              key={key}
              className="glass border-white/10 rounded-[28px] sm:rounded-[40px] p-6 sm:p-10"
            >
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-400/25">
                  <Icon className="h-5 w-5 text-indigo-500" aria-hidden />
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{dim.title}</h3>
              </div>
              <div className="space-y-4 text-foreground/75 leading-relaxed">
                <p className="text-base sm:text-lg">{dim.body}</p>
                {dim.body2 && <p className="text-base sm:text-lg">{dim.body2}</p>}
              </div>
              <ul className="mt-6 space-y-2.5">
                {dim.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm sm:text-base text-foreground/65 leading-relaxed"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </GsapScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
