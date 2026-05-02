import type { NextConfig } from "next";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserSiteRepo = repository.endsWith(".github.io");
// *.github.io/<repo>/ 静态托管仍需要 basePath；绑定 apex 自定义域名时，
// GitHub Pages 会把资源放在 /_next（根路径），而不是 /<repo>/_next，否则会 404、样式丢失。
// CI 里在已为自定义域名准备就绪后设为 true（见 deploy-pages.yml）。
const useRepoPrefix =
  Boolean(process.env.GITHUB_ACTIONS) &&
  Boolean(repository) &&
  !isUserSiteRepo &&
  process.env.GITHUB_PAGES_CUSTOM_DOMAIN_ROOT !== "true";

const pagesBasePath = useRepoPrefix ? `/${repository}` : "";

const nextConfig: NextConfig = {
  trailingSlash: true,
  outputFileTracingExcludes: {
    "/portfolio/[id]": ["./public/photos/**"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Project Pages needs a repository prefix, e.g. /<repository-name>
  basePath: pagesBasePath,
  assetPrefix: pagesBasePath ? `${pagesBasePath}/` : undefined,
};

export default nextConfig;
