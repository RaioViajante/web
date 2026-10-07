// Representative Lighthouse pages: one per distinct runtime class, not per
// URL. Why each, from how the apps are built (docs/performance.md):
//   root   Next, dynamic (nonce CSP) — home (avatar animation, primary links),
//          gallery (the image-heavy page), search (shared client search).
//   dump   Next, dynamic — home (post lists), an article (MDX, syntax-highlighted
//          code, comments placeholder; giscus is never loaded), search.
//   docs   Astro, static — home, a reference page (code-heavy), search.
//   lab    Astro, static — home, three experiments with different client code,
//          search.
export const pages = [
  { app: "root", name: "home", path: "/" },
  { app: "root", name: "gallery", path: "/gallery" },
  { app: "root", name: "search", path: "/search" },
  { app: "dump", name: "home", path: "/" },
  {
    app: "dump",
    name: "article",
    path: "/posts/kept-building-and-stopped-writing-it-down",
  },
  { app: "dump", name: "search", path: "/search" },
  { app: "docs", name: "home", path: "/" },
  { app: "docs", name: "reference", path: "/projects/sweep/cli/" },
  { app: "docs", name: "search", path: "/search/" },
  { app: "lab", name: "home", path: "/" },
  { app: "lab", name: "boot-sector", path: "/experiments/boot-sector/" },
  {
    app: "lab",
    name: "execution-states",
    path: "/experiments/execution-states/",
  },
  {
    app: "lab",
    name: "filename-classifier",
    path: "/experiments/filename-classifier/",
  },
  { app: "lab", name: "search", path: "/search/" },
];
export const profiles = ["mobile", "desktop"];
