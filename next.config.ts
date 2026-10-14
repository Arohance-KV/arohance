import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Studios moved to /studio (lib/verticals.ts verticalHref); the browser keeps any #service anchor.
  async redirects() {
    return [{ source: '/services/studios', destination: '/studio', permanent: true }];
  },
};

export default nextConfig;
