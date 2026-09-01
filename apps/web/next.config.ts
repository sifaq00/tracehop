import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/x",
        destination: "https://x.com/TraceHopAgent",
        permanent: true,
      },
      {
        source: "/telegram",
        destination: "https://t.me/TraceHopAgentBot",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
