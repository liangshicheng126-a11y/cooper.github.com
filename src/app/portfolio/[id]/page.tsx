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

  const isMonth = (name: string) => /^(0?[1-9]|1[0-2])(?:月)?$/.test(name);
  const joinWebPath = (segments: string[]) =>
    `/photos/photography/${segments.map((s) => encodeURIComponent(s)).join("/")}`;

  const readAllImages = async (dirAbs: string, relParts: string[] = []) => {
    const entries = await fs.readdir(dirAbs, { withFileTypes: true });
    const out: { relParts: string[]; fileName: string }[] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        out.push(...(await readAllImages(path.join(dirAbs, entry.name), [...relParts, entry.name])));
        continue;
      }
      if (!entry.isFile() || !isImage(entry.name)) continue;
      out.push({ relParts, fileName: entry.name });
    }
    return out;
  };

  try {
    const images = await readAllImages(photosDir);
    for (const image of images) {
      const parsed = splitFromFileName(image.fileName);
      const dirs = image.relParts;
      const yearIndex = dirs.findIndex((part) => isYear(part));
      const year = yearIndex >= 0 ? dirs[yearIndex] : (parsed?.year ?? "Unknown");

      let location = parsed?.location ?? "Unknown";
      if (yearIndex >= 0) {
        const afterYear = dirs.slice(yearIndex + 1);
        const filtered = afterYear.filter((part, idx) => !(idx === 0 && isMonth(part)));
        if (filtered.length > 0) location = filtered[0];
      } else if (dirs.length > 0) {
        location = dirs[0];
      }

      pushPhoto(year, location, joinWebPath([...dirs, image.fileName]));
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
