import P2HubClient from "./P2HubClient";
import { getP2DesignScreenshots } from "@/lib/p2DesignScreenshots";

export default async function P2HubPage() {
  const designScreenshots = await getP2DesignScreenshots();
  const previewImage = designScreenshots[0] ?? "/photos/portfolio/p2/home.png";
  return <P2HubClient previewImage={previewImage} />;
}
