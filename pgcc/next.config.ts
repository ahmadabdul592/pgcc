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
  experimental: { serverActions: { bodySizeLimit: "3mb" } }, // CSV member uploads (default is 1mb)
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};
export default nextConfig;
