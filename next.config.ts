import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // NOTE: Static export is not compatible with our dynamic API routes.
  // We deploy as a Next.js server (or later split APIs into Lambda).
  // Fix Turbopack workspace-root inference warnings when other lockfiles exist
  // outside this repo.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
