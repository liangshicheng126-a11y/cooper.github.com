import P2HubClient from "./P2HubClient";
import { getP2DesignScreenshots } from "@/lib/p2DesignScreenshots";

export default async function P2HubPage() {
  const designScreenshots = await getP2DesignScreenshots();
  return <P2HubClient designScreenshots={designScreenshots} />;
}
