"use client";

import { Target, Palette, Code2, Sparkles } from "lucide-react";
import DesignAnalysisSection from "@/components/portfolio/DesignAnalysisSection";
import type { TranslationType } from "@/locales/translations";

type P2Analysis = TranslationType["portfolio"]["projectDetail"]["p2Analysis"];

type SiteDesignAnalysisProps = {
  analysis: P2Analysis;
};

const dimensionKeys = ["strategy", "visual", "technical", "emotional"] as const;
const icons = [Target, Palette, Code2, Sparkles] as const;

export default function SiteDesignAnalysis({ analysis }: SiteDesignAnalysisProps) {
  const dimensions = dimensionKeys.map((key, index) => ({
    key,
    icon: icons[index],
    ...analysis[key],
  }));

  return (
    <DesignAnalysisSection sectionTitle={analysis.sectionTitle} dimensions={dimensions} />
  );
}
