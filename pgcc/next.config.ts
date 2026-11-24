import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false, // hides the "N" badge in development
  allowedDevOrigins: ["192.168.18.3"],
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};
export default nextConfig;
