"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Cpu, Layout, Lightbulb, Monitor, Target, Zap } from "lucide-react";
import { useTranslation } from "@/locales/LanguageProvider";
import useMotionTier from "@/hooks/useMotionTier";
import { heroMaskVariants } from "@/lib/motion";
import GroupedDesignGallerySection from "@/components/portfolio/GroupedDesignGallerySection";
import DesignAnalysisSection from "@/components/portfolio/DesignAnalysisSection";
import DesignChallengesSection from "@/components/portfolio/DesignChallengesSection";
import SiteDesignAnalysis from "@/components/portfolio/SiteDesignAnalysis";
import type { PersonalWebsiteScreenshotGroup } from "@/lib/p2PersonalWebsiteScreenshots";
import type { SmartGlassesScreenshotGroup } from "@/lib/p2SmartGlassesScreenshots";
import type { P2SubId } from "@/lib/p2Subprojects";

type Props = {
  subId: P2SubId;
  personalWebsiteGroups?: PersonalWebsiteScreenshotGroup[];
  smartGlassesGroups?: SmartGlassesScreenshotGroup[];
};

export default function P2SubClient({
  subId,
  personalWebsiteGroups = [],
  smartGlassesGroups = [],
}: Props) {
  const { t, mounted } = useTranslation();
  const tier = useMotionTier();
  const sub = t.portfolio.projectDetail.p2Subprojects;
  const heroMask = heroMaskVariants(tier);

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const detail =
    subId === "personal-website" ? sub.personalWebsite : sub.smartGlasses;

  const galleryLabels = {
    title: t.portfolio.projectDetail.designGallery,
    countLabel: t.portfolio.projectDetail.designCount,
    altPrefix: t.portfolio.projectDetail.designAlt,
    lightboxBack: t.portfolio.projectDetail.lightboxBack,
    lightboxClose: t.portfolio.projectDetail.lightboxClose,
  };

  const personalWebsiteGalleryGroups =
    subId === "personal-website"
      ? personalWebsiteGroups
          .map((group) => {
            const copy = t.portfolio.projectDetail.p2PersonalWebsiteGroups[group.groupId];
            return {
              groupId: group.groupId,
              title: copy.title,
              caption: copy.caption,
              images: group.images,
            };
          })
          .filter((group) => group.images.length > 0)
      : [];

  const smartGlassesGalleryGroups =
    subId === "smart-glasses"
      ? smartGlassesGroups
          .map((group) => {
            const copy =
              t.portfolio.projectDetail.p2SmartGlassesGroups[group.groupId];
            return {
              groupId: group.groupId,
              title: copy.title,
              caption: copy.caption,
              images: group.images,
            };
          })
          .filter((group) => group.images.length > 0)
      : [];

  const smartGlassesChallenges =
    subId === "smart-glasses"
      ? ([
          { key: "hardware", icon: Cpu },
          { key: "software", icon: Monitor },
          { key: "solution", icon: Lightbulb },
        ] as const).map(({ key, icon }) => ({
          key,
          icon,
          ...t.portfolio.projectDetail.p2SmartGlassesChallenges[key],
        }))
      : [];

  const smartGlassesAnalysisDimensions =
    subId === "smart-glasses"
      ? ([
          { key: "layout", icon: Layout },
          { key: "motion", icon: Zap },
          { key: "content", icon: Target },
        ] as const).map(({ key, icon }) => ({
          key,
          icon,
          ...t.portfolio.projectDetail.p2SmartGlassesAnalysis[key],
        }))
      : [];

  if (!mounted) {
    return (
      <div className="max-w-5xl pb-8 animate-pulse">
        <div className="mb-8 h-6 w-40 rounded-lg bg-white/10" />
        <div className="mb-6 h-10 w-2/3 max-w-md rounded-xl bg-white/10" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl pb-8">
      <div className="mb-8 sm:mb-12">
        <Link
          href="/portfolio/p2"
          className="inline-flex items-center space-x-2 text-foreground/60 hover:text-indigo-500 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">{sub.backToP2}</span>
        </Link>
      </div>

      <header className="mb-10 sm:mb-16">
        <motion.p
          variants={item}
          className="text-sm font-semibold uppercase tracking-widest text-indigo-500/80 mb-3"
        >
          {t.portfolio.projects.p2.title}
        </motion.p>
        <motion.div variants={heroMask} className="overflow-hidden mb-6">
          <motion.h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            {detail.title}
          </motion.h1>
        </motion.div>
        <motion.p
          variants={item}
          className="text-lg sm:text-xl text-foreground/60 max-w-3xl leading-relaxed"
        >
          {detail.desc}
        </motion.p>
      </header>

      {subId === "personal-website" ? (
        <>
          <GroupedDesignGallerySection
            groups={personalWebsiteGalleryGroups}
            labels={{
              sectionTitle: galleryLabels.title,
              countLabel: galleryLabels.countLabel,
              altPrefix: galleryLabels.altPrefix,
              lightboxBack: galleryLabels.lightboxBack,
              lightboxClose: galleryLabels.lightboxClose,
            }}
          />
          <SiteDesignAnalysis analysis={t.portfolio.projectDetail.p2Analysis} />
        </>
      ) : (
        <>
          <GroupedDesignGallerySection
            groups={smartGlassesGalleryGroups}
            labels={{
              sectionTitle: galleryLabels.title,
              countLabel: galleryLabels.countLabel,
              altPrefix: galleryLabels.altPrefix,
              lightboxBack: galleryLabels.lightboxBack,
              lightboxClose: galleryLabels.lightboxClose,
            }}
          />
          <DesignChallengesSection
            sectionTitle={t.portfolio.projectDetail.p2SmartGlassesChallenges.sectionTitle}
            challenges={smartGlassesChallenges}
          />
          <DesignAnalysisSection
            sectionTitle={t.portfolio.projectDetail.p2SmartGlassesAnalysis.sectionTitle}
            dimensions={smartGlassesAnalysisDimensions}
          />
        </>
      )}
    </div>
  );
}
