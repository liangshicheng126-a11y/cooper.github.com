import { notFound } from "next/navigation";
import P2SubClient from "./P2SubClient";
import { getP2PersonalWebsiteScreenshotGroups } from "@/lib/p2PersonalWebsiteScreenshots";
import { getP2SmartGlassesScreenshotGroups } from "@/lib/p2SmartGlassesScreenshots";
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

  const personalWebsiteGroups =
    subId === "personal-website" ? await getP2PersonalWebsiteScreenshotGroups() : [];
  const smartGlassesGroups =
    subId === "smart-glasses" ? await getP2SmartGlassesScreenshotGroups() : [];

  return (
    <P2SubClient
      subId={subId}
      personalWebsiteGroups={personalWebsiteGroups}
      smartGlassesGroups={smartGlassesGroups}
    />
  );
}
