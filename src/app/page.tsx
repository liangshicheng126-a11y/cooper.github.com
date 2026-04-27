"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { ArrowRight, Briefcase, User, Mail, Sparkles, Zap, Figma, Palette, Video, PenTool, Layout, ExternalLink, Image as ImageIcon, Scissors, Clapperboard, Film } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  const { t, mounted } = useTranslation();

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
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div
      className={cn("flex flex-col pb-8", !mounted && "opacity-0")}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col flex-1"
      >
        {/* Hero Section */}
        <section className="min-h-[70vh] flex flex-col justify-start pt-2 pb-6">
          <motion.div 
            variants={item}
            className="mb-8 inline-flex items-center space-x-3 px-4 py-1.5 rounded-full glass border-white/10 text-indigo-500 text-sm font-medium w-fit max-w-full"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="whitespace-normal break-words leading-snug">{t.hero.status}</span>
          </motion.div>

          <motion.h1 
            variants={item}
            className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-6 sm:mb-8 max-w-5xl leading-[1.1]"
          >
            {t.hero.title}
          </motion.h1>

          <motion.p 
            variants={item}
            className="text-lg sm:text-xl lg:text-2xl text-foreground/60 mb-8 sm:mb-12 max-w-3xl leading-relaxed font-light"
          >
            {t.hero.description}
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 sm:space-x-6">
            <Link
              href="/portfolio"
              className="px-8 sm:px-10 py-4 sm:py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-indigo-700 transition-all hover:scale-105 shadow-xl shadow-indigo-500/20"
            >
              <span>{t.nav.portfolio}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="px-8 sm:px-10 py-4 sm:py-5 glass rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-white/10 transition-all"
            >
              <span>{t.nav.about}</span>
            </Link>
            
            <motion.div 
              variants={item}
              className="sm:ml-12 flex items-center space-x-4 sm:border-l border-white/10 sm:pl-12 py-2"
            >
              <div className="p-3 rounded-xl bg-indigo-500/10">
                <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-1">{t.hero.recentWork}</p>
                <p className="text-sm font-medium text-foreground/80">{t.hero.latestProject}</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Services / Focus Section */}
        <motion.section 
          id="services-block"
          variants={item}
          className="mb-8 section-block rounded-[40px] p-6 sm:p-8 lg:p-10"
        >
          <div className="flex items-center space-x-4 mb-6">
            <h2 className="text-2xl font-bold">{t.hero.servicesTitle}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {t.hero.services.map((service: any, i: number) => {
              const icons = [Palette, Layout, Video];
              const Icon = icons[i] || Sparkles;
              
              return (
                <div key={i} className="glass p-8 rounded-[40px] border-white/5 hover:border-indigo-500/20 transition-all group flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                  <p className="text-foreground/50 leading-relaxed text-sm">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          variants={item}
          className="mb-8 section-block rounded-[40px] p-6 sm:p-8 lg:p-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { icon: Briefcase, label: t.contact.projectsCompleted, value: "50+" },
            { icon: User, label: t.contact.happyClients, value: "30+" },
            { icon: Mail, label: t.contact.activeSupport, value: "24/7" },
          ].map((stat, i) => (
            <div key={i} className="glass p-8 rounded-[40px] border-white/5 group hover:border-indigo-500/30 transition-all flex flex-col items-center text-center">
              <div className="p-4 rounded-3xl bg-white/5 mb-6 group-hover:bg-indigo-500/10 transition-colors">
                <stat.icon className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-5xl font-bold mb-3 tabular-nums">{stat.value}</h3>
              <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
            </div>
          ))}
          </div>
        </motion.section>

        {/* Tools / Skills Section */}
        <motion.section id="featured-block" variants={item} className="mb-8 section-block rounded-[40px] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
            <h2 className="text-2xl font-bold">{t.hero.tools.title}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-foreground/40 text-sm sm:text-right">{t.hero.tools.subtitle}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Photoshop", icon: ImageIcon, color: "#31A8FF" },
              { name: "Illustrator", icon: PenTool, color: "#FF9A00" },
              { name: "Figma", icon: Figma, color: "#F24E1E" },
              { name: "After Effects", icon: Clapperboard, color: "#9999FF" },
              { name: "CapCut", icon: Scissors, color: "#00C4CC" },
              { name: "Premiere", icon: Film, color: "#9999FF" },
            ].map((tool, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.05 }}
                className="glass p-6 rounded-3xl border-white/5 hover:border-white/20 transition-all flex flex-col items-center text-center group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: `${tool.color}20`, boxShadow: `0 0 20px ${tool.color}40` }}
                >
                  <tool.icon className="w-7 h-7" style={{ color: tool.color }} />
                </div>
                <p className="text-sm font-medium text-foreground/70">{tool.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Workflow Section */}
        <motion.section variants={item} className="mb-8 section-block rounded-[40px] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-12">
            <h2 className="text-2xl font-bold">{t.hero.workflow.title}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-foreground/40 text-sm sm:text-right">{t.hero.workflow.subtitle}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.hero.workflow.steps.map((wf: any, i: number) => (
              <div key={i} className="glass p-8 rounded-[40px] border-white/5 hover:border-indigo-500/20 transition-all relative group">
                <div className="absolute top-6 right-6 text-6xl font-bold text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                  0{i + 1}
                </div>
                <h3 className="text-xl font-bold mb-4">{wf.title}</h3>
                <p className="text-foreground/50 text-sm leading-relaxed">{wf.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Featured Work Preview Section */}
        <motion.section variants={item} className="mb-8 section-block rounded-[40px] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <div className="flex items-center space-x-4 min-w-0">
              <h2 className="text-2xl font-bold">{t.hero.featuredTitle}</h2>
              <div className="w-24 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <Link 
              href="/portfolio" 
              className="text-sm font-medium text-indigo-500 hover:text-indigo-400 flex items-center space-x-2 group"
            >
              <span>{t.hero.viewAllWork}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { 
                id: "p1", 
                title: t.portfolio.projects.p1.title, 
                category: t.portfolio.categories.graphic,
                image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80"
              },
              { 
                id: "p2", 
                title: t.portfolio.projects.p2.title, 
                category: t.portfolio.categories.uiux,
                image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&q=80"
              }
            ].map((project, i) => (
              <Link
                key={i}
                href={`/portfolio/${project.id}`}
                className="group relative h-[240px] sm:h-[300px] rounded-[40px] overflow-hidden glass border-white/5"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${project.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">{project.category}</span>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">{project.title}</h3>
                </div>
                <div className="absolute top-6 right-6 p-3 rounded-full glass border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
