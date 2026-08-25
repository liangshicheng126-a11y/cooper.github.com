"use client";

import type { LucideIcon } from "lucide-react";

export type ChallengeItem = {
  title: string;
  body: string;
  points: string[];
};

type ChallengeConfig = ChallengeItem & {
  key: string;
  icon: LucideIcon;
};

type Props = {
  sectionTitle: string;
  challenges: ChallengeConfig[];
};

export default function DesignChallengesSection({ sectionTitle, challenges }: Props) {
  return (
    <section className="mb-16 lg:mb-24">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-10 sm:mb-12">
        {sectionTitle}
      </h2>
      <div className="screening-analysis">
        {challenges.map(({ key, icon: Icon, title, body, points }) => (
          <article key={key} className="screening-analysis__chapter">
            <header className="screening-analysis__heading">
              <span className="screening-analysis__icon">
                <Icon className="h-5 w-5 text-indigo-500" aria-hidden />
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h3>
            </header>
            <div className="screening-analysis__content">
              <p className="screening-analysis__prose text-base sm:text-lg text-foreground/75 leading-relaxed">{body}</p>
              <ul className="screening-analysis__points">
                {points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm sm:text-base text-foreground/65 leading-relaxed"
                  >
                    <span className="screening-analysis__bullet" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
