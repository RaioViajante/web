/** Framework-neutral metadata and URL conventions. Never include search queries. */
export interface PageSeo {
  path: string;
  title: string;
  description: string;
}

export function socialKey(path: string) {
  return `${path.replace(/^\/+|\/+$/g, "") || "index"}.png`;
}

export function socialUrl(origin: string, path: string) {
  return new URL(`/og/${socialKey(path)}`, origin).href;
}

export function pageMetadata(origin: string, site: string, page: PageSeo) {
  const title = page.path === "/" ? page.title : `${page.title} — ${site}`;
  const images = [
    { url: socialUrl(origin, page.path), width: 1200, height: 630, alt: title },
  ];
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website" as const,
      siteName: site,
      title,
      description: page.description,
      url: new URL(page.path, origin).href,
      images,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description: page.description,
      images,
    },
  };
}

const xml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char]!,
  );

export function sitemapResponse(origin: string, paths: string[]) {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${xml(new URL(path, origin).href)}</loc></url>`).join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}

export function robotsResponse(origin: string) {
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${new URL("/sitemap.xml", origin).href}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}

export const notFoundSeo: PageSeo = {
  path: "/404",
  title: "404 — not found",
  description: "This page could not be found.",
};
/** Astro builds its 404 as `/404.html` but renders it with `/404/`. */
export function isNotFoundPath(path: string) {
  return /^\/404(?:\.html|\/)?$/.test(path);
}
export function notFoundMetadata(origin: string, site: string) {
  const metadata = pageMetadata(origin, site, {
    ...notFoundSeo,
    description: `This page could not be found on ${new URL(origin).host}.`,
  });
  // Next.js already marks not-found responses noindex.
  return { ...metadata, alternates: {} };
}

/** Web app manifest: every site serves the same generated icon set. */
export function webManifest(name: string) {
  return {
    name,
    short_name: name,
    start_url: "/",
    display: "standalone" as const,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable" as const,
      },
    ],
  };
}
