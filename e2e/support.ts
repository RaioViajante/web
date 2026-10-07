import type { ConsoleMessage, Page } from "@playwright/test";
import { ports } from "../security/local-servers.mjs";

export type Site = "root" | "dump" | "docs" | "lab";
export const sites = Object.keys(ports) as Site[];
export const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

export const base = (site: Site) => `http://127.0.0.1:${ports[site]}`;

// Where each app serves its search page (not in the sitemaps: it is noindex).
export const searchPath: Record<Site, string> = {
  root: "/search",
  dump: "/search",
  docs: "/search/",
  lab: "/search/",
};
export const missingPath = "/e2e-missing-page";

/** Every document in the app's own sitemap, plus its search page. No second route list. */
export async function inventory(site: Site) {
  const xml = await (await fetch(`${base(site)}/sitemap.xml`)).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, loc]) => new URL(loc!).pathname,
  );
  if (!paths.length) throw new Error(`${site}: sitemap has no URLs`);
  return { paths, search: searchPath[site] };
}

const localHosts = new Set(sites.map((site) => new URL(base(site)).origin));

/**
 * Keeps the suite deterministic and offline. giscus's script is answered with
 * an empty file (the comments widget is third-party and out of scope; our own
 * placeholder and failure UI are tested separately); anything else that is not
 * a local app is aborted and reported.
 */
export async function isolate(page: Page, external: string[]) {
  await page.route(
    (url) => !localHosts.has(url.origin) && /^https?:$/.test(url.protocol),
    (route) => {
      const url = new URL(route.request().url());
      if (url.href === "https://giscus.app/client.js")
        return route.fulfill({
          status: 200,
          contentType: "text/javascript",
          body: "",
        });
      external.push(url.href);
      return route.abort("blockedbyclient");
    },
  );
}

/** Application console and page errors; each ignored message needs a narrow reason. */
export function watchHealth(page: Page, expectedMissing?: string) {
  const problems: string[] = [];
  page.on("pageerror", (error) =>
    problems.push(`page error: ${error.message}`),
  );
  page.on("console", (message: ConsoleMessage) => {
    if (message.type() !== "error" && message.type() !== "warning") return;
    // Reason: the browser logs "Failed to load resource ... 404" for the missing
    // page itself, which is the response the 404 test asks for. Only that exact
    // URL is ignored; a 404 for any asset on it is still reported.
    if (
      expectedMissing &&
      message.location().url === expectedMissing &&
      /Failed to load resource: .* 404/.test(message.text())
    )
      return;
    problems.push(
      `console.${message.type()}: ${message.text()} (${message.location().url})`,
    );
  });
  return problems;
}
