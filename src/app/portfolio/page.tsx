"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Portfolio() {
  const { t, mounted } = useTranslation();

  if (!mounted) return null;

  const projects = [
    { 
      id: "p1", 
      title: t.portfolio.projects.p1.title, 
      category: t.portfolio.categories.graphic, 
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80", 
      color: "#6366f1" 
    },
    { 
      id: "p2", 
      title: t.portfolio.projects.p2.title, 
      category: t.portfolio.categories.uiux, 
      image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=1200&q=80", 
      color: "#a855f7" 
    },
    { 
      id: "p3", 
      title: t.portfolio.projects.p3.title, 
      category: t.portfolio.categories.photography, 
      image: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=1200&q=80", 
      color: "#3b82f6" 
    },
    { 
      id: "p4", 
      title: t.portfolio.projects.p4.title, 
      category: t.portfolio.categories.video, 
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=80", 
      color: "#2dd4bf" 
    },
  ];

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
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  const heroMask = {
    hidden: { opacity: 0, y: 30, clipPath: "inset(0 0 100% 0)" },
    show: {
      opacity: 1,
      y: 0,
      clipPath: "inset(0 0 0% 0)",
      transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className={cn("pb-8", !mounted && "opacity-0")}>
      <motion.div variants={container} initial="hidden" animate="show">
        <header className="mb-16">
          <motion.div variants={heroMask} className="overflow-hidden mb-6">
            <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              {t.portfolio.title}
            </motion.h1>
          </motion.div>
          <motion.p
            variants={item}
            className="text-xl text-foreground/60 max-w-2xl"
          >
            {t.portfolio.description}
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.id}`}
              className="group relative h-[320px] sm:h-[380px] lg:h-[450px] rounded-3xl overflow-hidden glass border-white/10 cursor-pointer"
            >
              {/* Project Image */}
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${project.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors" />
              </div>

              {/* Lightweight Hover Overlay */}
              <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-white/60 text-sm font-medium mb-2 block">
                    {project.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                    {project.title}
                  </h3>
                  <div className="inline-flex items-center space-x-3 text-white font-semibold group/btn">
                    <span>{t.portfolio.viewProject}</span>
                    <div className="p-3 rounded-full bg-white/20 group-hover/btn:bg-white group-hover/btn:text-black transition-all">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Overlay (visible when not hovered) */}
              <div className="absolute top-8 right-8 p-3 rounded-full glass border-white/20 text-white transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <motion.section
          variants={item}
          className="mt-16 sm:mt-24 p-8 sm:p-12 lg:p-16 rounded-[40px] glass border-white/10 flex flex-col items-center text-center"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">{t.portfolio.ctaTitle}</h2>
          <Link
            href="/about"
            className="px-10 py-5 bg-indigo-500 text-white rounded-2xl font-bold flex items-center space-x-3 hover:bg-indigo-600 transition-all hover:scale-105 shadow-xl shadow-indigo-500/20"
          >
            <span>{t.portfolio.ctaButton}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.section>
      </motion.div>
    </div>
  );
}
