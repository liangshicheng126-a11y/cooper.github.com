"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { ArrowLeft, Calendar, User, Layout, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import LazyInViewImage from "@/components/LazyInViewImage";
import GalleryLightbox from "@/components/GalleryLightbox";
import { mapDisplaySources, thumbSrc } from "@/lib/galleryImageUrl";

/** Deterministic shuffle — avoids re-randomizing on each render (mobile re-render storms). */
function stableShufflePosters(items: string[]) {
  const arr = [...items];
  let seed = 2166136261;
  for (const item of arr) {
    for (let i = 0; i < item.length; i++) {
      seed ^= item.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }
  }
  for (let i = arr.length - 1; i > 0; i--) {
    seed = Math.imul(seed ^ (seed >>> 13), 1103515245) + 12345;
    const j = Math.abs(seed) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Props = {
  id: string;
  photographyGroups?: Array<{
    year: string;
    dateLabel: string;
    location: string;
    photos: string[];
  }>;
  posters?: string[];
};

export default function ProjectDetailClient({ id, photographyGroups = [], posters = [] }: Props) {
  const { t, mounted } = useTranslation();
  const [lightboxPhotos, setLightboxPhotos] = useState<string[] | null>(null);
  const [lightboxFallbacks, setLightboxFallbacks] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const shuffledPosters = useMemo(() => stableShufflePosters(posters), [posters]);
  const shuffledPosterDisplay = useMemo(() => mapDisplaySources(shuffledPosters), [shuffledPosters]);

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
  const hasPosterGallery = id === "p1" && posters.length > 0;
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
  const openLightbox = (photos: string[], index: number, fallbacks?: string[]) => {
    setLightboxPhotos(photos);
    setLightboxFallbacks(fallbacks ?? null);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxPhotos(null);
    setLightboxFallbacks(null);
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

  if (id === "p2") {
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

        <motion.section
          variants={item}
          className="min-h-[55vh] rounded-[40px] glass border-white/10 flex flex-col items-center justify-center text-center px-6 py-16"
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="relative mb-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
              <Layout className="w-10 h-10 text-indigo-400" />
            </div>
            <motion.span
              className="absolute -inset-2 rounded-3xl border border-indigo-400/30"
              animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.1, 0.45] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            正在施工中
          </h1>
          <p className="text-lg sm:text-xl text-foreground/60 mb-10">
            敬请期待
          </p>

          <div className="w-full max-w-md h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.section>
      </motion.div>
    );
  }

  if (!mounted) {
    return (
      <div className="max-w-5xl pb-8 animate-pulse">
        <div className="mb-8 h-6 w-32 rounded-lg bg-white/10" />
        <div className="mb-6 h-12 w-2/3 max-w-md rounded-xl bg-white/10" />
        <div className="mb-12 h-48 rounded-3xl bg-white/5 sm:h-64" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl pb-8">
      <motion.div variants={item} className="mb-8 sm:mb-12">
        <Link
          href="/portfolio"
          className="inline-flex items-center space-x-2 text-foreground/60 hover:text-indigo-500 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">{t.portfolio.projectDetail.back}</span>
        </Link>
      </motion.div>

      <header className="mb-10 sm:mb-16">
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

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-24">
        <div className="glass p-6 sm:p-8 rounded-3xl border-white/5">
          <User className="w-6 h-6 text-indigo-500 mb-4" />
          <h4 className="text-xs uppercase font-bold text-foreground/40 tracking-widest mb-2">{t.portfolio.projectDetail.role}</h4>
          <p className="text-lg font-bold">{project.role}</p>
        </div>
        <div className="glass p-6 sm:p-8 rounded-3xl border-white/5">
          <Calendar className="w-6 h-6 text-indigo-500 mb-4" />
          <h4 className="text-xs uppercase font-bold text-foreground/40 tracking-widest mb-2">{t.portfolio.projectDetail.date}</h4>
          <p className="text-lg font-bold">{project.date}</p>
        </div>
        <div className="glass p-6 sm:p-8 rounded-3xl border-white/5">
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
        <motion.div variants={item} className="aspect-[4/3] sm:aspect-[21/9] rounded-[28px] sm:rounded-[40px] overflow-hidden glass border-white/10 mb-12 sm:mb-16">
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
        <motion.section variants={item} className="gallery-section mb-16 lg:mb-24">
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
                      {Array.from({ length: 12 }).map((_, i) => (
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
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                      {group.photos.map((photo, index) => (
                        <div
                          key={`${group.dateLabel}-${group.location}-${index}-${photo}`}
                          className="group aspect-[4/3] overflow-hidden rounded-2xl glass border-white/10"
                        >
                          <LazyInViewImage
                            src={thumbSrc(photo)}
                            fallbackSrc={photo}
                            alt={`${t.portfolio.projectDetail.photoAlt} ${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-700 sm:group-hover:scale-105"
                            onClick={() =>
                              openLightbox(mapDisplaySources(group.photos), index, group.photos)
                            }
                          />
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
        <motion.section variants={item} className="gallery-section mb-16 lg:mb-24">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t.portfolio.projectDetail.posterGallery}</h2>
            <span className="text-base sm:text-lg text-foreground/55 font-medium">
              {t.portfolio.projectDetail.posterCount} {shuffledPosters.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {shuffledPosters.map((poster, index) => (
              <div
                key={`poster-${index}-${poster}`}
                className="group aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100/80 shadow-[0_2px_16px_rgba(15,23,42,0.08)] transition-shadow duration-300 sm:hover:shadow-[0_12px_32px_rgba(15,23,42,0.14)] sm:hover:-translate-y-0.5"
              >
                <LazyInViewImage
                  src={thumbSrc(poster)}
                  fallbackSrc={poster}
                  alt={`${t.portfolio.projectDetail.posterAlt} ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 sm:group-hover:scale-[1.03]"
                  onClick={() => openLightbox(shuffledPosterDisplay, index, shuffledPosters)}
                  draggable={false}
                />
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
        <GalleryLightbox
          photos={lightboxPhotos}
          fallbackPhotos={lightboxFallbacks ?? undefined}
          index={lightboxIndex}
          onClose={closeLightbox}
          onIndexChange={setLightboxIndex}
          backLabel={t.portfolio.projectDetail.lightboxBack}
          closeLabel={t.portfolio.projectDetail.lightboxClose}
          altPrefix={id === "p1" ? t.portfolio.projectDetail.posterAlt : t.portfolio.projectDetail.photoAlt}
          galleryLabel={id === "p1" ? t.portfolio.projectDetail.posterGallery : t.portfolio.projectDetail.photoGallery}
        />
      )}
    </motion.div>
  );
}
