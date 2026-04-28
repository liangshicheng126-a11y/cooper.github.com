import ProjectDetailClient from "./ProjectDetailClient";
import { promises as fs } from "node:fs";
import path from "node:path";

const PROJECT_IDS = ["p1", "p2", "p3", "p4"] as const;
type PhotographyGroup = {
  year: string;
  dateLabel: string;
  location: string;
  photos: string[];
  latestTimestamp: number;
};
type RawPhotographyGroup = Omit<PhotographyGroup, "photos"> & {
  photos: Array<{ path: string; timestamp: number }>;
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
  const groups = new Map<string, RawPhotographyGroup>();

  const pushPhoto = (year: string, dateLabel: string, location: string, webPath: string, timestamp: number) => {
    const safeYear = year || "Unknown";
    const safeDateLabel = dateLabel || "Unknown";
    const safeLocation = location || "Unknown";
    const key = `${safeYear}__${safeDateLabel}__${safeLocation}`;
    const current = groups.get(key);
    if (current) {
      current.photos.push({ path: webPath, timestamp });
      current.latestTimestamp = Math.max(current.latestTimestamp, timestamp);
      return;
    }
    groups.set(key, {
      year: safeYear,
      dateLabel: safeDateLabel,
      location: safeLocation,
      photos: [{ path: webPath, timestamp }],
      latestTimestamp: timestamp,
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

  const isMonth = (name: string) => /^([0]?[1-9]|1[0-2])(?:月|[-_ ].+)?$/i.test(name);
  const joinWebPath = (segments: string[]) =>
    `/photos/photography/${segments.map((s) => encodeURIComponent(s)).join("/")}`;
  const parseFileDate = (name: string) => {
    const base = name.replace(/\.[^.]+$/, "");
    const withSeparators = base.match(/(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)/);
    if (withSeparators) {
      return {
        year: withSeparators[1],
        month: withSeparators[2],
        day: withSeparators[3],
      };
    }
    return null;
  };
  const parseDateFromFolderLabel = (label: string) => {
    const cleaned = label.trim();
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monDay = cleaned.match(/^([A-Za-z]{3})\s+([0-3]?\d)$/);
    if (monDay) {
      const idx = monthNames.indexOf(monDay[1].toUpperCase());
      if (idx >= 0) return { month: String(idx + 1).padStart(2, "0"), day: monDay[2].padStart(2, "0") };
    }
    const monthOnly = cleaned.match(/^([0]?[1-9]|1[0-2])$/);
    if (monthOnly) return { month: monthOnly[1].padStart(2, "0"), day: "01" };
    const monthDayCN = cleaned.match(/^([0]?[1-9]|1[0-2])月([0-3]?\d)$/);
    if (monthDayCN) return { month: monthDayCN[1].padStart(2, "0"), day: monthDayCN[2].padStart(2, "0") };
    const numericDay = cleaned.match(/^([0]?[1-9]|1[0-2])[-_ ]([0-3]?\d)$/);
    if (numericDay) return { month: numericDay[1].padStart(2, "0"), day: numericDay[2].padStart(2, "0") };
    return null;
  };

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
      const parsedDate = parseFileDate(image.fileName);
      const dirs = image.relParts;
      const yearIndex = dirs.findIndex((part) => isYear(part));
      const year = yearIndex >= 0 ? dirs[yearIndex] : (parsed?.year ?? "Unknown");
      const dateDir = yearIndex >= 0 ? dirs[yearIndex + 1] : undefined;
      const dateLabel = dateDir ?? "Unknown";

      let location = parsed?.location ?? "Unknown";
      if (yearIndex >= 0) {
        const afterYear = dirs.slice(yearIndex + 1);
        if (afterYear.length > 1) {
          location = afterYear[1];
        } else if (afterYear.length === 1) {
          location = isMonth(afterYear[0]) ? "Unknown" : afterYear[0];
        }
      } else if (dirs.length > 0) {
        location = dirs[0];
      }

      const safeYearForDate = /^\d{4}$/.test(year) ? year : "1970";
      const folderDate = dateDir ? parseDateFromFolderLabel(dateDir) : null;
      const safeMonthForDate = folderDate?.month ?? parsedDate?.month ?? "01";
      const safeDayForDate = folderDate?.day ?? parsedDate?.day ?? "01";
      const timestamp = Date.parse(`${safeYearForDate}-${safeMonthForDate}-${safeDayForDate}T00:00:00Z`);
      pushPhoto(year, dateLabel, location, joinWebPath([...dirs, image.fileName]), Number.isNaN(timestamp) ? 0 : timestamp);
    }

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        photos: group.photos
          .sort((a, b) => {
            if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
            return b.path.localeCompare(a.path, "en");
          })
          .map((photo) => photo.path),
      }))
      .sort((a, b) => {
        const aYear = /^\d{4}$/.test(a.year) ? Number(a.year) : -1;
        const bYear = /^\d{4}$/.test(b.year) ? Number(b.year) : -1;
        if (bYear !== aYear) return bYear - aYear;

        const aMonth = parseDateFromFolderLabel(a.dateLabel)?.month
          ? Number(parseDateFromFolderLabel(a.dateLabel)!.month)
          : -1;
        const bMonth = parseDateFromFolderLabel(b.dateLabel)?.month
          ? Number(parseDateFromFolderLabel(b.dateLabel)!.month)
          : -1;
        if (bMonth !== aMonth) return bMonth - aMonth;

        if (b.latestTimestamp !== a.latestTimestamp) return b.latestTimestamp - a.latestTimestamp;
        return a.location.localeCompare(b.location, "en");
      });
  } catch {
    return [];
  }
}
