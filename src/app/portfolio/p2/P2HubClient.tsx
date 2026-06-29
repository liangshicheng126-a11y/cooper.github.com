"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Layout, User } from "lucide-react";
import { useTranslation } from "@/locales/LanguageProvider";
import useMotionTier from "@/hooks/useMotionTier";
import { heroMaskVariants } from "@/lib/motion";
import P2SubProjectPicker from "@/components/portfolio/P2SubProjectPicker";

export default function P2HubClient() {
  const { t, mounted } = useTranslation();
  const tier = useMotionTier();
  const project = t.portfolio.projects.p2;
  const sub = t.portfolio.projectDetail.p2Subprojects;

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const heroMask = heroMaskVariants(tier);

  const subProjects = [
    {
      slug: "personal-website",
      title: sub.personalWebsite.title,
      desc: sub.personalWebsite.desc,
      category: sub.personalWebsite.category,
      image: "/photos/portfolio/p2/covers/personal-website.png",
      accent: "#6366f1",
      viewLabel: sub.viewDetail,
    },
    {
      slug: "smart-glasses",
      title: sub.smartGlasses.title,
      desc: sub.smartGlasses.desc,
      category: sub.smartGlasses.category,
      image: "/photos/portfolio/p2/covers/smart-glasses.png",
      accent: "#a855f7",
      viewLabel: sub.viewDetail,
    },
  ];

  if (!mounted) {
    return (
      <div className="pb-8 animate-pulse w-full">
        <div className="mb-8 h-6 w-32 rounded-lg bg-white/10" />
        <div className="mb-6 h-12 w-2/3 max-w-md rounded-xl bg-white/10" />
        <div className="mb-12 h-48 rounded-3xl bg-white/5 sm:h-64" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-8 w-full min-w-0">
      <div className="mb-8 sm:mb-12">
        <Link
          href="/portfolio"
          className="inline-flex items-center space-x-2 text-foreground/60 hover:text-indigo-500 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">{t.portfolio.projectDetail.back}</span>
        </Link>
      </div>

      <header className="mb-10 sm:mb-16">
        <motion.div variants={heroMask} className="overflow-hidden mb-6">
          <motion.h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            {project.title}
          </motion.h1>
        </motion.div>
        <motion.p
          variants={item}
          className="text-lg sm:text-xl lg:text-2xl text-foreground/60 max-w-3xl leading-relaxed"
        >
          {project.desc}
        </motion.p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-24">
        <div className="glass p-6 sm:p-8 rounded-3xl border-white/5">
          <User className="w-6 h-6 text-indigo-500 mb-4" />
          <h4 className="text-xs uppercase font-bold text-foreground/40 tracking-widest mb-2">
            {t.portfolio.projectDetail.role}
          </h4>
          <p className="text-lg font-bold">{project.role}</p>
        </div>
        <div className="glass p-6 sm:p-8 rounded-3xl border-white/5">
          <Calendar className="w-6 h-6 text-indigo-500 mb-4" />
          <h4 className="text-xs uppercase font-bold text-foreground/40 tracking-widest mb-2">
            {t.portfolio.projectDetail.date}
          </h4>
          <p className="text-lg font-bold">{project.date}</p>
        </div>
        <div className="glass p-6 sm:p-8 rounded-3xl border-white/5">
          <Layout className="w-6 h-6 text-indigo-500 mb-4" />
          <h4 className="text-xs uppercase font-bold text-foreground/40 tracking-widest mb-2">
            {t.portfolio.projectDetail.category}
          </h4>
          <p className="text-lg font-bold">{t.portfolio.categories.uiux}</p>
        </div>
      </div>

      <P2SubProjectPicker sectionTitle={sub.sectionTitle} projects={subProjects} />
    </div>
  );
}
