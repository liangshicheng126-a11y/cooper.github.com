"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { Zap, ArrowRight, Coffee } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import GlassHoverCard from "@/components/GlassHoverCard";
import GsapScrollReveal from "@/components/motion/GsapScrollReveal";
import useMotionTier from "@/hooks/useMotionTier";
import { heroMaskVariants } from "@/lib/motion";

export default function About() {
  const { t, mounted } = useTranslation();
  const tier = useMotionTier();

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
  const smoothViewport = { once: true, amount: 0.2, margin: "0px 0px -24px 0px" as const };
  const listContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };
  const skillListItem = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.36, ease: scrollEase },
    },
  };

  return (
    <div className={cn("max-w-4xl pb-8", !mounted && "opacity-0")}>
      <motion.div variants={container} initial="hidden" animate="show">
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

            <div className="relative aspect-square rounded-[40px] overflow-hidden glass p-4 border-white/10 group">
              <div
                className="w-full h-full rounded-[30px] transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url(/experience-badge.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
              </div>

              {/* Experience Badge */}
              <div
                className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-2xl border border-white/30 overflow-hidden text-center flex flex-col items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.95), rgba(79,70,229,0.9) 45%, rgba(67,56,202,0.95))",
                }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <span className="relative z-10 text-3xl font-bold text-white tabular-nums">5+</span>
                <span className="relative z-10 text-[10px] uppercase font-bold text-white/90 tracking-widest">
                  {t.about.experience}
                </span>
              </div>
            </div>
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
              className="text-3xl font-bold mb-10 flex items-center space-x-4 shrink-0"
            >
              <div className="w-12 h-1 bg-indigo-500 rounded-full" />
              <span>{t.about.skills}</span>
            </motion.h2>

            <motion.div
              variants={listContainer}
              initial="hidden"
              whileInView="show"
              viewport={smoothViewport}
              className="flex-1 flex flex-col justify-between gap-5 sm:gap-6 min-h-0"
            >
              {t.about.skillDetails.map((skill, index) => (
                <GlassHoverCard
                  key={index}
                  accent="#6366f1"
                  variants={skillListItem}
                  className="px-7 py-6 sm:px-10 sm:py-8 rounded-2xl flex-1 flex items-center min-h-[5.25rem] sm:min-h-[6rem]"
                >
                  <div className="flex gap-3 text-xl font-medium leading-snug w-full">
                    <span
                      aria-hidden
                      className="mt-[0.55em] w-2.5 h-2.5 shrink-0 rounded-full bg-indigo-500 transition-transform duration-300 group-hover:scale-125"
                    />
                    <span className="text-foreground/85 transition-colors group-hover:text-foreground">
                      {skill}
                    </span>
                  </div>
                </GlassHoverCard>
              ))}
            </motion.div>
          </section>

          {/* Hobbies Section */}
          <section className="min-w-0 flex flex-col h-full">
            <motion.h2
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={scrollSlideViewport}
              transition={{ duration: 0.55, ease: scrollEase }}
              className="text-3xl font-bold mb-10 flex items-center space-x-4 shrink-0"
            >
              <div className="w-12 h-1 bg-purple-500 rounded-full" />
              <span>{t.about.hobbiesTitle}</span>
            </motion.h2>

            <motion.div
              variants={listContainer}
              initial="hidden"
              whileInView="show"
              viewport={smoothViewport}
              className="flex-1 flex flex-col justify-between gap-5 sm:gap-6 min-h-0"
            >
              {t.about.hobbiesGroups.map((group, index) => (
                <GlassHoverCard
                  key={index}
                  accent="#a855f7"
                  variants={skillListItem}
                  className="px-7 py-6 sm:px-10 sm:py-8 rounded-2xl flex-1 flex flex-col justify-center min-h-[5.25rem] sm:min-h-[6rem]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 shrink-0 rounded-full bg-purple-500 transition-transform duration-300 group-hover:scale-125" />
                    <h3 className="text-base font-semibold text-foreground/90 transition-colors group-hover:text-foreground">
                      {group.title}
                    </h3>
                  </div>
                  <p className="text-base text-foreground/60 leading-relaxed transition-colors group-hover:text-foreground/75">
                    {group.items.join(" / ")}
                  </p>
                </GlassHoverCard>
              ))}
            </motion.div>
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
