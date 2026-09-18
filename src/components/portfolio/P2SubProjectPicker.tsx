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
  coverClassName?: string;
};

type Props = {
  sectionTitle: string;
  projects: SubProject[];
};

export default function P2SubProjectPicker({ sectionTitle, projects }: Props) {
  return (
    <section>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 sm:mb-8">{sectionTitle}</h2>
      <GsapScrollBatch entrance="portfolio" playOnMount className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/portfolio/p2/${project.slug}`}
            className="group overflow-visible p-2 sm:p-3 block cursor-pointer"
          >
            <div data-scroll-batch-item data-batch-index={index} className="text-center">
              <GsapProjectCardHover
                accent={project.accent}
                image={project.image}
                category={project.category}
                title={project.title}
                viewProject={project.viewLabel}
                variant="portfolio"
                contentAlign="center"
                imageOverlay="gradient"
                className={`project-card-responsive rounded-3xl ${project.coverClassName ?? ""}`}
              />
              <p className="mx-auto mt-4 max-w-[34rem] px-4 text-sm leading-relaxed text-foreground/60 sm:text-base">
                {project.desc}
              </p>
              <span className="mt-3 inline-flex items-center justify-center gap-2 px-4 text-sm font-semibold text-indigo-500 transition-all group-hover:gap-3">
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
