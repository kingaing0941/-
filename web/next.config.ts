import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  async redirects() {
    return [
      { source: "/meal", destination: "/today", permanent: false },
      { source: "/school", destination: "/schools", permanent: false },
      { source: "/profile", destination: "/me", permanent: false },
      { source: "/welcome", destination: "/start", permanent: false },
    ];
  },
};

export default nextConfig;
