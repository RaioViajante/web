import type { NextConfig } from "next";
import { staticHeaders, workHeaders } from "../../security/headers";

const nextConfig: NextConfig = {
  // Preserve the repository's hand-maintained agent instructions.
  agentRules: false,
  async headers() {
    return [
      { source: "/(.*)", headers: staticHeaders("root") },
      // Later entries override the same header key.
      { source: "/work/:path*", headers: workHeaders() },
    ];
  },
  async redirects() {
    // Next serves no directory indexes, and the demo's relative paths need a
    // URL inside its folder, so a rewrite of the bare path would break them.
    return [
      {
        source: "/work/stucco",
        destination: "/work/stucco/index.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
