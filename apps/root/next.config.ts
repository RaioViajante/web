import type { NextConfig } from "next";
import { staticHeaders } from "../../security/headers";

const nextConfig: NextConfig = {
  // Preserve the repository's hand-maintained agent instructions.
  agentRules: false,
  async headers() {
    return [{ source: "/(.*)", headers: staticHeaders("root") }];
  },
};

export default nextConfig;
