import type { NextConfig } from "next";

/**
 * GITHUB_PAGES=true builds a static export for GitHub Pages (see .github/workflows/deploy.yml).
 * The site is served from a sub-path (e.g. /my-dietician), passed in as PAGES_BASE_PATH.
 */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isGithubPages && {
    output: "export",
    basePath: process.env.PAGES_BASE_PATH ?? "",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
