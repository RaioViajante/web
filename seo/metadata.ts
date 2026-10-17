import { DEFAULT_LOCALE, LOCALES, type LocaleId } from "../site/locales.ts";
import { alternateCluster, ogLocale, type Counterpart } from "./locale.ts";

/** Framework-neutral metadata and URL conventions. Never include search queries. */
export interface PageSeo {
  path: string;
  title: string;
  description: string;
  /** The rendered locale; English when omitted. `path` must belong to it. */
  locale?: LocaleId;
  /**
   * Real, public pages in other locales that this page is a counterpart of,
   * declared by the app. Omit it when there is none: a page alone emits no
   * `hreflang` and no `og:locale:alternate`. Nothing is inferred from `path`.
   */
  counterparts?: readonly Counterpart[];
}

export function socialKey(path: string) {
  return `${path.replace(/^\/+|\/+$/g, "") || "index"}.png`;
}

export function socialUrl(origin: string, path: string) {
  return new URL(`/og/${socialKey(path)}`, origin).href;
}

/**
 * The search page is reachable and crawlable but not indexed: it is a form
 * with about 35 words of prompt text before a query, near-identical on all four
 * sites. It keeps one canonical (the bare path; `?q=` never changes it) and is
 * left out of the sitemaps. It must not be blocked in robots.txt, or crawlers
 * could not see the noindex.
 */
export function isSearchPath(path: string) {
  return localeRooted("search").test(path);
}

/** `/<name>` or `/<name>/`, also under any locale prefix (`/pt/search`). */
function localeRooted(name: string) {
  const prefixes = Object.values(LOCALES)
    .map((locale) => locale.urlPrefix)
    .filter(Boolean)
    .map((prefix) => prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`^(?:${prefixes.join("|")})?/${name}/?$`);
}

export function pageMetadata(origin: string, site: string, page: PageSeo) {
  const locale = page.locale ?? DEFAULT_LOCALE;
  const cluster = alternateCluster(origin, { ...page, locale });
  // `page.path` is the locale's own home ("/" or "/pt") or a page below it.
  const isHome =
    page.path === "/" ||
    page.path.replace(/\/$/, "") === LOCALES[locale].urlPrefix;
  const title = isHome ? page.title : `${page.title} — ${site}`;
  const images = [
    { url: socialUrl(origin, page.path), width: 1200, height: 630, alt: title },
  ];
  return {
    title: { absolute: title },
    description: page.description,
    alternates: {
      canonical: page.path,
      ...(cluster
        ? {
            languages: Object.fromEntries(
              cluster.links.map((link) => [link.hreflang, link.href]),
            ),
          }
        : {}),
    },
    ...(isSearchPath(page.path)
      ? { robots: { index: false, follow: true } }
      : {}),
    openGraph: {
      type: "website" as const,
      siteName: site,
      title,
      description: page.description,
      url: new URL(page.path, origin).href,
      locale: ogLocale(locale),
      ...(cluster ? { alternateLocale: cluster.ogAlternates } : {}),
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
  // Never list pages that are not indexed: the search page and the 404 page.
  const urls = entries
    .map((entry) => (typeof entry === "string" ? { path: entry } : entry))
    .filter(({ path }) => !isSearchPath(path) && !isNotFoundPath(path));
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
/** Astro builds its 404 as `/404.html` but renders it with `/404/`; also under a locale prefix. */
export function isNotFoundPath(path: string) {
  return localeRooted("404").test(path.replace(/\.html$/, ""));
}
export function notFoundMetadata(
  origin: string,
  site: string,
  locale: LocaleId = DEFAULT_LOCALE,
  /** The page's own words when it is not English; the app supplies them. */
  copy?: { title: string; description: string },
) {
  const metadata = pageMetadata(origin, site, {
    ...notFoundSeo,
    // The 404 of the locale whose copy is rendered; it is never part of a cluster.
    path: `${LOCALES[locale].urlPrefix}${notFoundSeo.path}`,
    locale,
    description:
      copy?.description ??
      `This page could not be found on ${new URL(origin).host}.`,
    ...(copy ? { title: copy.title } : {}),
  });
  // Next.js documents injecting `noindex` on 404 responses, and does so for a
  // page-level notFound(). On Vercel, unmatched URLs are served through the
  // `/_not-found` route and arrive without it, so say it here, through the
  // documented `metadata` export, and keep no canonical on an error page.
  return { ...metadata, alternates: {}, robots: { index: false } };
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
