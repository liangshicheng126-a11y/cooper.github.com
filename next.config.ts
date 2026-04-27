import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Project Pages needs a repository prefix, e.g. /cooper.github.com
  basePath: process.env.GITHUB_ACTIONS ? "/cooper.github.com" : "",
  assetPrefix: process.env.GITHUB_ACTIONS ? "/cooper.github.com/" : undefined,
};

export default nextConfig;
