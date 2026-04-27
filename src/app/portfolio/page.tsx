"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import TiltCard from "@/components/TiltCard";

export default function Portfolio() {
  const { t, mounted } = useTranslation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  return (
    <div className={cn("pb-8", !mounted && "opacity-0")}>
      <motion.div variants={container} initial="hidden" animate="show">
        <header className="mb-16">
          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
          >
            {t.portfolio.title}
          </motion.h1>
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
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <TiltCard className="relative w-full h-full">
                {/* Project Image */}
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${project.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                </div>

                {/* Liquid Glass Overlay on Hover */}
                <AnimatePresence>
                  {hoveredId === project.id && (
                    <motion.div
                      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                      animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                      className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end bg-black/10 transition-all"
                    >
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
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
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Default Overlay (visible when not hovered) */}
                <div
                  className={cn(
                    "absolute top-8 right-8 p-3 rounded-full glass border-white/20 text-white transition-opacity duration-300",
                    hoveredId === project.id ? "opacity-0" : "opacity-100"
                  )}
                >
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </TiltCard>
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
