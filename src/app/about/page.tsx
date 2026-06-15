"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { Zap, ArrowRight, Coffee } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import GsapScrollReveal from "@/components/motion/GsapScrollReveal";
import GsapAboutAvatar from "@/components/motion/GsapAboutAvatar";
import AboutSkillsHobbiesDisplayCards from "@/components/about/AboutSkillsHobbiesDisplayCards";
import AboutSkillsHobbiesLegacy from "@/components/about/AboutSkillsHobbiesLegacy";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { heroMaskVariants, shouldUseGsap } from "@/lib/motion";

const useAboutDisplayCards =
  process.env.NEXT_PUBLIC_ABOUT_DISPLAY_CARDS !== "false";

export default function About() {
  const { t, mounted } = useTranslation();
  const tier = useMotionTier();
  const reduced = usePrefersReducedMotion();
  const useGsap = shouldUseGsap(reduced);

  if (!mounted) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const heroMask = heroMaskVariants(tier);

  const skillsHobbiesCopy = {
    skills: t.about.skills,
    skillDetails: t.about.skillDetails,
    hobbiesTitle: t.about.hobbiesTitle,
    hobbiesGroups: t.about.hobbiesGroups,
  };

  return (
    <div className={cn("max-w-4xl pb-8", !mounted && "opacity-0")}>
      <motion.div variants={container} initial={useGsap ? "show" : "hidden"} animate="show">
        <header className="mb-14 sm:mb-20">
          <motion.div variants={item} className="mb-4">
             <h2 className="text-2xl font-medium text-indigo-500">{t.about.name}</h2>
          </motion.div>
          <motion.div variants={heroMask} className="overflow-hidden mb-8 sm:mb-12">
            <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              {t.about.title}
            </motion.h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div variants={item} className="flex flex-col justify-center space-y-8 lg:space-y-12 py-2 lg:py-4">
              <div>
                <h3 className="text-xs uppercase font-bold text-foreground/40 tracking-widest mb-4 flex items-center space-x-2">
                  <Zap className="w-3 h-3 text-indigo-500" />
                  <span>{t.about.workTitle}</span>
                </h3>
                <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed font-medium">
                  {t.about.workDesc}
                </p>
              </div>
              
              <div>
                <h3 className="text-xs uppercase font-bold text-foreground/40 tracking-widest mb-4 flex items-center space-x-2">
                  <Coffee className="w-3 h-3 text-indigo-500" />
                  <span>{t.about.spareTitle}</span>
                </h3>
                <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed font-medium">
                  {t.about.spareDesc}
                </p>
              </div>
            </motion.div>

            <GsapAboutAvatar experienceLabel={t.about.experience} />
          </div>
        </header>

        {/* Philosophy Quote */}
        <GsapScrollReveal as="section" className="mb-16 sm:mb-24 p-6 sm:p-12 rounded-[28px] sm:rounded-[40px] bg-indigo-500/5 border border-indigo-500/10 italic">
          <p className="text-lg sm:text-2xl text-indigo-500/80 leading-relaxed text-center">
            &ldquo;{t.about.philosophy}&rdquo;
          </p>
        </GsapScrollReveal>

        {useAboutDisplayCards ? (
          <AboutSkillsHobbiesDisplayCards t={skillsHobbiesCopy} />
        ) : (
          <AboutSkillsHobbiesLegacy t={skillsHobbiesCopy} />
        )}

        {/* CTA Section */}
        <motion.section
          variants={item}
          className="mt-0 p-8 sm:p-16 rounded-[28px] sm:rounded-[40px] glass border-white/10 flex flex-col items-center text-center bg-gradient-to-br from-indigo-500/5 to-purple-500/5 relative overflow-hidden"
        >
          <h2 className="relative z-10 text-2xl sm:text-4xl font-bold mb-6 sm:mb-8">{t.about.ctaTitle}</h2>
          <Link
            href="/contact"
            className="relative z-10 px-10 py-5 bg-foreground text-background rounded-2xl font-bold flex items-center space-x-3 hover:opacity-90 transition-all hover:scale-105"
          >
            <span>{t.about.ctaButton}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.section>
      </motion.div>
    </div>
  );
}
