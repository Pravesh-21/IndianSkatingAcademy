import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // @ts-ignore - Turbopack root is a new setting in Next.js 16
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
