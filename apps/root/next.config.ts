import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preserve the repository's hand-maintained agent instructions.
  agentRules: false,
};

export default nextConfig;
