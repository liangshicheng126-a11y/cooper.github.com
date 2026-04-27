import ProjectDetailClient from "./ProjectDetailClient";

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
  return <ProjectDetailClient id={id} />;
}
