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

export interface SitemapEntry {
  path: string;
  /** Only a real content date (`YYYY-MM-DD`); never a build time. */
  lastmod?: string;
}

export function sitemapResponse(
  origin: string,
  entries: Array<string | SitemapEntry>,
) {
  const urls = entries.map((entry) =>
    typeof entry === "string" ? { path: entry } : entry,
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(({ path, lastmod }) => `<url><loc>${xml(new URL(path, origin).href)}</loc>${lastmod ? `<lastmod>${xml(lastmod)}</lastmod>` : ""}</url>`).join("")}</urlset>`,
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

/**
 * Web app manifest: every site serves the same generated icon set. It names
 * the site and its icons and colors only. The sites have no service worker or
 * offline mode, so `display` stays `browser` rather than claiming an app shell.
 */
export function webManifest(name: string, colors?: { themeColor: string }) {
  return {
    name,
    short_name: name,
    start_url: "/",
    display: "browser" as const,
    ...(colors
      ? { theme_color: colors.themeColor, background_color: colors.themeColor }
      : {}),
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

/**
 * The one public identity of the person behind the sites. Only facts the
 * sites already publish: the handle used as the author name everywhere, the
 * home page, and the GitHub profile linked from the home pages.
 */
export const identity = {
  name: "RaioViajante",
  url: "https://raioviajante.com/",
  id: "https://raioviajante.com/#person",
  github: "https://github.com/RaioViajante",
} as const;

/** A reference every page can embed; Google does not follow `@id` across documents. */
export function personRef() {
  return {
    "@type": "Person" as const,
    "@id": identity.id,
    name: identity.name,
    url: identity.url,
  };
}

/** The full Person node, published once on the root home page. */
export function personJsonLd() {
  return { ...personRef(), sameAs: [identity.github] };
}

export function websiteId(origin: string) {
  return new URL("/#website", origin).href;
}

export function websiteJsonLd(
  origin: string,
  name: string,
  description: string,
) {
  return {
    "@type": "WebSite" as const,
    "@id": websiteId(origin),
    name,
    description,
    url: new URL("/", origin).href,
    inLanguage: "en",
    author: personRef(),
  };
}

/** Breadcrumb items are real pages, in navigation order, as `[name, path]`. */
export function breadcrumbJsonLd(
  origin: string,
  items: Array<[string, string]>,
) {
  return {
    "@type": "BreadcrumbList" as const,
    itemListElement: items.map(([name, path], index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name,
      item: new URL(path, origin).href,
    })),
  };
}

/** One `<script type="application/ld+json">` body for the given nodes. */
export function jsonLdScript(...nodes: object[]) {
  // `<` is escaped so a value can never close the surrounding script element.
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  }).replace(/</g, "\\u003c");
}
