"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { ArrowLeft, Calendar, User, Layout, Target, Lightbulb, CheckCircle } from "lucide-react";
import Link from "next/link";

type Props = {
  id: string;
};

export default function ProjectDetailClient({ id }: Props) {
  const { t, mounted } = useTranslation();

  if (!mounted) return null;

  const projectKey = id as keyof typeof t.portfolio.projects;
  const project = t.portfolio.projects[projectKey];

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <Link href="/portfolio" className="text-indigo-500 hover:underline">
          {t.portfolio.projectDetail.back}
        </Link>
      </div>
    );
  }

  const images: Record<string, string> = {
    p1: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80",
    p2: "https://images.unsplash.com/photo-1581291518137-473305565547?w=1200&q=80",
    p3: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=1200&q=80",
    p4: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200&q=80",
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl pb-24">
      <motion.div variants={item} className="mb-12">
        <Link
          href="/portfolio"
          className="inline-flex items-center space-x-2 text-foreground/60 hover:text-indigo-500 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">{t.portfolio.projectDetail.back}</span>
        </Link>
      </motion.div>

      <header className="mb-16">
        <motion.h1 variants={item} className="text-6xl font-bold mb-6 tracking-tight">
          {project.title}
        </motion.h1>
        <motion.p variants={item} className="text-2xl text-foreground/60 max-w-3xl leading-relaxed">
          {project.desc}
        </motion.p>
      </header>

      <motion.div variants={item} className="aspect-[21/9] rounded-[40px] overflow-hidden glass border-white/10 mb-16">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${images[id] || images.p1})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-3 gap-8 mb-24">
        <div className="glass p-8 rounded-3xl border-white/5">
          <User className="w-6 h-6 text-indigo-500 mb-4" />
          <h4 className="text-xs uppercase font-bold text-foreground/40 tracking-widest mb-2">{t.portfolio.projectDetail.role}</h4>
          <p className="text-lg font-bold">{project.role}</p>
        </div>
        <div className="glass p-8 rounded-3xl border-white/5">
          <Calendar className="w-6 h-6 text-indigo-500 mb-4" />
          <h4 className="text-xs uppercase font-bold text-foreground/40 tracking-widest mb-2">{t.portfolio.projectDetail.date}</h4>
          <p className="text-lg font-bold">{project.date}</p>
        </div>
        <div className="glass p-8 rounded-3xl border-white/5">
          <Layout className="w-6 h-6 text-indigo-500 mb-4" />
          <h4 className="text-xs uppercase font-bold text-foreground/40 tracking-widest mb-2">Category</h4>
          <p className="text-lg font-bold">
            {id === "p1"
              ? t.portfolio.categories.graphic
              : id === "p2"
                ? t.portfolio.categories.uiux
                : id === "p3"
                  ? t.portfolio.categories.photography
                  : t.portfolio.categories.video}
          </p>
        </div>
      </motion.div>

      <div className="space-y-24">
        <motion.section variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
              <Target className="w-6 h-6 text-indigo-500" />
              <span>{t.portfolio.projectDetail.challenge}</span>
            </h2>
            <p className="text-lg text-foreground/60 leading-relaxed">
              在本项目中，我们面临的主要挑战是如何在保持品牌传统基因的同时，通过现代的设计语言吸引更年轻的受众。这不仅需要视觉上的革新，更需要对用户交互心理的深度洞察。
            </p>
          </div>
          <div className="glass rounded-[30px] p-2 border-white/10 aspect-video overflow-hidden">
            <div className="w-full h-full rounded-[20px] bg-indigo-500/5 flex items-center justify-center italic text-foreground/40 text-sm">
              Project Image 2
            </div>
          </div>
        </motion.section>

        <motion.section variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-16 flex-row-reverse">
          <div className="md:order-2">
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
              <Lightbulb className="w-6 h-6 text-indigo-500" />
              <span>{t.portfolio.projectDetail.solution}</span>
            </h2>
            <p className="text-lg text-foreground/60 leading-relaxed">
              我们提出了一套基于“液态玻璃”美学的交互方案，利用动态模糊和半透明层级感，营造出深邃且直观的视觉深度。这种方案成功地平衡了艺术性与易用性。
            </p>
          </div>
          <div className="glass rounded-[30px] p-2 border-white/10 aspect-video overflow-hidden md:order-1">
            <div className="w-full h-full rounded-[20px] bg-purple-500/5 flex items-center justify-center italic text-foreground/40 text-sm">
              Project Image 3
            </div>
          </div>
        </motion.section>

        <motion.section variants={item} className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 flex items-center justify-center space-x-3">
            <CheckCircle className="w-6 h-6 text-indigo-500" />
            <span>{t.portfolio.projectDetail.results}</span>
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 transition-all hover:bg-indigo-500/10">
              <span className="text-4xl font-bold text-indigo-500 mb-2 block">+45%</span>
              <span className="text-sm text-foreground/40 font-medium">User Engagement</span>
            </div>
            <div className="p-8 rounded-3xl bg-purple-500/5 border border-purple-500/10 transition-all hover:bg-purple-500/10">
              <span className="text-4xl font-bold text-purple-500 mb-2 block">100k+</span>
              <span className="text-sm text-foreground/40 font-medium">Active Users</span>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
