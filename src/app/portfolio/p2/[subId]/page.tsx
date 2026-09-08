import { notFound } from "next/navigation";
import P2SubClient from "./P2SubClient";
import { getP2PersonalWebsiteScreenshotGroupsByLanguage } from "@/lib/p2PersonalWebsiteScreenshots";
import { getP2SmartGlassesScreenshotGroups } from "@/lib/p2SmartGlassesScreenshots";
import { getP2DaeguAquariumScreenshotGroups } from "@/lib/p2DaeguAquariumScreenshots";
import { isP2SubId } from "@/lib/p2Subprojects";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { subId: "personal-website" },
    { subId: "smart-glasses" },
    { subId: "daegu-aquarium" },
  ];
}

export default async function P2SubPage({
  params,
}: {
  params: Promise<{ subId: string }>;
}) {
  const { subId } = await params;
  if (!isP2SubId(subId)) notFound();

  const personalWebsiteGroupsByLanguage =
    subId === "personal-website"
      ? await getP2PersonalWebsiteScreenshotGroupsByLanguage()
      : undefined;
  const smartGlassesGroups =
    subId === "smart-glasses" ? await getP2SmartGlassesScreenshotGroups() : [];
  const daeguAquariumGroups =
    subId === "daegu-aquarium"
      ? await getP2DaeguAquariumScreenshotGroups()
      : [];

  return (
    <P2SubClient
      subId={subId}
      personalWebsiteGroupsByLanguage={personalWebsiteGroupsByLanguage}
      smartGlassesGroups={smartGlassesGroups}
      daeguAquariumGroups={daeguAquariumGroups}
    />
  );
}
