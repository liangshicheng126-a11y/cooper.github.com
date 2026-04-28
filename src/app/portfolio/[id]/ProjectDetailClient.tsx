"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { ArrowLeft, Calendar, User, Layout, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Props = {
  id: string;
  photographyGroups?: Array<{
    year: string;
    location: string;
    photos: string[];
  }>;
};

export default function ProjectDetailClient({ id, photographyGroups = [] }: Props) {
  const { t, mounted } = useTranslation();
  const [photoOrientation, setPhotoOrientation] = useState<Record<string, "landscape" | "portrait" | "square">>({});

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

  const bilibiliByProject: Partial<Record<string, { bvid: string; href: string }[]>> = {
    p4: [
      {
        bvid: "BV1Ws9rB9ErL",
        href: "https://www.bilibili.com/video/BV1Ws9rB9ErL/",
      },
      {
        bvid: "BV1ys9rBREj8",
        href: "https://www.bilibili.com/video/BV1ys9rBREj8/",
      },
      {
        bvid: "BV1Ct9rBXEAs",
        href: "https://www.bilibili.com/video/BV1Ct9rBXEAs/",
      },
    ],
  };
  const hasBilibiliPreview = Boolean(bilibiliByProject[id]?.length);
  const hasPhotographyGallery = id === "p3" && photographyGroups.length > 0;
  const photographyByYear = photographyGroups.reduce<Record<string, typeof photographyGroups>>((acc, group) => {
    if (!acc[group.year]) acc[group.year] = [];
    acc[group.year].push(group);
    return acc;
  }, {});
  const years = Object.keys(photographyByYear);
  const getOrientation = (photo: string) => photoOrientation[photo] ?? "square";
  const getPhotoCardClass = (orientation: "landscape" | "portrait" | "square") => {
    if (orientation === "landscape") {
      return "w-[86vw] sm:w-[56vw] lg:w-[42vw] max-w-[640px] aspect-[16/10]";
    }
    if (orientation === "portrait") {
      return "w-[58vw] sm:w-[34vw] lg:w-[24vw] max-w-[360px] aspect-[3/4]";
    }
    return "w-[68vw] sm:w-[42vw] lg:w-[30vw] max-w-[460px] aspect-[1/1]";
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
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl pb-8">
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
        <motion.div variants={heroMask} className="overflow-hidden mb-6">
          <motion.h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            {project.title}
          </motion.h1>
        </motion.div>
        {id !== "p4" && (
          <motion.p variants={item} className="text-lg sm:text-xl lg:text-2xl text-foreground/60 max-w-3xl leading-relaxed">
            {project.desc}
          </motion.p>
        )}
      </header>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-24">
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
          <h4 className="text-xs uppercase font-bold text-foreground/40 tracking-widest mb-2">{t.portfolio.projectDetail.category}</h4>
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

      {!hasBilibiliPreview && (
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
      )}

      {hasPhotographyGallery && (
        <motion.section variants={item} className="mb-16 lg:mb-24">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-2xl font-bold">{t.portfolio.projectDetail.photoGallery}</h2>
            <span className="text-sm text-foreground/50">
              {t.portfolio.projectDetail.photoCount}{" "}
              {photographyGroups.reduce((sum, group) => sum + group.photos.length, 0)}
            </span>
          </div>
          <div className="space-y-10">
            {years.map((year, yearIndex) => (
              <div key={year} className="space-y-6">
                {yearIndex > 0 && (
                  <div className="year-divider glass border-white/10 rounded-xl">
                    <div className="year-divider-track">
                      <span>{year}</span>
                      <span>{t.portfolio.projectDetail.yearDividerDot}</span>
                      <span>{year}</span>
                      <span>{t.portfolio.projectDetail.yearDividerDot}</span>
                      <span>{year}</span>
                      <span>{t.portfolio.projectDetail.yearDividerDot}</span>
                      <span>{year}</span>
                    </div>
                  </div>
                )}

                {photographyByYear[year].map((group) => (
                  <div key={`${year}-${group.location}`} className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-foreground/85">
                        {year} · {group.location}
                      </h3>
                      <span className="text-xs uppercase tracking-widest text-foreground/45">
                        {group.photos.length} {t.portfolio.projectDetail.photosUnit}
                      </span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar">
                      {group.photos.map((photo, index) => (
                        <div
                          key={photo}
                          className={`group shrink-0 rounded-2xl overflow-hidden glass border-white/10 snap-start ${getPhotoCardClass(getOrientation(photo))}`}
                        >
                          <div className="relative w-full h-full">
                            <img
                              src={photo}
                              alt={`${t.portfolio.projectDetail.photoAlt} ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                              onLoad={(event) => {
                                const target = event.currentTarget;
                                const { naturalWidth, naturalHeight } = target;
                                const next =
                                  naturalWidth > naturalHeight
                                    ? "landscape"
                                    : naturalWidth < naturalHeight
                                      ? "portrait"
                                      : "square";
                                setPhotoOrientation((prev) => (prev[photo] === next ? prev : { ...prev, [photo]: next }));
                              }}
                            />
                            <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-black/35 text-white/90 border border-white/20">
                              {getOrientation(photo) === "landscape"
                                ? t.portfolio.projectDetail.landscapeTag
                                : getOrientation(photo) === "portrait"
                                  ? t.portfolio.projectDetail.portraitTag
                                  : t.portfolio.projectDetail.squareTag}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {hasBilibiliPreview && (
        <motion.section variants={item} className="mb-16 lg:mb-24">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-2xl font-bold">{t.portfolio.projectDetail.videoPreview}</h2>
          </div>
          <div className="space-y-6">
            {bilibiliByProject[id]!.map((video, index) => (
              <div key={video.bvid} className="space-y-3">
                <a
                  href={video.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  <span>{t.portfolio.projectDetail.watchOnBilibili} {index + 1}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <div className="glass rounded-[30px] p-2 border-white/10 aspect-video overflow-hidden">
                  <iframe
                    src={`https://player.bilibili.com/player.html?bvid=${video.bvid}&page=1&high_quality=1`}
                    className="w-full h-full rounded-[20px]"
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen
                    title={`Bilibili Video Player ${index + 1}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <div className="space-y-16 lg:space-y-24">
        <motion.section variants={item} className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 flex items-center justify-center space-x-3">
            <CheckCircle className="w-6 h-6 text-indigo-500" />
            <span>{t.portfolio.projectDetail.results}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 transition-all hover:bg-indigo-500/10">
              <span className="text-4xl font-bold text-indigo-500 mb-2 block">4w+</span>
              <span className="text-sm text-foreground/40 font-medium">{t.portfolio.projectDetail.userEngagement}</span>
            </div>
            <div className="p-8 rounded-3xl bg-purple-500/5 border border-purple-500/10 transition-all hover:bg-purple-500/10">
              <span className="text-4xl font-bold text-purple-500 mb-2 block">50%+</span>
              <span className="text-sm text-foreground/40 font-medium">{t.portfolio.projectDetail.activeUsers}</span>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
