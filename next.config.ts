import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Enable experimental features if needed
  },
  // API route body size limit (increase from default 4MB)
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default nextConfig;
