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
import DisplayCards, { type DisplayCardData } from "@/components/ui/display-cards";
import GsapScrollReveal from "@/components/motion/GsapScrollReveal";
import useMotionTier from "@/hooks/useMotionTier";
import { useTranslation } from "@/locales/LanguageProvider";

const scrollSlideViewport = { once: true, amount: 0.35, margin: "0px 0px -40px 0px" as const };
const scrollEase = [0.22, 1, 0.36, 1] as const;

const STACK_STEP_X = 22;
const STACK_STEP_Y = 32;

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

function buildUnifiedCards(
  t: SkillHobbiesCopy,
  skillBadge: string,
  hobbyBadge: string
): DisplayCardData[] {
  const skills: DisplayCardData[] = t.skillDetails.map((skill, index) => {
    const { title, subtitle } = splitSkillLine(skill);
    const Icon = SKILL_ICONS[index] ?? Palette;
    return {
      icon: <Icon className="size-4 text-indigo-100" />,
      title,
      description: subtitle || title,
      date: "Core",
      badge: skillBadge,
      accent: "indigo",
      imageUrl: SKILL_IMAGES[index],
    };
  });

  const hobbies: DisplayCardData[] = t.hobbiesGroups.map((group, index) => {
    const Icon = HOBBY_ICONS[index] ?? Mountain;
    return {
      icon: <Icon className="size-4 text-purple-100" />,
      title: group.title,
      description: group.items.join(" · "),
      date: `${group.items.length} items`,
      badge: hobbyBadge,
      accent: "purple",
      imageUrl: HOBBY_IMAGES[index],
    };
  });

  return [...skills, ...hobbies];
}

function MinimalCardList({ cards }: { cards: DisplayCardData[] }) {
  return (
    <ul className="space-y-3">
      {cards.map((card, index) => (
        <li
          key={`${card.title}-${index}`}
          className="glass rounded-2xl border border-white/15 px-5 py-4"
        >
          <div className="mb-1 flex items-center gap-2">
            {card.badge ? (
              <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                {card.badge}
              </span>
            ) : null}
            <span className="font-semibold text-foreground/90">{card.title}</span>
          </div>
          <p className="text-sm text-foreground/60 leading-relaxed">{card.description}</p>
        </li>
      ))}
    </ul>
  );
}

export default function AboutSkillsHobbiesDisplayCards({
  t,
}: AboutSkillsHobbiesDisplayCardsProps) {
  const tier = useMotionTier();
  const { language } = useTranslation();
  const skillBadge = language === "zh" ? "技能" : "Skill";
  const hobbyBadge = language === "zh" ? "爱好" : "Hobby";
  const unifiedCards = buildUnifiedCards(t, skillBadge, hobbyBadge);
  const mergedTitle = `${t.skills} · ${t.hobbiesTitle}`;

  return (
    <section className="min-w-0 mb-16 sm:mb-20">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={scrollSlideViewport}
        transition={{ duration: 0.55, ease: scrollEase }}
        className="text-3xl font-bold mb-8 sm:mb-10 flex items-center gap-4 shrink-0"
      >
        <div className="flex h-1 w-12 shrink-0 overflow-hidden rounded-full">
          <span className="h-full w-1/2 bg-indigo-500" />
          <span className="h-full w-1/2 bg-purple-500" />
        </div>
        <span>{mergedTitle}</span>
      </motion.h2>

      <GsapScrollReveal className="flex justify-center overflow-hidden pt-2 pb-0">
        {tier === "minimal" ? (
          <div className="w-full max-w-xl">
            <MinimalCardList cards={unifiedCards} />
          </div>
        ) : (
          <DisplayCards
            cards={unifiedCards}
            stackStepX={STACK_STEP_X}
            stackStepY={STACK_STEP_Y}
            className="mx-auto w-full max-w-[22rem] sm:max-w-[24rem] lg:max-w-[26rem]"
          />
        )}
      </GsapScrollReveal>
    </section>
  );
}
