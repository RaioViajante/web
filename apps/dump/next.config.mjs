const nextConfig = {
  // About and Uses moved to raioviajante.com; keep the old URLs alive.
  async redirects() {
    return [
      {
        source: "/about",
        destination: "https://raioviajante.com/about",
        permanent: true,
      },
      {
        source: "/uses",
        destination: "https://raioviajante.com/setup",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/giscus.css",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://giscus.app" },
        ],
      },
    ];
  },
};
export default nextConfig;
