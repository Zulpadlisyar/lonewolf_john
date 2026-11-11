import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "media.lonewolfapparel.com",
      },
    ],
  },
  async headers() {
    const isStaging = process.env.APP_ENV === "staging";
    const headers = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-XSS-Protection",
        value: "1; mode=block",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
    ];

    if (isStaging) {
      headers.push({
        key: "X-Robots-Tag",
        value: "noindex, nofollow, noarchive",
      });
    }

    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },
};

export default nextConfig;

