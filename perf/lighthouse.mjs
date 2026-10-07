import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { ports, startServers } from "../security/local-servers.mjs";
import { pages, profiles } from "./pages.mjs";

// Synthetic (laboratory) Lighthouse runs against the local production builds.
// They are not real-user Core Web Vitals. The browser is the Chromium that
// Playwright already manages; Lighthouse attaches to it over the debugging port.
export async function measure({ runs = 1, only, log = console.log } = {}) {
  const { stop } = await startServers();
  const results = [];
  try {
    for (const page of pages) {
      if (only && !only(page)) continue;
      for (const profile of profiles) {
        const samples = [];
        for (let run = 0; run < runs; run++)
          samples.push(await one(page, profile));
        results.push({ ...page, profile, samples });
        log(
          `${page.app} ${page.name} ${profile}: perf ${samples.map((s) => s.scores.performance).join("/")}`,
        );
      }
    }
  } finally {
    stop();
  }
  return results;
}

async function one(page, profile) {
  const port = 9400 + Math.floor(Math.random() * 400);
  const browser = await chromium.launch({
    headless: true,
    args: [`--remote-debugging-port=${port}`],
  });
  try {
    const url = `http://127.0.0.1:${ports[page.app]}${page.path}`;
    const flags = {
      port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    };
    // Lighthouse's trace engine prints a stack when it cannot compute LCP
    // (NO_LCP); the audit already reports it, so keep the output readable.
    const originals = {
      error: console.error,
      warn: console.warn,
      log: console.log,
    };
    for (const name of Object.keys(originals))
      console[name] = (...a) =>
        String(a[0]).includes("LanternError")
          ? undefined
          : originals[name](...a);
    let lhr;
    try {
      ({ lhr } = await lighthouse(
        url,
        flags,
        profile === "desktop" ? desktopConfig : undefined,
      ));
    } finally {
      Object.assign(console, originals);
    }
    await mkdir(new URL("./.results/reports/", import.meta.url), {
      recursive: true,
    });
    await writeFile(
      new URL(
        `./.results/reports/${page.app}-${page.name}-${profile}.json`,
        import.meta.url,
      ),
      JSON.stringify(lhr),
    );
    return summarize(lhr, ports[page.app]);
  } finally {
    await browser.close();
  }
}

const score = (c) => Math.round((c?.score ?? 0) * 100);
const num = (audit, digits = 0) =>
  Number.isFinite(audit.numericValue)
    ? Number(audit.numericValue.toFixed(digits))
    : null;
function summarize(lhr, port) {
  const a = lhr.audits;
  const items = a["network-requests"].details.items;
  const local = (url) => new URL(url).origin === `http://127.0.0.1:${port}`;
  const by = (type, first = true) => {
    const rows = items.filter(
      (i) => i.resourceType === type && (!first || local(i.url)),
    );
    return {
      transfer: rows.reduce((n, i) => n + (i.transferSize ?? 0), 0),
      size: rows.reduce((n, i) => n + (i.resourceSize ?? 0), 0),
      count: rows.length,
    };
  };
  const firstParty = items.filter((i) => local(i.url));
  return {
    scores: Object.fromEntries(
      Object.entries(lhr.categories).map(([k, v]) => [k, score(v)]),
    ),
    metrics: {
      fcp: num(a["first-contentful-paint"]),
      lcp: num(a["largest-contentful-paint"]),
      tbt: num(a["total-blocking-time"]),
      cls: num(a["cumulative-layout-shift"], 3),
      si: num(a["speed-index"]),
    },
    weight: {
      total: firstParty.reduce((n, i) => n + (i.transferSize ?? 0), 0),
      requests: firstParty.length,
      thirdPartyRequests: items.length - firstParty.length,
      script: by("Script"),
      stylesheet: by("Stylesheet"),
      font: by("Font"),
      image: by("Image"),
      document: by("Document"),
    },
    lighthouse: lhr.lighthouseVersion,
    runWarnings: lhr.runWarnings,
  };
}
