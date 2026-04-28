import ProjectDetailClient from "./ProjectDetailClient";
import { promises as fs } from "node:fs";
import path from "node:path";

const PROJECT_IDS = ["p1", "p2", "p3", "p4"] as const;

export function generateStaticParams() {
  return PROJECT_IDS.map((id) => ({ id }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photographyPhotos = await getPhotographyPhotos();
  return <ProjectDetailClient id={id} photographyPhotos={photographyPhotos} />;
}

async function getPhotographyPhotos() {
  const photosDir = path.join(process.cwd(), "public", "photos", "photography");
  try {
    const files = await fs.readdir(photosDir, { withFileTypes: true });
    return files
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => /\.(jpg|jpeg|png|webp|avif)$/i.test(name))
      .sort((a, b) => a.localeCompare(b, "en"))
      .map((name) => `/photos/photography/${encodeURIComponent(name)}`);
  } catch {
    return [];
  }
}
