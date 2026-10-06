import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { siteOrigins } from "../security/headers.ts";
import { ports, startServers } from "../security/local-servers.mjs";
import { auditSite, expectedThemeColor } from "./audit.mjs";
import { checkUniqueness, parseDocument } from "./metadata-policy.ts";

// Runtime SEO verification of the four built apps over local HTTP. Every
// document comes from the app's own sitemap, so this covers the dynamically
// rendered Root and Dump pages that build output alone cannot. Run
// `pnpm seo:verify` after `pnpm -r build` (NEXT_PUBLIC_SITE_URL=
// https://dump.raioviajante.com). Not part of `pnpm validate`: it needs local
// sockets. Exit codes: 0 pass, 1 contract violation, 2 apps could not start.
const sites = Object.keys(ports);
const local = (site, path) => `http://127.0.0.1:${ports[site]}${path}`;
const localFor = (url) => {
  const { origin, pathname, search } = new URL(url);
  const site = sites.find((s) => siteOrigins[s] === origin);
  return site ? local(site, pathname + search) : undefined;
};
const searchPath = {
  root: "/search",
  dump: "/search",
  docs: "/search/",
  lab: "/search/",
};
const problems = [];
const fail = (message) => problems.push(message);

const { stop } = await startServers();
process.on("exit", stop);
const themeColor = await expectedThemeColor();

const get = async (site, path, init) => {
  const response = await fetch(local(site, path), {
    redirect: "manual",
    ...init,
  });
  return {
    response,
    text: response.headers.get("content-type")?.match(/text|json|xml/)
      ? await response.text()
      : (await response.arrayBuffer(), ""),
  };
};
async function text(site, path, contentType) {
  const { response, text } = await get(site, path);
  if (response.status !== 200)
    fail(`app ${site} ${path}: HTTP ${response.status}`);
  const type = response.headers.get("content-type") ?? "";
  if (!contentType.test(type))
    fail(
      `app ${site} ${path}: content type ${JSON.stringify(type)} does not match ${contentType}`,
    );
  return text;
}

const allPages = [];
const images = new Map();
const assets = new Map();
let documents = 0;
for (const site of sites) {
  const files = {
    sitemap: await text(site, "/sitemap.xml", /xml/),
    robots: await text(site, "/robots.txt", /^text\/plain/),
    manifest: await text(site, "/manifest.webmanifest", /manifest\+json|json/),
    rss:
      site === "dump"
        ? await text(site, "/rss.xml", /^application\/rss\+xml/)
        : undefined,
  };
  const result = await auditSite({
    site,
    files,
    themeColor,
    html: async (path) => {
      const { response, text } = await get(site, path);
      if (response.status !== 200) {
        fail(`app ${site} page ${path}: HTTP ${response.status}`);
        return undefined;
      }
      if (!/^text\/html/.test(response.headers.get("content-type") ?? ""))
        fail(`app ${site} page ${path}: not served as HTML`);
      return text;
    },
  });
  problems.push(...result.problems);
  allPages.push(...result.pages);
  documents += result.pages.length;

  for (const page of result.pages) {
    const doc = parseDocument(page.html);
    for (const key of ["og:image", "twitter:image"]) {
      const url = doc.meta.get(key)?.[0];
      if (url) images.set(url, `app ${site} page ${page.path}`);
    }
    for (const link of doc.links)
      if (
        /^(icon|apple-touch-icon|manifest)$/.test(link.rel) ||
        link.rel.includes("icon")
      )
        assets.set(`${site} ${link.href}`, {
          site,
          href: link.href,
          rel: link.rel,
        });
  }
  for (const icon of JSON.parse(files.manifest || "{}").icons ?? [])
    assets.set(`${site} ${icon.src}`, {
      site,
      href: icon.src,
      rel: "manifest icon",
    });

  // Search: one canonical, whatever the query.
  const search = searchPath[site];
  const { text: searched } = await get(
    site,
    `${search}?q=seo%20check&utm_source=x`,
  );
  const canonical = parseDocument(searched).canonicals;
  if (
    canonical.length !== 1 ||
    canonical[0] !== `${siteOrigins[site]}${search}`
  )
    fail(
      `app ${site} page ${search}?q=…: canonical is ${JSON.stringify(canonical)}, expected ${siteOrigins[site]}${search}`,
    );
  if (!result.entries.some((e) => e.loc === `${siteOrigins[site]}${search}`))
    fail(`app ${site} sitemap: ${search} is missing`);

  // Missing routes: 404, noindex, no canonical, not in the sitemap.
  for (const path of site === "dump"
    ? ["/seo-missing-check", "/posts/seo-missing-check"]
    : ["/seo-missing-check"]) {
    const { response, text: body } = await get(site, path);
    if (response.status !== 404)
      fail(
        `app ${site} ${path}: missing page answered HTTP ${response.status}, expected 404`,
      );
    if (result.entries.some((e) => new URL(e.loc).pathname === path))
      fail(`app ${site} sitemap: contains the missing page ${path}`);
    if (site === "root" || site === "dump") {
      const doc = parseDocument(body);
      if (!(doc.meta.get("robots") ?? []).some((v) => /noindex/.test(v)))
        fail(`app ${site} ${path}: 404 page is not noindex`);
      if (doc.canonicals.length)
        fail(
          `app ${site} ${path}: 404 page declares a canonical ${doc.canonicals[0]}`,
        );
    }
  }
  if (site === "docs" || site === "lab") {
    // Astro preview does not serve 404.html for unknown paths, so read the built page.
    const built = await readFile(
      new URL(`../apps/${site}/dist/404.html`, import.meta.url),
      "utf8",
    ).catch(() => "");
    const doc = parseDocument(built);
    if (!(doc.meta.get("robots") ?? []).some((v) => /noindex/.test(v)))
      fail(`app ${site} 404.html: not noindex`);
    if (doc.canonicals.length)
      fail(`app ${site} 404.html: declares a canonical`);
  }
}

problems.push(...checkUniqueness(allPages));

for (const [url, where] of images) {
  const target = localFor(url);
  if (!target) {
    fail(`${where}: social image ${url} is not on a RaioViajante host`);
    continue;
  }
  const response = await fetch(target);
  const type = response.headers.get("content-type") ?? "";
  if (response.status !== 200 || !/^image\//.test(type))
    fail(
      `${where}: social image ${url} answered HTTP ${response.status} ${type}`,
    );
  await response.arrayBuffer();
}
for (const { site, href, rel } of assets.values()) {
  const response = await fetch(new URL(href, local(site, "/")));
  const type = response.headers.get("content-type") ?? "";
  const wanted = rel === "manifest" ? /json/ : /^image\//;
  if (response.status !== 200 || !wanted.test(type))
    fail(
      `app ${site}: ${rel} ${href} answered HTTP ${response.status} ${type}`,
    );
  await response.arrayBuffer();
}

stop();
const unique = (a) => [...new Set(a)];
console.log(
  `${documents} sitemap documents (${sites.map((s) => `${s} ${allPages.filter((p) => p.site === s).length}`).join(", ")}), ${images.size} social images, ${assets.size} icon/manifest URLs checked.`,
);
if (problems.length) {
  console.error(
    `\nFAILED (${problems.length}):\n${unique(problems)
      .map((p) => `  - ${p}`)
      .join("\n")}`,
  );
  process.exitCode = 1;
} else console.log("SEO contract holds.");
