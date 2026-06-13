import { notFound } from "next/navigation";
import P2SubClient from "./P2SubClient";
import { getP2DesignScreenshots } from "@/lib/p2DesignScreenshots";
import { isP2SubId } from "@/lib/p2Subprojects";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ subId: "personal-website" }, { subId: "smart-glasses" }];
}

export default async function P2SubPage({
  params,
}: {
  params: Promise<{ subId: string }>;
}) {
  const { subId } = await params;
  if (!isP2SubId(subId)) notFound();
  const designScreenshots =
    subId === "personal-website" ? await getP2DesignScreenshots() : [];
  return <P2SubClient subId={subId} designScreenshots={designScreenshots} />;
}
