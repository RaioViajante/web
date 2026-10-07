import { siteOrigins, type SiteId as Site } from "../site/sites.ts";
import { identity } from "./structured-data.ts";

// The SEO contract of the four sites, as pure checks over strings. Nothing
// here fetches or reads files: `seo/verify-metadata.mjs` (HTTP) and
// `seo/static-artifacts.test.mjs` (build output) feed it documents. Every
// check returns problems worded "app <site> page <path>: <what is wrong>".
// The rules mirror docs/seo.md; they are not generic SEO folklore.

export type Problems = string[];

const origins = Object.values(siteOrigins);
const GITHUB_PROFILE = "https://github.com/RaioViajante";

const entities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&apos;": "'",
  "&#39;": "'",
};
const decode = (value: string) =>
  value.replace(/&(?:amp|lt|gt|quot|apos|#x27|#39);/g, (e) => entities[e] ?? e);

function attribute(tag: string, name: string) {
  const match = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return match ? decode(match[1]!) : undefined;
}
const tagsOf = (html: string, name: string) =>
  [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map((m) => m[0]);

export interface ParsedDocument {
  lang?: string;
  titles: string[];
  meta: Map<string, string[]>; // name= or property= -> contents
  canonicals: string[];
  links: Array<{ rel: string; href: string; type?: string }>;
  jsonLd: Array<{ json?: any; error?: string }>;
  meLinks: string[];
}

export function parseDocument(html: string): ParsedDocument {
  const meta = new Map<string, string[]>();
  for (const tag of tagsOf(html, "meta")) {
    const key = attribute(tag, "name") ?? attribute(tag, "property");
    const content = attribute(tag, "content");
    if (key && content !== undefined)
      meta.set(key.toLowerCase(), [
        ...(meta.get(key.toLowerCase()) ?? []),
        content,
      ]);
  }
  const links = tagsOf(html, "link").map((tag) => ({
    rel: attribute(tag, "rel") ?? "",
    href: attribute(tag, "href") ?? "",
    type: attribute(tag, "type"),
  }));
  return {
    lang: /<html\b[^>]*\slang="([^"]*)"/.exec(html)?.[1],
    titles: [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/g)].map((m) =>
      decode(m[1]!.trim()),
    ),
    meta,
    canonicals: links.filter((l) => l.rel === "canonical").map((l) => l.href),
    links,
    jsonLd: [
      ...html.matchAll(
        /<script\b[^>]*\stype="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ].map((m) => {
      try {
        return { json: JSON.parse(m[1]!) };
      } catch (error) {
        return { error: String(error) };
      }
    }),
    meLinks: tagsOf(html, "a")
      .filter((tag) =>
        (attribute(tag, "rel") ?? "").split(/\s+/).includes("me"),
      )
      .map((tag) => attribute(tag, "href") ?? ""),
  };
}

const norm = (url: string) => {
  try {
    return new URL(url).href;
  } catch {
    return url;
  }
};
const badHost = (url: string) =>
  /localhost|127\.0\.0\.1|\.vercel\.app|\.local\b/i.test(url);

export interface PageContext {
  site: Site;
  path: string;
  /** The sitemap `<loc>` of this page. */
  loc: string;
  html: string;
  themeColor: string;
}

const where = (site: Site, path: string) => `app ${site} page ${path}`;

