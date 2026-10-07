import { chromium, devices } from "@playwright/test";
import { ports } from "../security/local-servers.mjs";

/**
 * Loads the page in Chromium (mobile emulation) and reports what the browser
 * itself says about its LCP, so Lighthouse failing to collect one can be told
 * apart from the page not having one. Feeds judgeBrowserLcp.
 */
export async function observeBrowserLcp({ app, path }) {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ ...devices["Moto G Power"] });
    const page = await context.newPage();
    const origin = `http://127.0.0.1:${ports[app]}`;
    const pageErrors = [];
    const failedRequests = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    page.on(
      "requestfailed",
      (r) => r.url().startsWith(origin) && failedRequests.push(r.url()),
    );
    page.on(
      "response",
      (r) =>
        r.url().startsWith(origin) &&
        r.status() >= 400 &&
        failedRequests.push(`${r.status()} ${r.url()}`),
    );
    await page.addInitScript(() => {
      window.__lcp = [];
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          window.__lcp.push({
            time: Math.round(e.startTime),
            tag: e.element?.tagName ?? "",
          });
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    const response = await page.goto(origin + path, { waitUntil: "load" });
    await page.waitForTimeout(2000);
    return {
      status: response?.status(),
      entries: await page.evaluate(() => window.__lcp),
      visibleText: await page.evaluate(
        () => document.querySelector("main")?.innerText.trim().length ?? 0,
      ),
      pageErrors,
      failedRequests,
    };
  } finally {
    await browser.close();
  }
}
