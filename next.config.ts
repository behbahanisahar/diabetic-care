import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/p/:qrCodeId", destination: "/patient/:qrCodeId", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.divar.ir", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
