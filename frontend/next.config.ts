import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      accounts: false,
      fs: false,
      net: false,
      tls: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "porto/internal": false,
      porto: false,
    };
    return config;
  },
};

export default nextConfig;
