"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useTranslation } from "@/locales/LanguageProvider";
import { ArrowRight, Briefcase, User, Mail, Sparkles, Figma, Palette, Video, PenTool, Layout, Image as ImageIcon, Scissors, Clapperboard, Film } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import BlurText from "@/components/BlurText";
import DepthText from "@/components/ui/DepthText";
import FlowingMenu from "@/components/ui/FlowingMenu";
import CountUp from "@/components/CountUp";
import Magnet from "@/components/Magnet";
import ToolCard from "@/components/ToolCard";
import ProjectCard from "@/components/ProjectCard";
import GsapScrollBatch from "@/components/motion/GsapScrollBatch";
import useMotionTier from "@/hooks/useMotionTier";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { useIntroRevealReady } from "@/components/motion/IntroPlaybackContext";
import { shouldUseGsap } from "@/lib/motion";

gsap.registerPlugin(CustomEase);

const serviceMedia = [
  "/photos/services/brand-design.webp",
  "/photos/services/ui-ux-design.webp",
  "/photos/services/video-production.webp",
];

const servicePortfolioTargets = ["p1", "p2", "p3"] as const;

export default function Home() {
  const tier = useMotionTier();
  const reduced = usePrefersReducedMotion();
  const useGsap = shouldUseGsap(reduced);
  const introRevealReady = useIntroRevealReady();
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const portfolioBtnRef = useRef<HTMLAnchorElement>(null);
  const aboutBtnRef = useRef<HTMLAnchorElement>(null);
  const { t, mounted } = useTranslation();

  useEffect(() => {
    const title = heroTitleRef.current;
    const container = pageContainerRef.current;
    if (!title || !container) return;

    // Font loading, language changes and wrapping all affect the title's height.
    // Anchor the title itself; supporting copy can extend below the viewport.
    const measureTitle = () => {
      container.style.setProperty("--hero-title-block-height", `${title.getBoundingClientRect().height}px`);
    };
    measureTitle();
    const observer = new ResizeObserver(measureTitle);
    observer.observe(title);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    if (!useGsap || tier === "minimal") return;

    const ease = CustomEase.create("heroCtaEase", "0.2,0.9,0.25,1");
    const buttons = [portfolioBtnRef.current, aboutBtnRef.current].filter(
      Boolean
    ) as HTMLAnchorElement[];

    const cleanups: Array<() => void> = [];

    buttons.forEach((btn) => {
      const icon = btn.querySelector("svg");
      const magnetWrapper = btn.closest(".hero-cta-magnet");

      const enter = () => {
        if (magnetWrapper) {
          gsap.to(magnetWrapper, {
            zIndex: 30,
            duration: 0.2,
            overwrite: "auto",
          });
        }
        gsap.to(btn, {
          y: -4,
          scale: tier === "full" ? 1.02 : 1.01,
          zIndex: 20,
          duration: 0.32,
          ease,
          overwrite: "auto",
        });
        if (icon) {
          gsap.to(icon, {
            x: 3,
            duration: 0.28,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      };

      const leave = () => {
        if (magnetWrapper) {
          gsap.to(magnetWrapper, {
            zIndex: 0,
            duration: 0.2,
            overwrite: "auto",
          });
        }
        gsap.to(btn, {
          y: 0,
          scale: 1,
          zIndex: 0,
          duration: 0.28,
          ease: "power2.out",
          overwrite: "auto",
        });
        if (icon) {
          gsap.to(icon, { x: 0, duration: 0.24, ease: "power2.out", overwrite: "auto" });
        }
      };

      btn.addEventListener("mouseenter", enter);
      btn.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        btn.removeEventListener("mouseenter", enter);
        btn.removeEventListener("mouseleave", leave);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
      buttons.forEach((btn) => gsap.killTweensOf(btn));
    };
  }, { dependencies: [useGsap, tier] });

  // Container holds NO opacity — each child handles its own hidden state.
  // This avoids compounded opacity (container 0→1 while children also 0→1).
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.08,
      },
    },
  };

  const heroSoft = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 } },
  };

  return (
    <div
      ref={pageContainerRef}
      className={cn("flex flex-col flex-1 pb-4 sm:pb-6 w-full min-w-0 overflow-x-clip", !mounted && "opacity-0")}
    >
      <motion.div
        variants={container}
        initial={introRevealReady ? (useGsap ? "show" : "hidden") : "hidden"}
        animate={introRevealReady ? "show" : "hidden"}
        className="flex flex-col flex-1"
      >
        {/* Hero Section */}
        <div className="hero-section-responsive relative z-[90] flex flex-col">
        <section className="flex flex-col relative z-[90] overflow-x-clip">
          <div ref={heroTitleRef} className="hero-depth-title">
            <h1 className="hero-title-responsive text-4xl sm:text-6xl lg:text-8xl font-bold tracking-tight max-w-5xl leading-[1.1]">
              <DepthText
                text={t.hero.title}
                layers={28}
                depth={1.55}
                faceColor="#f4f4f5"
                depthColor="#4338ca"
                tilt={6}
                pointerTracking={tier === "full"}
                smoothing={0.12}
                perspective={1120}
                autoOrbit={tier === "full"}
                orbitSpeed={0.12}
                fontSize="clamp(2.75rem, 8.2vw, 6rem)"
                fontWeight={800}
                shadow
                wrap
              />
            </h1>
          </div>

          <div className="hero-support">
          {/* Plain div — same reasoning: heroSoft y/opacity + BlurText opacity would compound */}
          <div className="text-lg sm:text-xl lg:text-2xl text-foreground/60 mb-8 sm:mb-12 max-w-3xl leading-relaxed font-light">
            <BlurText
              text={t.hero.description}
              delay={40}
              direction="bottom"
              animateBy="words"
              stepDuration={0.32}
              className="inline-flex flex-wrap justify-center leading-relaxed"
            />
          </div>

          <motion.div variants={heroSoft} className="hero-actions relative z-[80] overflow-visible flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:space-x-6">
            <Magnet padding={50} magnetStrength={4.5} wrapperClassName="hero-cta-magnet relative z-0">
              <Link
                ref={portfolioBtnRef}
                href="/portfolio"
                className="relative z-0 w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-indigo-700 transition-all"
              >
                <span>{t.nav.portfolio}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Magnet>
            <Magnet padding={50} magnetStrength={4.5} wrapperClassName="hero-cta-magnet relative z-0">
              <Link
                ref={aboutBtnRef}
                href="/about"
                className="relative z-0 w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 glass rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-white/10 transition-all"
              >
                <span>{t.nav.about}</span>
              </Link>
            </Magnet>

          </motion.div>
          </div>
        </section>

        </div>

        <div className="home-scroll-stack relative z-0 mt-4 sm:mt-8">
        {/* Services / Focus Section */}
        <section
          id="services-block"
          className="section-block rounded-[40px] p-6 sm:p-8 lg:p-10"
        >
          <div className="flex items-center space-x-4 mb-6">
            <h2 className="text-2xl font-bold">{t.hero.servicesTitle}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          
          <div className="screening-services">
            {t.hero.services.map((service: any, i: number) => {
              const icons = [Palette, Layout, Video];
              const Icon = icons[i] || Sparkles;
              const projectId = servicePortfolioTargets[i] ?? servicePortfolioTargets[0];
              const project = t.portfolio.projects[projectId];
              
              return (
                <Link
                  key={projectId}
                  href={`/portfolio#portfolio-project-${projectId}`}
                  className="screening-service-card group"
                  aria-label={`${service.title}: ${project.title}`}
                >
                  <span className="screening-service-card__media" aria-hidden="true">
                    <Image
                      src={serviceMedia[i] ?? serviceMedia[0]}
                      alt=""
                      fill
                      sizes="(max-width: 900px) calc(100vw - 3rem), 30vw"
                    />
                  </span>
                  <div className="screening-service-card__icon">
                    <Icon className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                  <p className="text-foreground/50 leading-relaxed text-sm">{service.desc}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="section-block screening-stats-section rounded-[40px] p-6 sm:p-8 lg:p-10">
          <div className="screening-stats">
          {[
            { icon: Briefcase, label: t.contact.projectsCompleted, countTo: 50, suffix: "+" },
            { icon: User, label: t.contact.happyClients, countTo: 30, suffix: "+" },
            { icon: Mail, label: t.contact.activeSupport, countTo: null, value: "24/7" },
          ].map((stat, i) => (
            <article key={i} className="screening-stat group">
              <div className="screening-stat__icon">
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
            </article>
          ))}
          </div>
        </section>

        {/* Tools / Skills Section */}
        <section id="featured-block" className="section-block rounded-[40px] p-6 sm:p-8 lg:p-10">
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
        </section>

        {/* Workflow Section */}
        <section className="section-block rounded-[40px] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-12">
            <h2 className="text-2xl font-bold">{t.hero.workflow.title}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-foreground/40 text-sm sm:text-right">{t.hero.workflow.subtitle}</span>
          </div>
          <FlowingMenu
            speed={19}
            ariaLabel={t.hero.workflow.title}
            items={t.hero.workflow.steps.map((wf: any, i: number) => ({
              number: `0${i + 1}`,
              text: wf.title,
              description: wf.desc,
              image: [
                "/photos/workflow/discovery.webp",
                "/photos/workflow/exploration.webp",
                "/photos/workflow/execution.webp",
                "/photos/workflow/delivery.webp",
              ][i],
            }))}
          />
        </section>

        {/* Featured Work Preview Section */}
        <section className="section-block rounded-[40px] p-6 sm:p-8 lg:p-10">
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
          
          <GsapScrollBatch className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              {
                id: "p1",
                title: t.portfolio.projects.p1.title,
                category: t.portfolio.categories.graphic,
                image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
                accent: "#6366f1",
              },
              {
                id: "p3",
                title: t.portfolio.projects.p3.title,
                category: t.portfolio.categories.photography,
                image: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80",
                accent: "#3b82f6",
              },
            ].map((project, i) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                category={project.category}
                image={project.image}
                viewProject={t.hero.viewAllWork}
                accent={project.accent}
                batchIndex={i}
                variant="preview"
              />
            ))}
          </GsapScrollBatch>
        </section>
        </div>
      </motion.div>
    </div>
  );
}
