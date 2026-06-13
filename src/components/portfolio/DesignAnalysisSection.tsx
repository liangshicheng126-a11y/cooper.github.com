"use client";

import type { LucideIcon } from "lucide-react";
import HomeScrollStack from "@/components/motion/HomeScrollStack";
import ScrollDirectionSection from "@/components/ScrollDirectionSection";

export type AnalysisDimension = {
  title: string;
  body: string;
  body2?: string;
  points: string[];
};

type DimensionConfig = AnalysisDimension & {
  key: string;
  icon: LucideIcon;
};

type Props = {
  sectionTitle: string;
  dimensions: DimensionConfig[];
};

export default function DesignAnalysisSection({ sectionTitle, dimensions }: Props) {
  return (
    <section className="mb-16 lg:mb-24">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-10 sm:mb-12">
        {sectionTitle}
      </h2>
      <HomeScrollStack className="relative z-0">
        {dimensions.map(({ key, icon: Icon, title, body, body2, points }) => (
          <ScrollDirectionSection
            key={key}
            className="glass border-white/10 rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 section-block"
          >
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-400/25">
                <Icon className="h-5 w-5 text-indigo-500" aria-hidden />
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h3>
            </div>
            <div className="space-y-4 text-foreground/75 leading-relaxed">
              <p className="text-base sm:text-lg">{body}</p>
              {body2 && <p className="text-base sm:text-lg">{body2}</p>}
            </div>
            <ul className="mt-6 space-y-2.5">
              {points.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-sm sm:text-base text-foreground/65 leading-relaxed"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400"
                    aria-hidden
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </ScrollDirectionSection>
        ))}
      </HomeScrollStack>
    </section>
  );
}
