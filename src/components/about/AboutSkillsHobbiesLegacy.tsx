"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import GsapScrollBatch from "@/components/motion/GsapScrollBatch";
import GsapGlassHover from "@/components/motion/GsapGlassHover";

const aboutGlassTile =
  "px-8 py-7 sm:px-12 sm:py-10 rounded-[1.25rem] sm:rounded-3xl min-h-[6.5rem] sm:min-h-[7.5rem] border-white/15 bg-white/[0.11] dark:bg-white/[0.07]";

const scrollSlideViewport = { once: true, amount: 0.35, margin: "0px 0px -40px 0px" as const };
const scrollEase = [0.22, 1, 0.36, 1] as const;

type SkillHobbiesCopy = {
  skills: string;
  skillDetails: string[];
  hobbiesTitle: string;
  hobbiesGroups: { title: string; items: string[] }[];
};

interface AboutSkillsHobbiesLegacyProps {
  t: SkillHobbiesCopy;
}

export default function AboutSkillsHobbiesLegacy({ t }: AboutSkillsHobbiesLegacyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-x-12 sm:gap-y-14 sm:items-stretch"
    >
      <section className="min-w-0 flex flex-col h-full">
        <motion.h2
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={scrollSlideViewport}
          transition={{ duration: 0.55, ease: scrollEase }}
          className="text-3xl font-bold mb-10 flex items-center space-x-4 shrink-0"
        >
          <div className="w-12 h-1 bg-indigo-500 rounded-full" />
          <span>{t.skills}</span>
        </motion.h2>

        <GsapScrollBatch
          className="flex-1 flex flex-col justify-between gap-4 sm:gap-5 min-h-0"
          itemSelector="[data-scroll-batch-item]"
          stagger={0.16}
          duration={1.45}
          y={20}
          entrance="flip"
        >
          {t.skillDetails.map((skill, index) => (
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

      <section className="min-w-0 flex flex-col h-full">
        <motion.h2
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={scrollSlideViewport}
          transition={{ duration: 0.55, ease: scrollEase }}
          className="text-3xl font-bold mb-10 flex items-center space-x-4 shrink-0"
        >
          <div className="w-12 h-1 bg-purple-500 rounded-full" />
          <span>{t.hobbiesTitle}</span>
        </motion.h2>

        <GsapScrollBatch
          className="flex-1 flex flex-col justify-between gap-4 sm:gap-5 min-h-0"
          itemSelector="[data-scroll-batch-item]"
          stagger={0.16}
          duration={1.45}
          y={20}
          entrance="flip"
        >
          {t.hobbiesGroups.map((group, index) => (
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
  );
}
