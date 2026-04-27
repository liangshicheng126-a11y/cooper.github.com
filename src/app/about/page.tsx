"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { Github, Twitter, Mail, Award, Rocket, Zap, ArrowRight, Heart, Coffee } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function About() {
  const { t, mounted } = useTranslation();

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

  return (
    <div className={cn("max-w-4xl pb-8", !mounted && "opacity-0")}>
      <motion.div variants={container} initial="hidden" animate="show">
        <header className="mb-20">
          <motion.div variants={item} className="mb-4">
             <h2 className="text-2xl font-medium text-indigo-500">{t.about.name}</h2>
          </motion.div>
          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12 tracking-tight"
          >
            {t.about.title}
          </motion.h1>

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

            <motion.div
              variants={item}
              className="relative aspect-square rounded-[40px] overflow-hidden glass p-4 border-white/10 group"
            >
              <div
                className="w-full h-full rounded-[30px] transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url(/profile.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
              </div>

              {/* Experience Badge */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 glass p-6 sm:p-8 rounded-full shadow-2xl border-indigo-500/20 text-center flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-indigo-500 tabular-nums">5+</span>
                <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-widest">
                  {t.about.experience}
                </span>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Philosophy Quote */}
        <motion.section variants={item} className="mb-24 p-12 rounded-[40px] bg-indigo-500/5 border border-indigo-500/10 italic">
          <p className="text-2xl text-indigo-500/80 leading-relaxed text-center">
            &ldquo;{t.about.philosophy}&rdquo;
          </p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {/* Skills Section */}
          <section>
            <motion.h2
              variants={item}
              className="text-3xl font-bold mb-10 flex items-center space-x-4"
            >
              <div className="w-12 h-1 bg-indigo-500 rounded-full" />
              <span>{t.about.skills}</span>
            </motion.h2>

            <div className="space-y-6">
              {t.about.skillDetails.map((skill, index) => (
                <motion.div 
                  key={index} 
                  variants={item} 
                  className="flex items-center space-x-4 glass p-4 rounded-2xl border-white/5 hover:border-indigo-500/20 transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-lg font-medium">{skill}</span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Hobbies Section */}
          <section>
            <motion.h2
              variants={item}
              className="text-3xl font-bold mb-10 flex items-center space-x-4"
            >
              <div className="w-12 h-1 bg-purple-500 rounded-full" />
              <span>{t.about.hobbiesTitle}</span>
            </motion.h2>

            <div className="glass p-8 rounded-[30px] border-white/5">
              <p className="text-lg text-foreground/60 leading-loose">
                {t.about.hobbiesDesc}
              </p>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <motion.section
          variants={item}
          className="mt-32 p-16 rounded-[40px] glass border-white/10 flex flex-col items-center text-center bg-gradient-to-br from-indigo-500/5 to-purple-500/5"
        >
          <h2 className="text-4xl font-bold mb-8">{t.about.ctaTitle}</h2>
          <Link
            href="/portfolio"
            className="px-10 py-5 bg-foreground text-background rounded-2xl font-bold flex items-center space-x-3 hover:opacity-90 transition-all hover:scale-105"
          >
            <span>{t.about.ctaButton}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.section>
      </motion.div>
    </div>
  );
}
