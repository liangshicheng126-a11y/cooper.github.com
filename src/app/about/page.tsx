"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { Zap, ArrowRight, Coffee } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import GsapScrollReveal from "@/components/motion/GsapScrollReveal";
import GsapScrollBatch from "@/components/motion/GsapScrollBatch";
import GsapAboutAvatar from "@/components/motion/GsapAboutAvatar";
import GsapGlassHover from "@/components/motion/GsapGlassHover";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { heroMaskVariants, shouldUseGsap } from "@/lib/motion";

const aboutGlassTile =
  "about-media-tile px-8 py-7 sm:px-12 sm:py-10 rounded-[1.25rem] sm:rounded-3xl min-h-0 h-full border-white/15 bg-white/[0.11] dark:bg-white/[0.07]";

const skillBackgrounds = [
  "/photos/about-modules/brand-system.webp",
  "/photos/about-modules/ui-ux-design.webp",
  "/photos/about-modules/motion-video.webp",
  "/photos/about-modules/photography-story.webp",
  "/photos/about-modules/team-collaboration.webp",
] as const;

const hobbyBackgrounds = [
  "/photos/about-modules/outdoor-exploration.webp",
  "/photos/about-modules/sports-competition.webp",
  "/photos/about-modules/art-expression.webp",
  "/photos/about-modules/go-strategy.webp",
] as const;

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

  const scrollSlideViewport = { once: true, amount: 0.35, margin: "0px 0px -40px 0px" as const };
  const scrollEase = [0.22, 1, 0.36, 1] as const;

  return (
    <div className={cn("flex flex-col flex-1 pb-8 w-full min-w-0", !mounted && "opacity-0")}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-stretch">
            <motion.div variants={item} className="flex flex-col justify-center space-y-8 lg:space-y-12 py-2 lg:py-4 min-h-0">
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

            <GsapAboutAvatar experienceLabel={t.about.experience} className="max-w-xs mx-auto md:max-w-none md:mx-0 w-full" />
          </div>
        </header>

        {/* Philosophy Quote */}
        <GsapScrollReveal as="section" className="mb-16 sm:mb-24 p-6 sm:p-12 rounded-[28px] sm:rounded-[40px] bg-indigo-500/5 border border-indigo-500/10 italic">
          <p className="text-lg sm:text-2xl text-indigo-500/80 leading-relaxed text-center">
            &ldquo;{t.about.philosophy}&rdquo;
          </p>
        </GsapScrollReveal>

        <motion.div
          variants={item}
          className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-x-12 sm:gap-y-14 sm:items-stretch"
        >
          {/* Skills Section */}
          <section className="min-w-0 flex flex-col h-full">
            <motion.h2
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={scrollSlideViewport}
              transition={{ duration: 0.55, ease: scrollEase }}
              className="text-3xl font-bold mb-10 flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0"
            >
              <div className="w-12 h-1 bg-indigo-500 rounded-full" />
              <span>{t.about.skills}</span>
            </motion.h2>

            <GsapScrollBatch
              className="flex-1 flex flex-col justify-between gap-4 sm:gap-5 min-h-0"
              itemSelector="[data-scroll-batch-item]"
              stagger={0.16}
              duration={1.45}
              y={20}
              entrance="flip"
            >
              {t.about.skillDetails.map((skill, index) => (
                <div
                  key={index}
                  data-scroll-batch-item
                  data-batch-index={index}
                  className="w-full"
                >
                  <GsapGlassHover
                    accent="#6366f1"
                    variant="tile"
                    className={cn(
                      "glass relative overflow-hidden group",
                      aboutGlassTile,
                      "flex items-center"
                    )}
                  >
                    <Image
                      src={skillBackgrounds[index]}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      draggable={false}
                      aria-hidden="true"
                      data-gsh-image
                      className="about-media-tile__image"
                    />
                    <div aria-hidden className="about-media-tile__wash" />
                    <div className="relative z-10">
                      <div className="flex gap-3 text-xl font-medium leading-snug w-full">
                        <span
                          aria-hidden
                          className="mt-[0.55em] w-2.5 h-2.5 shrink-0 rounded-full bg-indigo-500 transition-transform duration-300 group-hover:scale-125"
                        />
                        <span className="text-foreground/85 transition-colors group-hover:text-foreground">
                          {skill}
                        </span>
                      </div>
                    </div>
                  </GsapGlassHover>
                </div>
              ))}
            </GsapScrollBatch>
          </section>

          {/* Hobbies Section */}
          <section className="min-w-0 flex flex-col h-full">
            <motion.h2
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={scrollSlideViewport}
              transition={{ duration: 0.55, ease: scrollEase }}
              className="text-3xl font-bold mb-10 flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0"
            >
              <div className="w-12 h-1 bg-purple-500 rounded-full" />
              <span>{t.about.hobbiesTitle}</span>
            </motion.h2>

            <GsapScrollBatch
              className="flex-1 flex flex-col justify-between gap-4 sm:gap-5 min-h-0"
              itemSelector="[data-scroll-batch-item]"
              stagger={0.16}
              duration={1.45}
              y={20}
              entrance="flip"
            >
              {t.about.hobbiesGroups.map((group, index) => (
                <div
                  key={index}
                  data-scroll-batch-item
                  data-batch-index={index}
                  className="w-full"
                >
                  <GsapGlassHover
                    accent="#a855f7"
                    variant="tile"
                    className={cn(
                      "glass relative overflow-hidden group",
                      aboutGlassTile,
                      "flex flex-col justify-center"
                    )}
                  >
                    <Image
                      src={hobbyBackgrounds[index]}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      draggable={false}
                      aria-hidden="true"
                      data-gsh-image
                      className="about-media-tile__image"
                    />
                    <div aria-hidden className="about-media-tile__wash" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 shrink-0 rounded-full bg-purple-500 transition-transform duration-300 group-hover:scale-125" />
                        <h3 className="text-base font-semibold text-foreground/90 transition-colors group-hover:text-foreground">
                          {group.title}
                        </h3>
                      </div>
                      <p className="text-base text-foreground/60 leading-relaxed transition-colors group-hover:text-foreground/75">
                        {group.items.join(" / ")}
                      </p>
                    </div>
                  </GsapGlassHover>
                </div>
              ))}
            </GsapScrollBatch>
          </section>
        </motion.div>

        {/* CTA Section */}
        <motion.section
          variants={item}
          className="mt-20 sm:mt-32 p-8 sm:p-16 rounded-[28px] sm:rounded-[40px] glass border-white/10 flex flex-col items-center text-center bg-gradient-to-br from-indigo-500/5 to-purple-500/5 relative overflow-hidden"
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
