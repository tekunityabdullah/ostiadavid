import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "1000mb",
    },
    // proxy.ts (this version's middleware) buffers every request body it
    // passes through, capped at 10MB by default — the /api/admin/upload
    // route handler behind it never even sees the rest of large files
    // without raising this too.
    proxyClientMaxBodySize: "1000mb",
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
    ],
  },
};

export default nextConfig;