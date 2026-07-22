import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow product images served from Shopify's CDN + the store domain.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "*.myshopify.com" },
    ],
  },
};

export default nextConfig;
