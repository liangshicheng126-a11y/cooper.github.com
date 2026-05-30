"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { ArrowRight, Briefcase, User, Mail, Sparkles, Zap, Figma, Palette, Video, PenTool, Layout, Image as ImageIcon, Scissors, Clapperboard, Film } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ScrollDirectionSection from "@/components/ScrollDirectionSection";
import BlurText from "@/components/BlurText";
import CountUp from "@/components/CountUp";
import Magnet from "@/components/Magnet";
import ToolCard from "@/components/ToolCard";
import ProjectCard from "@/components/ProjectCard";
import GsapParallaxLayer from "@/components/motion/GsapParallaxLayer";
import GsapScrollBatch from "@/components/motion/GsapScrollBatch";
import HomeScrollStack from "@/components/motion/HomeScrollStack";
import useMotionTier from "@/hooks/useMotionTier";
import { heroMaskVariants } from "@/lib/motion";

export default function Home() {
  const { t, mounted } = useTranslation();
  const tier = useMotionTier();
  const heroMask = heroMaskVariants(tier);

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

  const heroSoft = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 } },
  };

  return (
    <div
      className={cn("flex flex-col pb-4 sm:pb-6", !mounted && "opacity-0")}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col flex-1"
      >
        {/* Hero Section */}
        <GsapParallaxLayer className="relative z-50 min-h-[36vh] lg:min-h-[44vh] flex flex-col justify-start pt-1 sm:pt-2 pb-20 sm:pb-28">
        <section className="flex flex-col relative z-50">
          <motion.div 
            variants={heroSoft}
            className="mb-8 inline-flex items-center space-x-3 px-4 py-1.5 rounded-full glass border-white/10 text-indigo-500 text-sm font-medium w-fit max-w-full"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="whitespace-normal break-words leading-snug">{t.hero.status}</span>
          </motion.div>

          <motion.div variants={heroMask} className="overflow-hidden mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight max-w-5xl leading-[1.1]">
              <BlurText
                text={t.hero.title}
                delay={80}
                direction="bottom"
                animateBy="words"
                stepDuration={0.4}
                className="inline-flex flex-wrap"
              />
            </h1>
          </motion.div>

          <motion.div
            variants={heroSoft}
            className="text-lg sm:text-xl lg:text-2xl text-foreground/60 mb-8 sm:mb-12 max-w-3xl leading-relaxed font-light"
          >
            <BlurText
              text={t.hero.description}
              delay={40}
              direction="bottom"
              animateBy="words"
              stepDuration={0.32}
              className="inline-flex flex-wrap leading-relaxed"
            />
          </motion.div>

          <motion.div variants={heroSoft} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:space-x-6">
            <Magnet padding={50} magnetStrength={4.5}>
              <Link
                href="/portfolio"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
              >
                <span>{t.nav.portfolio}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Magnet>
            <Magnet padding={50} magnetStrength={4.5}>
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 glass rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-white/10 transition-all"
              >
                <span>{t.nav.about}</span>
              </Link>
            </Magnet>

            <motion.div
              variants={heroSoft}
              className="hidden sm:flex text-foreground/45 text-xs uppercase tracking-[0.24em] font-semibold items-center gap-3 sm:px-2"
            >
              <span>Scroll down</span>
              <motion.span
                aria-hidden
                animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block"
              >
                ↓
              </motion.span>
            </motion.div>
            
            <motion.div 
              variants={item}
              className="w-full sm:w-auto sm:ml-12 flex items-center space-x-4 sm:border-l border-white/10 sm:pl-12 py-2"
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
        </GsapParallaxLayer>

        <HomeScrollStack className="relative z-10 mt-4 sm:mt-8">
        {/* Services / Focus Section */}
        <ScrollDirectionSection
          id="services-block"
          className="section-block rounded-[40px] p-6 sm:p-8 lg:p-10"
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
                <div key={i} className="glass-panel p-8 rounded-[40px] hover:border-indigo-500/25 transition-all group flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                  <p className="text-foreground/50 leading-relaxed text-sm">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </ScrollDirectionSection>

        {/* Stats Section */}
        <ScrollDirectionSection className="section-block rounded-[40px] p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { icon: Briefcase, label: t.contact.projectsCompleted, countTo: 50, suffix: "+" },
            { icon: User, label: t.contact.happyClients, countTo: 30, suffix: "+" },
            { icon: Mail, label: t.contact.activeSupport, countTo: null, value: "24/7" },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-8 rounded-[40px] group hover:border-indigo-500/30 transition-all flex flex-col items-center text-center">
              <div className="p-4 rounded-3xl bg-white/5 mb-6 group-hover:bg-indigo-500/10 transition-colors">
                <stat.icon className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-5xl font-bold mb-3 tabular-nums">
                {stat.countTo !== null ? (
                  <CountUp
                    to={stat.countTo}
                    from={0}
                    duration={1.6}
                    delay={i * 0.15}
                    suffix={stat.suffix}
                  />
                ) : (
                  stat.value
                )}
              </h3>
              <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
            </div>
          ))}
          </div>
        </ScrollDirectionSection>

        {/* Tools / Skills Section */}
        <ScrollDirectionSection id="featured-block" className="section-block rounded-[40px] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
            <h2 className="text-2xl font-bold">{t.hero.tools.title}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-foreground/40 text-sm sm:text-right">{t.hero.tools.subtitle}</span>
          </div>
          <GsapScrollBatch className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" itemSelector="[data-scroll-batch-item]">
            {[
              { name: "Photoshop", icon: ImageIcon, color: "#31A8FF" },
              { name: "Illustrator", icon: PenTool, color: "#FF9A00" },
              { name: "Figma", icon: Figma, color: "#F24E1E" },
              { name: "After Effects", icon: Clapperboard, color: "#9999FF" },
              { name: "CapCut", icon: Scissors, color: "#00C4CC" },
              { name: "Premiere", icon: Film, color: "#9999FF" },
            ].map((tool, i) => (
              <div key={i} data-scroll-batch-item style={{ perspective: "800px" }}>
                <ToolCard index={i} batchReveal {...tool} />
              </div>
            ))}
          </GsapScrollBatch>
        </ScrollDirectionSection>

        {/* Workflow Section */}
        <ScrollDirectionSection className="section-block rounded-[40px] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-12">
            <h2 className="text-2xl font-bold">{t.hero.workflow.title}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-foreground/40 text-sm sm:text-right">{t.hero.workflow.subtitle}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.hero.workflow.steps.map((wf: any, i: number) => (
              <div key={i} className="glass-panel p-8 rounded-[40px] hover:border-indigo-500/20 transition-all relative group">
                <div className="absolute top-6 right-6 text-6xl font-bold text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                  0{i + 1}
                </div>
                <h3 className="text-xl font-bold mb-4">{wf.title}</h3>
                <p className="text-foreground/50 text-sm leading-relaxed">{wf.desc}</p>
              </div>
            ))}
          </div>
        </ScrollDirectionSection>

        {/* Featured Work Preview Section */}
        <ScrollDirectionSection className="section-block rounded-[40px] p-6 sm:p-8 lg:p-10">
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
                image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
              },
              {
                id: "p3",
                title: t.portfolio.projects.p3.title,
                category: t.portfolio.categories.photography,
                image: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80",
              },
            ].map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                category={project.category}
                image={project.image}
                viewProject={t.hero.viewAllWork}
              />
            ))}
          </div>
        </ScrollDirectionSection>
        </HomeScrollStack>
      </motion.div>
    </div>
  );
}