/** Per-document rules: language, title, description, canonical, robots, OG, Twitter, theme, icons. */
export function checkDocument({
  site,
  path,
  loc,
  html,
  themeColor,
}: PageContext) {
  const p: Problems = [];
  const at = where(site, path);
  const doc = parseDocument(html);
  const one = (what: string, values: string[]) => {
    if (values.length === 0) p.push(`${at}: missing ${what}`);
    else if (values.length > 1)
      p.push(
        `${at}: ${values.length} ${what} (${values.map((v) => JSON.stringify(v)).join(", ")})`,
      );
    else if (!values[0]!.trim()) p.push(`${at}: empty ${what}`);
    return values[0];
  };
  const m = (key: string) => doc.meta.get(key) ?? [];

  if (doc.lang !== "en")
    p.push(`${at}: <html lang> is ${JSON.stringify(doc.lang)}, expected "en"`);
  one("<title>", doc.titles);
  one("meta description", m("description"));

  const canonical = one("canonical link", doc.canonicals);
  if (canonical) {
    if (!/^https:\/\//.test(canonical))
      p.push(`${at}: canonical is not absolute https: ${canonical}`);
    if (badHost(canonical))
      p.push(`${at}: canonical uses a non-production host ${canonical}`);
    else if (
      new URL(canonical, "https://x.invalid").origin !== siteOrigins[site]
    )
      p.push(`${at}: canonical host is not ${siteOrigins[site]}: ${canonical}`);
    if (/[?#]/.test(canonical))
      p.push(`${at}: canonical has a query or fragment: ${canonical}`);
    if (norm(canonical) !== norm(loc))
      p.push(`${at}: canonical ${canonical} differs from sitemap URL ${loc}`);
  }

  for (const robots of m("robots"))
    if (/noindex/i.test(robots))
      p.push(`${at}: robots "${robots}" contradicts being in the sitemap`);

  const og = (key: string) => one(`og:${key}`, m(`og:${key}`));
  og("title");
  og("description");
  const ogUrl = og("url");
  if (ogUrl && canonical && norm(ogUrl) !== norm(canonical))
    p.push(`${at}: og:url ${ogUrl} differs from canonical ${canonical}`);
  const ogType = og("type");
  const expectedType =
    site === "dump" && path.startsWith("/posts/") ? "article" : "website";
  if (ogType && ogType !== expectedType)
    p.push(`${at}: og:type is "${ogType}", expected "${expectedType}"`);
  const ogImage = og("image");
  if (
    ogImage &&
    (!/^https:\/\//.test(ogImage) ||
      new URL(ogImage).origin !== siteOrigins[site])
  )
    p.push(`${at}: og:image is not on ${siteOrigins[site]}: ${ogImage}`);

  const card = one("twitter:card", m("twitter:card"));
  if (card && card !== "summary_large_image")
    p.push(`${at}: twitter:card is "${card}", expected "summary_large_image"`);
  one("twitter:title", m("twitter:title"));
  one("twitter:description", m("twitter:description"));
  const twImage = one("twitter:image", m("twitter:image"));
  if (twImage && ogImage && twImage !== ogImage)
    p.push(`${at}: twitter:image differs from og:image`);

  if (expectedType === "article") {
    const published = one(
      "article:published_time",
      m("article:published_time"),
    );
    if (published && Number.isNaN(Date.parse(published)))
      p.push(`${at}: article:published_time is not a date: ${published}`);
  }

  const theme = one("theme-color", m("theme-color"));
  if (theme && theme.toLowerCase() !== themeColor.toLowerCase())
    p.push(`${at}: theme-color is ${theme}, expected ${themeColor}`);

  if (!doc.links.some((l) => l.rel.split(/\s+/).includes("icon")))
    p.push(`${at}: no icon link`);
  if (!doc.links.some((l) => l.rel === "apple-touch-icon"))
    p.push(`${at}: no apple-touch-icon link`);
  if (!doc.links.some((l) => l.rel === "manifest"))
    p.push(`${at}: no manifest link`);

  if (site === "dump") {
    const feed = doc.links.filter(
      (l) => l.rel === "alternate" && l.type === "application/rss+xml",
    );
    if (feed.length !== 1)
      p.push(`${at}: expected one RSS discovery link, found ${feed.length}`);
    else if (norm(feed[0]!.href) !== `${siteOrigins.dump}/rss.xml`)
      p.push(`${at}: RSS link is ${feed[0]!.href}`);
  }

  if (
    path === "/" &&
    (site === "root" || site === "dump") &&
    !doc.meLinks.includes(identity.github)
  )
    p.push(`${at}: the GitHub profile link lost rel="me"`);
  return p;
}

/** Where each app serves its search page (Astro apps use trailing slashes). */
export const searchPaths: Record<Site, string> = {
  root: "/search",
  dump: "/search",
  docs: "/search/",
  lab: "/search/",
};

/**
 * The search page is reachable and crawlable but deliberately not indexed:
 * `noindex, follow`, one canonical equal to the bare production URL (so `?q=`
 * and tracking parameters never create another identity), and absent from the
 * sitemap (checked by the caller with the sitemap entries).
 */
export function checkSearchPage(
  site: Site,
  html: string,
  requested = searchPaths[site],
) {
  const p: Problems = [];
  const at = where(site, requested);
  const doc = parseDocument(html);
  const robots = doc.meta.get("robots") ?? [];
  if (robots.length !== 1)
    p.push(`${at}: expected one robots meta tag, found ${robots.length}`);
  else if (!/\bnoindex\b/.test(robots[0]!) || !/\bfollow\b/.test(robots[0]!))
    p.push(
      `${at}: robots is ${JSON.stringify(robots[0])}, expected "noindex, follow"`,
    );
  const want = `${siteOrigins[site]}${searchPaths[site]}`;
  if (doc.canonicals.length !== 1 || doc.canonicals[0] !== want)
    p.push(
      `${at}: canonical is ${JSON.stringify(doc.canonicals)}, expected ${want}`,
    );
  return p;
}

/** Titles and descriptions must be unique across every checked document. */
export function checkUniqueness(
  pages: Array<{ site: Site; path: string; html: string }>,
) {
  const p: Problems = [];
  for (const [label, read] of [
    ["title", (d: ParsedDocument) => d.titles[0]],
    ["description", (d: ParsedDocument) => d.meta.get("description")?.[0]],
  ] as const) {
    const seen = new Map<string, string>();
    for (const page of pages) {
      const value = read(parseDocument(page.html));
      if (!value) continue;
      const here = `${siteOrigins[page.site]}${page.path}`;
      const first = seen.get(value);
      if (first)
        p.push(
          `duplicate ${label}: ${first} and ${here} => ${JSON.stringify(value)}`,
        );
      else seen.set(value, here);
    }
  }
  return p;
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

/** Sitemap rules; the returned entries are the page inventory. */
export function checkSitemap(site: Site, xml: string, now = new Date()) {
  const p: Problems = [];
  const at = `app ${site} sitemap`;
  if (
    !/<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/.test(
      xml,
    )
  )
    p.push(`${at}: not a sitemaps.org urlset`);
  const entries: SitemapEntry[] = [
    ...xml.matchAll(/<url>([\s\S]*?)<\/url>/g),
  ].map((m) => ({
    loc: decode(/<loc>\s*([^<]*?)\s*<\/loc>/.exec(m[1]!)?.[1] ?? ""),
    lastmod: /<lastmod>\s*([^<]*?)\s*<\/lastmod>/.exec(m[1]!)?.[1],
  }));
  if (!entries.length) p.push(`${at}: no URLs`);
  const seen = new Set<string>();
  for (const { loc, lastmod } of entries) {
    let url: URL | undefined;
    try {
      url = new URL(loc);
    } catch {
      p.push(`${at}: ${JSON.stringify(loc)} is not an absolute URL`);
      continue;
    }
    if (url.protocol !== "https:" || url.origin !== siteOrigins[site])
      p.push(`${at}: ${loc} is not on ${siteOrigins[site]}`);
    if (url.search || url.hash || loc.includes("#"))
      p.push(`${at}: ${loc} has a query or fragment`);
    if (/^\/404(\.html|\/)?$/.test(url.pathname))
      p.push(`${at}: ${loc} is a 404 page`);
    if (seen.has(url.href)) p.push(`${at}: duplicate ${loc}`);
    seen.add(url.href);
    if (lastmod !== undefined) {
      if (
        !/^\d{4}-\d\d-\d\d(T[\d:.]+(Z|[+-]\d\d:\d\d))?$/.test(lastmod) ||
        Number.isNaN(Date.parse(lastmod))
      )
        p.push(`${at}: ${loc} lastmod ${lastmod} is not a W3C date`);
      else if (Date.parse(lastmod) > now.getTime())
        p.push(`${at}: ${loc} lastmod ${lastmod} is in the future`);
      // Only an explicit modification date, and only where content can have one:
      // dump posts and docs pages (none has one today).
      const allowed =
        (site === "dump" && url.pathname.startsWith("/posts/")) ||
        site === "docs";
      if (!allowed)
        p.push(
          `${at}: ${loc} has a lastmod, but ${site} has no content dates for this page`,
        );
    }
  }
  if (
    !entries.some((e) => new URL(e.loc, "https://x.invalid").pathname === "/")
  )
    p.push(`${at}: the home page is missing`);
  return { problems: p, entries };
}

export function checkRobots(site: Site, text: string, sitemapPaths: string[]) {
  const p: Problems = [];
  const at = `app ${site} robots.txt`;
  if (badHost(text)) p.push(`${at}: mentions a local or preview host`);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.some((l) => /^user-agent:\s*\*$/i.test(l)))
    p.push(`${at}: no "User-agent: *" group`);
  if (!lines.some((l) => /^allow:\s*\/$/i.test(l)))
    p.push(`${at}: indexing is not allowed ("Allow: /")`);
  for (const line of lines) {
    const disallow = /^disallow:\s*(.*)$/i.exec(line)?.[1];
    if (disallow)
      for (const path of sitemapPaths)
        if (path.startsWith(disallow))
          p.push(`${at}: "${line}" blocks sitemap page ${path}`);
  }
  const maps = lines
    .filter((l) => /^sitemap:/i.test(l))
    .map((l) => l.replace(/^sitemap:\s*/i, ""));
  if (maps.length !== 1 || maps[0] !== `${siteOrigins[site]}/sitemap.xml`)
    p.push(
      `${at}: Sitemap line is ${JSON.stringify(maps)}, expected ${siteOrigins[site]}/sitemap.xml`,
    );
  for (const line of lines)
    if (!/^(user-agent|allow|disallow|sitemap|crawl-delay|#)/i.test(line))
      p.push(`${at}: unusable line ${JSON.stringify(line)}`);
  return p;
}

export function checkManifest(site: Site, text: string, themeColor: string) {
  const p: Problems = [];
  const at = `app ${site} manifest`;
  let manifest: any;
  try {
    manifest = JSON.parse(text);
  } catch (error) {
    return [`${at}: not JSON (${error})`];
  }
  if (manifest.display !== "browser")
    p.push(
      `${at}: display is ${JSON.stringify(manifest.display)}, expected "browser" (no app-shell claim)`,
    );
  for (const key of ["theme_color", "background_color"])
    if (String(manifest[key]).toLowerCase() !== themeColor.toLowerCase())
      p.push(`${at}: ${key} is ${manifest[key]}, expected ${themeColor}`);
  if (
    !Array.isArray(manifest.icons) ||
    !manifest.icons.length ||
    manifest.icons.some((i: any) => !i.src)
  )
    p.push(`${at}: icons are missing or have no src`);
  if (!manifest.name || !manifest.start_url)
    p.push(`${at}: name or start_url missing`);
  return p;
}

export interface RssItem {
  title: string;
  link: string;
  guid: string;
  pubDate: string;
}

export function checkRss(
  site: Site,
  xml: string,
  sitemapLocs: string[],
  now = new Date(),
) {
  const p: Problems = [];
  const at = `app ${site} rss.xml`;
  const items: RssItem[] = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(
    (m) => {
      const field = (name: string) =>
        decode(
          new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`)
            .exec(m[1]!)?.[1]
            ?.trim() ?? "",
        );
      return {
        title: field("title"),
        link: field("link"),
        guid: field("guid"),
        pubDate: field("pubDate"),
      };
    },
  );
  if (!/^<\?xml/.test(xml) || !/<rss\b[^>]*version="2\.0"/.test(xml))
    p.push(`${at}: not an RSS 2.0 document`);
  const channelLink = /<channel>[\s\S]*?<link>([^<]*)<\/link>/.exec(xml)?.[1];
  if (channelLink !== siteOrigins[site])
    p.push(
      `${at}: channel link is ${channelLink}, expected ${siteOrigins[site]}`,
    );
  if (
    !new RegExp(
      `<atom:link href="${siteOrigins[site]}/rss\\.xml" rel="self"`,
    ).test(xml)
  )
    p.push(`${at}: self link is not ${siteOrigins[site]}/rss.xml`);
  if (!items.length) p.push(`${at}: no items`);
  for (const item of items) {
    if (
      !item.link.startsWith(`${siteOrigins[site]}/posts/`) ||
      badHost(item.link)
    )
      p.push(`${at}: item link ${item.link} is not a production post URL`);
    if (item.guid !== item.link)
      p.push(`${at}: guid differs from link for ${item.link}`);
    if (!sitemapLocs.includes(item.link))
      p.push(`${at}: ${item.link} is not in the sitemap`);
    const date = Date.parse(item.pubDate);
    if (Number.isNaN(date))
      p.push(
        `${at}: ${item.link} pubDate ${JSON.stringify(item.pubDate)} is not a date`,
      );
    else if (date > now.getTime())
      p.push(`${at}: ${item.link} pubDate is in the future`);
  }
  return { problems: p, items };
}

export interface JsonLdContext {
  site: Site;
  path: string;
  loc: string;
  html: string;
  /** Sitemap lastmod for this page, if any. */
  lastmod?: string;
  /** Every sitemap URL of this app. */
  sitemapLocs: string[];
  /** RSS items (dump only). */
  rss?: RssItem[];
}

/** What each page class publishes; other pages need none. */
export function expectedTypes(site: Site, path: string): string[] | undefined {
  if (path === "/")
    return {
      root: ["Person", "WebSite"],
      dump: ["WebSite", "Blog"],
      docs: ["WebSite"],
      lab: ["WebSite"],
    }[site];
  if (site === "dump" && path.startsWith("/posts/")) return ["BlogPosting"];
  if (site === "docs" && !["/search/", "/terms/", "/privacy/"].includes(path))
    return ["TechArticle", "BreadcrumbList"];
  return undefined;
}

const urlKeys = new Set(["@id", "url", "item", "image", "sameAs"]);

export function checkJsonLd(ctx: JsonLdContext) {
  const { site, path, loc, lastmod } = ctx;
  const p: Problems = [];
  const at = where(site, path);
  const doc = parseDocument(ctx.html);
  const expected = expectedTypes(site, path);
  const nodes: any[] = [];
  doc.jsonLd.forEach((block, i) => {
    if (block.error)
      return void p.push(
        `${at}: JSON-LD block ${i + 1} is not valid JSON (${block.error})`,
      );
    if (block.json["@context"] !== "https://schema.org")
      p.push(
        `${at}: JSON-LD @context is ${JSON.stringify(block.json["@context"])}`,
      );
    if (!Array.isArray(block.json["@graph"]))
      return void p.push(`${at}: JSON-LD has no @graph array`);
    nodes.push(...block.json["@graph"]);
  });
  if (expected) {
    const types = nodes.map((n) => n["@type"]);
    if (
      JSON.stringify([...types].sort()) !== JSON.stringify([...expected].sort())
    )
      p.push(`${at}: JSON-LD types are [${types}], expected [${expected}]`);
  }

  const walk = (value: any, key = "") => {
    if (Array.isArray(value)) return value.forEach((v) => walk(v, key));
    if (typeof value === "string" && urlKeys.has(key)) {
      const ok =
        value === GITHUB_PROFILE ||
        (/^https:\/\//.test(value) &&
          !badHost(value) &&
          origins.includes(new URL(value).origin));
      if (!ok)
        p.push(`${at}: JSON-LD ${key} is not a production URL: ${value}`);
    } else if (value && typeof value === "object")
      for (const [k, v] of Object.entries(value)) walk(v, k);
  };
  walk(nodes);

  const person = (node: any, label: string) => {
    if (
      node?.["@id"] !== identity.id ||
      node.name !== identity.name ||
      node.url !== identity.url
    )
      p.push(`${at}: ${label} is not the shared person ${identity.id}`);
  };
  for (const node of nodes) {
    if (node["@type"] === "Person") {
      if (!(site === "root" && path === "/"))
        p.push(
          `${at}: the full Person node belongs only on the root home page`,
        );
      person(node, "Person");
    }
    if (node.author) {
      if (site === "docs" || site === "lab")
        p.push(
          `${at}: ${node["@type"]} declares an author, which ${site} does not publish`,
        );
      else person(node.author, `${node["@type"]} author`);
    }
    if (node.publisher)
      p.push(
        `${at}: ${node["@type"]} declares a publisher, which no page publishes`,
      );
  }

  const canonical = doc.canonicals[0] ?? loc;
  const og = (key: string) => doc.meta.get(key)?.[0];
  const title = doc.titles[0];
  const description = doc.meta.get("description")?.[0];
  const node = (type: string) => nodes.find((n) => n["@type"] === type);

  const post = node("BlogPosting");
  if (post) {
    if (post.headline && `${post.headline} — dump` !== title)
      p.push(
        `${at}: BlogPosting headline ${JSON.stringify(post.headline)} does not match the page title ${JSON.stringify(title)}`,
      );
    if (post.description !== description)
      p.push(
        `${at}: BlogPosting description differs from the meta description`,
      );
    if (
      !/^\d{4}-\d\d-\d\d$/.test(post.datePublished ?? "") ||
      Number.isNaN(Date.parse(post.datePublished))
    )
      p.push(
        `${at}: BlogPosting datePublished ${JSON.stringify(post.datePublished)} is not a date`,
      );
    // Posts only have a publication date today. dateModified and sitemap
    // lastmod are both an explicit modification date, or both absent.
    if ((post.dateModified ?? undefined) !== (lastmod ?? undefined))
      p.push(
        `${at}: BlogPosting dateModified ${post.dateModified} and sitemap lastmod ${lastmod} must both come from an explicit modification date`,
      );
    if (post.dateModified && post.dateModified === post.datePublished)
      p.push(
        `${at}: dateModified repeats datePublished; a publication date is not a modification date`,
      );
    if (
      norm(post.url) !== norm(canonical) ||
      norm(post.mainEntityOfPage?.["@id"]) !== norm(canonical)
    )
      p.push(
        `${at}: BlogPosting url/mainEntityOfPage differ from canonical ${canonical}`,
      );
    if (post.isPartOf?.["@id"] !== `${siteOrigins.dump}/#blog`)
      p.push(`${at}: BlogPosting is not part of ${siteOrigins.dump}/#blog`);
    if (post.image !== og("og:image"))
      p.push(`${at}: BlogPosting image differs from og:image`);
    if (lastmod && lastmod.slice(0, 10) === post.datePublished)
      p.push(
        `${at}: sitemap lastmod ${lastmod} is the publication date, which is not a modification date`,
      );
    const item = ctx.rss?.find((i) => norm(i.link) === norm(canonical));
    if (ctx.rss) {
      if (!item) p.push(`${at}: the post is not in the RSS feed`);
      else {
        if (`${item.title} — dump` !== title)
          p.push(
            `${at}: RSS title ${JSON.stringify(item.title)} differs from the page`,
          );
        if (
          new Date(item.pubDate).toISOString().slice(0, 10) !==
          post.datePublished
        )
          p.push(
            `${at}: RSS pubDate ${item.pubDate} does not match datePublished ${post.datePublished}`,
          );
      }
    }
  }

  const blog = node("Blog");
  if (blog && blog["@id"] !== `${siteOrigins.dump}/#blog`)
    p.push(`${at}: Blog @id is ${blog["@id"]}`);
  const website = node("WebSite");
  if (website && website["@id"] !== `${siteOrigins[site]}/#website`)
    p.push(`${at}: WebSite @id is ${website["@id"]}`);

  const article = node("TechArticle");
  if (article) {
    if (`${article.headline} — docs` !== title)
      p.push(
        `${at}: TechArticle headline ${JSON.stringify(article.headline)} does not match the page title ${JSON.stringify(title)}`,
      );
    if (article.description !== description)
      p.push(
        `${at}: TechArticle description differs from the meta description`,
      );
    if (
      norm(article.url) !== norm(canonical) ||
      norm(article.mainEntityOfPage?.["@id"]) !== norm(canonical)
    )
      p.push(
        `${at}: TechArticle url/mainEntityOfPage differ from canonical ${canonical}`,
      );
    if (article.image !== og("og:image"))
      p.push(`${at}: TechArticle image differs from og:image`);
    if (article.isPartOf?.["@id"] !== `${siteOrigins.docs}/#website`)
      p.push(`${at}: TechArticle is not part of the docs WebSite`);
    if (article.datePublished)
      p.push(
        `${at}: TechArticle has datePublished, but docs have no publication date`,
      );
    // dateModified and sitemap lastmod are both the explicit lastUpdated, or both absent.
    if ((article.dateModified ?? undefined) !== (lastmod ?? undefined))
      p.push(
        `${at}: TechArticle dateModified ${article.dateModified} and sitemap lastmod ${lastmod} must both come from an explicit lastUpdated`,
      );
    if (article.dateModified && Date.parse(article.dateModified) > Date.now())
      p.push(`${at}: dateModified is in the future`);
  } else if (site !== "dump" && "dateModified" in Object.assign({}, ...nodes))
    p.push(`${at}: dateModified outside a documentation article`);

  const crumbs = node("BreadcrumbList");
  if (crumbs) {
    const items = crumbs.itemListElement ?? [];
    if (!items.length) p.push(`${at}: BreadcrumbList is empty`);
    items.forEach((item: any, i: number) => {
      if (item.position !== i + 1)
        p.push(
          `${at}: breadcrumb position ${item.position} at index ${i}, expected ${i + 1}`,
        );
      if (!item.name) p.push(`${at}: breadcrumb ${i + 1} has no name`);
      if (!ctx.sitemapLocs.map(norm).includes(norm(item.item)))
        p.push(
          `${at}: breadcrumb ${item.item} is not a page in the sitemap (invented folder URL?)`,
        );
    });
    if (items.length && norm(items[items.length - 1].item) !== norm(canonical))
      p.push(`${at}: the last breadcrumb is not the current page`);
    if (items.length && norm(items[0].item) !== `${siteOrigins[site]}/`)
      p.push(`${at}: the first breadcrumb is not the site home`);
  }
  return p;
}
