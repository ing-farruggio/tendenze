import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "herqoluhyyqahrreoygn.supabase.co",
      },
    ],
  },
};

export default nextConfig;
