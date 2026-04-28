import ProjectDetailClient from "./ProjectDetailClient";
import { promises as fs } from "node:fs";
import path from "node:path";

const PROJECT_IDS = ["p1", "p2", "p3", "p4"] as const;
type PhotographyGroup = {
  year: string;
  location: string;
  photos: string[];
};

export function generateStaticParams() {
  return PROJECT_IDS.map((id) => ({ id }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photographyGroups = await getPhotographyGroups();
  return <ProjectDetailClient id={id} photographyGroups={photographyGroups} />;
}

async function getPhotographyGroups(): Promise<PhotographyGroup[]> {
  const photosDir = path.join(process.cwd(), "public", "photos", "photography");
  const groups = new Map<string, PhotographyGroup>();

  const pushPhoto = (year: string, location: string, webPath: string) => {
    const safeYear = year || "Unknown";
    const safeLocation = location || "Unknown";
    const key = `${safeYear}__${safeLocation}`;
    const current = groups.get(key);
    if (current) {
      current.photos.push(webPath);
      return;
    }
    groups.set(key, {
      year: safeYear,
      location: safeLocation,
      photos: [webPath],
    });
  };

  const isImage = (name: string) => /\.(jpg|jpeg|png|webp|avif)$/i.test(name);
  const isYear = (name: string) => /^\d{4}$/.test(name);
  const splitFromFileName = (name: string) => {
    const base = name.replace(/\.[^.]+$/, "");
    const match = base.match(/^(\d{4})[-_ ]+([^-_ ]+)/);
    if (!match) return null;
    return { year: match[1], location: match[2] };
  };

  try {
    const topLevelEntries = await fs.readdir(photosDir, { withFileTypes: true });

    for (const entry of topLevelEntries) {
      if (entry.isFile() && isImage(entry.name)) {
        const parsed = splitFromFileName(entry.name);
        pushPhoto(
          parsed?.year ?? "Unknown",
          parsed?.location ?? "Unknown",
          `/photos/photography/${encodeURIComponent(entry.name)}`
        );
        continue;
      }

      if (!entry.isDirectory()) continue;

      const firstDir = entry.name;
      const firstDirAbs = path.join(photosDir, firstDir);
      const secondLevelEntries = await fs.readdir(firstDirAbs, { withFileTypes: true });

      if (isYear(firstDir)) {
        for (const second of secondLevelEntries) {
          if (second.isFile() && isImage(second.name)) {
            pushPhoto(
              firstDir,
              "Unknown",
              `/photos/photography/${encodeURIComponent(firstDir)}/${encodeURIComponent(second.name)}`
            );
            continue;
          }

          if (!second.isDirectory()) continue;

          const location = second.name;
          const locationAbs = path.join(firstDirAbs, location);
          const files = await fs.readdir(locationAbs, { withFileTypes: true });
          for (const file of files) {
            if (!file.isFile() || !isImage(file.name)) continue;
            pushPhoto(
              firstDir,
              location,
              `/photos/photography/${encodeURIComponent(firstDir)}/${encodeURIComponent(location)}/${encodeURIComponent(file.name)}`
            );
          }
        }
      } else {
        for (const second of secondLevelEntries) {
          if (!second.isFile() || !isImage(second.name)) continue;
          pushPhoto(
            "Unknown",
            firstDir,
            `/photos/photography/${encodeURIComponent(firstDir)}/${encodeURIComponent(second.name)}`
          );
        }
      }
    }

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        photos: group.photos.sort((a, b) => a.localeCompare(b, "en")),
      }))
      .sort((a, b) => {
        if (a.year === b.year) return a.location.localeCompare(b.location, "en");
        if (a.year === "Unknown") return 1;
        if (b.year === "Unknown") return -1;
        return Number(b.year) - Number(a.year);
      });
  } catch {
    return [];
  }
}
