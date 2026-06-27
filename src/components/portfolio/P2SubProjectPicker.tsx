"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GsapScrollBatch from "@/components/motion/GsapScrollBatch";
import GsapProjectCardHover from "@/components/motion/GsapProjectCardHover";

type SubProject = {
  slug: string;
  title: string;
  desc: string;
  category: string;
  image: string;
  accent: string;
  viewLabel: string;
};

type Props = {
  sectionTitle: string;
  projects: SubProject[];
};

export default function P2SubProjectPicker({ sectionTitle, projects }: Props) {
  return (
    <section className="mb-16 lg:mb-24">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 sm:mb-8">{sectionTitle}</h2>
      <GsapScrollBatch entrance="portfolio" playOnMount className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10">
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/portfolio/p2/${project.slug}`}
            className="group overflow-visible p-2 sm:p-3 block cursor-pointer"
          >
            <div data-scroll-batch-item data-batch-index={index}>
              <GsapProjectCardHover
                accent={project.accent}
                image={project.image}
                category={project.category}
                title={project.title}
                viewProject={project.viewLabel}
                variant="portfolio"
                imageOverlay="gradient"
                className="project-card-responsive rounded-3xl"
              />
              <p className="mt-4 px-2 text-sm sm:text-base text-foreground/60 leading-relaxed max-w-prose">
                {project.desc}
              </p>
              <span className="mt-3 px-2 inline-flex items-center gap-2 text-sm font-semibold text-indigo-500 group-hover:gap-3 transition-all">
                {project.viewLabel}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </GsapScrollBatch>
    </section>
  );
}
