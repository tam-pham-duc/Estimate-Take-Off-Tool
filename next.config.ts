import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'Next.js',
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
