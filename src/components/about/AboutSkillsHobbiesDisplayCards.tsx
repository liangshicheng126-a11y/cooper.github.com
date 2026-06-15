"use client";

import { motion } from "framer-motion";
import {
  Palette,
  Layout,
  Clapperboard,
  Camera,
  Users,
  Mountain,
  Dumbbell,
  Music2,
  Grid3x3,
} from "lucide-react";
import DisplayCards, {
  buildStackedCards,
  type DisplayCardProps,
} from "@/components/ui/display-cards";
import GsapScrollReveal from "@/components/motion/GsapScrollReveal";

const scrollSlideViewport = { once: true, amount: 0.35, margin: "0px 0px -40px 0px" as const };
const scrollEase = [0.22, 1, 0.36, 1] as const;

const SKILL_IMAGES = [
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=480&q=80",
  "https://images.unsplash.com/photo-1586717791821-3f44a73138c6?w=480&q=80",
  "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=480&q=80",
  "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=480&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=480&q=80",
] as const;

const HOBBY_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=480&q=80",
  "https://images.unsplash.com/photo-1519861537503-ede843a06485?w=480&q=80",
  "https://images.unsplash.com/photo-1520523839897-bd46b1a049ad?w=480&q=80",
  "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=480&q=80",
] as const;

const SKILL_ICONS = [Palette, Layout, Clapperboard, Camera, Users] as const;
const HOBBY_ICONS = [Mountain, Dumbbell, Music2, Grid3x3] as const;

type SkillHobbiesCopy = {
  skills: string;
  skillDetails: string[];
  hobbiesTitle: string;
  hobbiesGroups: { title: string; items: string[] }[];
};

interface AboutSkillsHobbiesDisplayCardsProps {
  t: SkillHobbiesCopy;
}

function splitSkillLine(skill: string): { title: string; subtitle: string } {
  const match = skill.match(/^(.+?)\s*[\(（](.+?)[\)）]$/);
  if (match) {
    return { title: match[1].trim(), subtitle: match[2].trim() };
  }
  return { title: skill, subtitle: "" };
}

function buildSkillCards(skillDetails: string[]): DisplayCardProps[] {
  const items = skillDetails.map((skill, index) => {
    const { title, subtitle } = splitSkillLine(skill);
    const Icon = SKILL_ICONS[index] ?? Palette;
    return {
      icon: <Icon className="size-4 text-indigo-100" />,
      title,
      description: subtitle || title,
      date: "Core",
      titleClassName: "text-indigo-700",
      imageUrl: SKILL_IMAGES[index],
    };
  });
  return buildStackedCards(items);
}

function buildHobbyCards(
  hobbiesGroups: { title: string; items: string[] }[]
): DisplayCardProps[] {
  const items = hobbiesGroups.map((group, index) => {
    const Icon = HOBBY_ICONS[index] ?? Mountain;
    return {
      icon: <Icon className="size-4 text-purple-100" />,
      title: group.title,
      description: group.items.join(" · "),
      date: `${group.items.length} items`,
      iconClassName: "text-purple-500",
      titleClassName: "text-purple-700",
      imageUrl: HOBBY_IMAGES[index],
    };
  });
  return buildStackedCards(items);
}

export default function AboutSkillsHobbiesDisplayCards({
  t,
}: AboutSkillsHobbiesDisplayCardsProps) {
  const skillCards = buildSkillCards(t.skillDetails);
  const hobbyCards = buildHobbyCards(t.hobbiesGroups);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-x-10 sm:gap-y-16">
      <section className="min-w-0 flex flex-col">
        <motion.h2
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={scrollSlideViewport}
          transition={{ duration: 0.55, ease: scrollEase }}
          className="text-3xl font-bold mb-8 sm:mb-10 flex items-center space-x-4 shrink-0"
        >
          <div className="w-12 h-1 bg-indigo-500 rounded-full" />
          <span>{t.skills}</span>
        </motion.h2>

        <GsapScrollReveal className="flex justify-center sm:justify-start min-h-[22rem] sm:min-h-[26rem] lg:min-h-[28rem] py-4 overflow-x-auto overflow-y-visible">
          <DisplayCards cards={skillCards} className="min-w-[17rem] sm:min-w-[20rem]" />
        </GsapScrollReveal>
      </section>

      <section className="min-w-0 flex flex-col">
        <motion.h2
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={scrollSlideViewport}
          transition={{ duration: 0.55, ease: scrollEase }}
          className="text-3xl font-bold mb-8 sm:mb-10 flex items-center space-x-4 shrink-0"
        >
          <div className="w-12 h-1 bg-purple-500 rounded-full" />
          <span>{t.hobbiesTitle}</span>
        </motion.h2>

        <GsapScrollReveal className="flex justify-center sm:justify-start min-h-[20rem] sm:min-h-[24rem] lg:min-h-[26rem] py-4 overflow-x-auto overflow-y-visible">
          <DisplayCards cards={hobbyCards} className="min-w-[17rem] sm:min-w-[20rem]" />
        </GsapScrollReveal>
      </section>
    </div>
  );
}
