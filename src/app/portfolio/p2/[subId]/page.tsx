import { notFound } from "next/navigation";
import P2SubClient from "./P2SubClient";
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
  return <P2SubClient subId={subId} />;
}
