// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Index 7 is likely the ':' in ':path*'
        source: '/api/zikoml/:path*', 
        destination: 'http://127.0.0*',
      },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "://pinimg.com" }],
  },
};

export default nextConfig;
