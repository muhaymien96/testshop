import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    disableOptimizer: true,  // <-- disables LightningCSS (fixes Netlify build)
  },
};

export default nextConfig;
