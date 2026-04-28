"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { ArrowLeft, Calendar, User, Layout, CheckCircle, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  id: string;
  photographyGroups?: Array<{
    year: string;
    dateLabel: string;
    location: string;
    photos: string[];
  }>;
  posterGroups?: Array<{
    label: string;
    posters: string[];
  }>;
};

export default function ProjectDetailClient({ id, photographyGroups = [], posterGroups = [] }: Props) {
  const { t, mounted } = useTranslation();
  const [photoOrientation, setPhotoOrientation] = useState<Record<string, "landscape" | "portrait" | "square">>({});
  const [lightboxPhotos, setLightboxPhotos] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const posterViewportRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const posterDragState = useRef<Record<string, { active: boolean; startX: number; startScrollLeft: number; moved: boolean }>>({});

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
  const hasPosterGallery = id === "p1" && posterGroups.length > 0;
  const photographyByYear = photographyGroups.reduce<Record<string, typeof photographyGroups>>((acc, group) => {
    if (!acc[group.year]) acc[group.year] = [];
    acc[group.year].push(group);
    return acc;
  }, {});
  const years = Object.keys(photographyByYear).sort((a, b) => {
    const aYear = /^\d{4}$/.test(a) ? Number(a) : -1;
    const bYear = /^\d{4}$/.test(b) ? Number(b) : -1;
    return bYear - aYear;
  });
  const getOrientation = (photo: string) => photoOrientation[photo] ?? "square";
  const getPhotoCardClass = (orientation: "landscape" | "portrait" | "square") => {
    if (orientation === "landscape") {
      return "col-span-12 sm:col-span-8 lg:col-span-6 aspect-[16/10]";
    }
    if (orientation === "portrait") {
      return "col-span-6 sm:col-span-4 lg:col-span-3 aspect-[3/4]";
    }
    return "col-span-6 sm:col-span-4 lg:col-span-4 aspect-square";
  };
  const openLightbox = (photos: string[], index: number) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const resultsSection = (
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
  );

  useEffect(() => {
    if (id !== "p3") return;
    const active = Boolean(lightboxPhotos);
    document.body.classList.toggle("lightbox-open", active);
    return () => {
      document.body.classList.remove("lightbox-open");
    };
  }, [lightboxPhotos, id]);

  useEffect(() => {
    if (!hasPosterGallery) return;
    let raf = 0;
    const speed = 0.6;

    const tick = () => {
      for (const group of posterGroups) {
        const viewport = posterViewportRefs.current[group.label];
        const drag = posterDragState.current[group.label];
        if (!viewport || drag?.active) continue;
        const loopPoint = viewport.scrollWidth / 2;
        if (loopPoint <= 0) continue;
        viewport.scrollLeft += speed;
        if (viewport.scrollLeft >= loopPoint) {
          viewport.scrollLeft -= loopPoint;
        }
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [hasPosterGallery, posterGroups]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
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
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t.portfolio.projectDetail.photoGallery}</h2>
            <span className="text-base sm:text-lg text-foreground/55 font-medium">
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
                      {Array.from({ length: 36 }).map((_, i) => (
                        <span key={`${year}-${i}`} className="inline-flex items-center gap-4">
                          <span>{year}</span>
                          <span>{t.portfolio.projectDetail.yearDividerDot}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {photographyByYear[year].map((group) => (
                  <div key={`${year}-${group.dateLabel}-${group.location}`} className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <h3 className="leading-none">
                        <span className="inline-flex flex-wrap items-center gap-2 sm:gap-3 bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                          <span className="text-4xl sm:text-5xl font-extrabold tracking-[0.08em]">{year}</span>
                          <span className="text-xl sm:text-2xl font-bold opacity-80">·</span>
                          <span className="text-lg sm:text-2xl font-bold tracking-[0.14em] uppercase">{group.dateLabel}</span>
                          <span className="text-xl sm:text-2xl font-bold opacity-80">·</span>
                          <span className="text-lg sm:text-2xl font-black tracking-[0.16em] uppercase">{group.location}</span>
                        </span>
                      </h3>
                      <span className="text-xs sm:text-base uppercase tracking-widest text-foreground/55 font-semibold self-end sm:self-auto">
                        {group.photos.length} {t.portfolio.projectDetail.photosUnit}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                      {group.photos.map((photo, index) => (
                        <div
                          key={photo}
                          className={`group rounded-2xl overflow-hidden glass border-white/10 ${getPhotoCardClass(getOrientation(photo))}`}
                        >
                          <button
                            type="button"
                            className="relative w-full h-full text-left"
                            onClick={() => openLightbox(group.photos, index)}
                          >
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
                          </button>
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

      {hasPosterGallery && (
        <motion.section variants={item} className="mb-16 lg:mb-24">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t.portfolio.projectDetail.posterGallery}</h2>
            <span className="text-base sm:text-lg text-foreground/55 font-medium">
              {t.portfolio.projectDetail.posterCount}{" "}
              {posterGroups.reduce((sum, group) => sum + group.posters.length, 0)}
            </span>
          </div>
          <div className="space-y-10">
            {posterGroups.map((group) => (
              <div key={group.label} className="space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-foreground/80">{group.label}</h3>
                <div className="relative">
                  <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-background to-transparent" />
                  <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-background to-transparent" />
                  <div
                    ref={(node) => {
                      posterViewportRefs.current[group.label] = node;
                    }}
                    className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
                    onPointerDown={(event) => {
                      const viewport = posterViewportRefs.current[group.label];
                      if (!viewport) return;
                      posterDragState.current[group.label] = {
                        active: true,
                        startX: event.clientX,
                        startScrollLeft: viewport.scrollLeft,
                        moved: false,
                      };
                      viewport.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      const viewport = posterViewportRefs.current[group.label];
                      const drag = posterDragState.current[group.label];
                      if (!viewport || !drag?.active) return;
                      const deltaX = event.clientX - drag.startX;
                      if (Math.abs(deltaX) > 6) drag.moved = true;
                      const loopPoint = viewport.scrollWidth / 2;
                      if (loopPoint <= 0) return;
                      viewport.scrollLeft = drag.startScrollLeft - deltaX;
                      if (viewport.scrollLeft < 0) viewport.scrollLeft += loopPoint;
                      if (viewport.scrollLeft >= loopPoint) viewport.scrollLeft -= loopPoint;
                    }}
                    onPointerUp={(event) => {
                      const viewport = posterViewportRefs.current[group.label];
                      const drag = posterDragState.current[group.label];
                      if (!viewport || !drag) return;
                      drag.active = false;
                      viewport.releasePointerCapture(event.pointerId);
                    }}
                    onPointerCancel={() => {
                      const drag = posterDragState.current[group.label];
                      if (drag) drag.active = false;
                    }}
                  >
                    <div className="flex w-max gap-4 sm:gap-5 pr-4">
                      {[...group.posters, ...group.posters].map((poster, loopIndex) => (
                        <div
                          key={`${poster}-${loopIndex}`}
                          className="group shrink-0 rounded-2xl overflow-hidden glass border-white/10"
                        >
                          <button
                            type="button"
                            className="relative w-[240px] sm:w-[280px] lg:w-[320px] text-left"
                            onClick={() => {
                              const drag = posterDragState.current[group.label];
                              if (drag?.moved) {
                                drag.moved = false;
                                return;
                              }
                              openLightbox(group.posters, loopIndex % group.posters.length);
                            }}
                          >
                            <img
                              src={poster}
                              alt={`${t.portfolio.projectDetail.posterAlt} ${(loopIndex % group.posters.length) + 1}`}
                              className={`w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] ${
                                getOrientation(poster) === "portrait"
                                  ? "h-[360px] sm:h-[420px] lg:h-[480px]"
                                  : getOrientation(poster) === "landscape"
                                    ? "h-[210px] sm:h-[240px] lg:h-[270px]"
                                    : "h-[260px] sm:h-[300px] lg:h-[340px]"
                              }`}
                              loading="lazy"
                              draggable={false}
                              onDragStart={(event) => event.preventDefault()}
                              onLoad={(event) => {
                                const target = event.currentTarget;
                                const { naturalWidth, naturalHeight } = target;
                                const next =
                                  naturalWidth > naturalHeight
                                    ? "landscape"
                                    : naturalWidth < naturalHeight
                                      ? "portrait"
                                      : "square";
                                setPhotoOrientation((prev) => (prev[poster] === next ? prev : { ...prev, [poster]: next }));
                              }}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {hasBilibiliPreview && (
        <>
        {id === "p4" && (
          <div className="mb-12 lg:mb-16">
            {resultsSection}
          </div>
        )}
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
        </>
      )}

      <div className="space-y-16 lg:space-y-24">
        {id === "p2" && (
          resultsSection
        )}
      </div>

      {lightboxPhotos && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute top-5 right-5 w-10 h-10 rounded-full glass text-white flex items-center justify-center"
            onClick={() => setLightboxPhotos(null)}
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
          {lightboxPhotos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 sm:left-6 w-10 h-10 rounded-full glass text-white flex items-center justify-center"
                onClick={() => setLightboxIndex((prev) => (prev - 1 + lightboxPhotos.length) % lightboxPhotos.length)}
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="absolute right-3 sm:right-6 w-10 h-10 rounded-full glass text-white flex items-center justify-center"
                onClick={() => setLightboxIndex((prev) => (prev + 1) % lightboxPhotos.length)}
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <div className="w-full max-w-[92vw] max-h-[92vh] rounded-2xl overflow-hidden border border-white/20 flex items-center justify-center">
            <img
              src={lightboxPhotos[lightboxIndex]}
              alt={`${t.portfolio.projectDetail.photoAlt} ${lightboxIndex + 1}`}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
