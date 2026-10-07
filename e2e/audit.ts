import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
import { base, isolate, missingPath, watchHealth, type Site } from "./support";

export async function audit(
  page: Page,
  site: Site,
  path: string,
  width: number,
  beforeGoto?: (page: Page) => Promise<void>,
) {
  const problems: string[] = [];
  const at = `[${site}] ${path} [${width}px]`;
  const health = watchHealth(
    page,
    path === missingPath ? base(site) + path : undefined,
  );
  const external: string[] = [];
  await isolate(page, external);
  await beforeGoto?.(page);

  const response = await page.goto(base(site) + path, { waitUntil: "load" });
  const missing = path === missingPath;
  if (missing ? response?.status() !== 404 : response?.status() !== 200)
    // Astro's preview answers an unknown path with its own 404; Next serves the app's.
    problems.push(
      `${at}: HTTP ${response?.status()}, expected ${missing ? 404 : 200}`,
    );
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => window.innerWidth)).toBe(width);

  // Accessibility first, before anything scrolls and triggers lazy third-party UI.
  const axe = await new AxeBuilder({ page }).analyze();
  for (const violation of axe.violations)
    for (const node of violation.nodes.slice(0, 3))
      problems.push(
        `${at}: axe ${violation.id} (${violation.impact}): ${node.target.join(" ")} — ${violation.help}`,
      );

  // One h1 and a main landmark on real pages (the 404 and search included).
  const structure = await page.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    main: document.querySelectorAll("main, [role=main]").length,
  }));
  if (structure.h1 !== 1) problems.push(`${at}: ${structure.h1} h1 elements`);
  if (structure.main !== 1)
    problems.push(`${at}: ${structure.main} main landmarks`);

  // Overflow: the document must not scroll sideways, and nothing may poke out
  // of the viewport unless a scrollable container clips it (code blocks).
  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const scrolls = (el: Element) =>
      /(auto|scroll|hidden|clip)/.test(getComputedStyle(el).overflowX);
    const offenders: string[] = [];
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.right <= vw + 1) continue;
      let clipped = false;
      for (
        let a = el.parentElement;
        a && a !== document.documentElement;
        a = a.parentElement
      )
        if (a !== document.body && scrolls(a)) {
          clipped = true;
          break;
        }
      if (!clipped && getComputedStyle(el).position !== "fixed")
        offenders.push(
          `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""} right=${Math.round(r.right)}`,
        );
    }
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: vw,
      bodyHidden:
        scrolls(document.body) &&
        getComputedStyle(document.body).overflowX !== "visible",
      offenders: offenders.slice(0, 3),
    };
  });
  if (overflow.scrollWidth > overflow.clientWidth)
    problems.push(
      `${at}: horizontal document overflow: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`,
    );
  if (overflow.offenders.length)
    problems.push(
      `${at}: content outside the viewport: ${overflow.offenders.join(", ")}`,
    );

  // Scroll to the bottom so lazy images load, then look for broken ones.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((img) => img.complete && img.naturalWidth === 0 && img.currentSrc)
      .map((img) => img.currentSrc),
  );
  for (const src of broken) problems.push(`${at}: broken image ${src}`);

  for (const message of health) problems.push(`${at}: ${message}`);
  for (const url of external)
    problems.push(`${at}: non-local request blocked: ${url}`);
  return problems;
}
