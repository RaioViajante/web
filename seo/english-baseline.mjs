import { readFile, writeFile } from "node:fs/promises";
import { startServers, ports } from "../security/local-servers.mjs";
import { securityTxtPath } from "../security/security-txt.ts";
import { checkSitemap } from "./metadata-policy.ts";
import { describeBaseline } from "./english-baseline.ts";

// Regenerates seo/english-baseline.json from the four built apps (`pnpm
// seo:baseline`, after `pnpm -r build` with NEXT_PUBLIC_SITE_URL=
// https://dump.raioviajante.com). Run it only for a deliberate change to the
// English public contract and review the diff: the baseline is the evidence
// that English URLs were preserved. It adds no entry that is not served now.
const file = new URL("./english-baseline.json", import.meta.url);
const sites = Object.keys(ports);
const endpoints = (site) => [
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/llms.txt",
  securityTxtPath,
  "/search-index.json",
  ...(site === "dump" ? ["/rss.xml"] : []),
];

const { stop } = await startServers();
const get = async (site, path) => {
  const response = await fetch(`http://127.0.0.1:${ports[site]}${path}`);
  if (response.status !== 200)
    throw new Error(`app ${site} ${path}: HTTP ${response.status}`);
  return response;
};
const baseline = {};
try {
  for (const site of sites) {
    const sitemap = checkSitemap(
      site,
      await (await get(site, "/sitemap.xml")).text(),
    );
    for (const path of endpoints(site)) await get(site, path);
    const index = await get(site, "/search-index.json");
    baseline[site] = describeBaseline(site, {
      sitemapLocs: sitemap.entries.map((e) => e.loc),
      endpoints: endpoints(site),
      searchPath: "/search-index.json",
      searchContentType: index.headers.get("content-type"),
      searchEntries: await index.json(),
    });
  }
} finally {
  stop();
}
const next = `${JSON.stringify(baseline, null, 2)}\n`;
const previous = await readFile(file, "utf8").catch(() => "");
if (next === previous) console.log("English baseline unchanged.");
else {
  await writeFile(file, next);
  console.log("English baseline written to seo/english-baseline.json.");
}
