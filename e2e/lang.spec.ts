import { expect, test } from "@playwright/test";
import { base, isolate, searchPath, sites, viewports } from "./support";

// While Portuguese participation is off everywhere, LANG is a status on every
// page. These specs check that, the mobile utility row, and the one piece of
// browser behavior LANG has: carrying `q` (and nothing else) to the other
// search page.
for (const site of sites)
  test(`${site}: LANG is a noninteractive "LANG EN" status and the utility row fits a phone`, async ({
    page,
  }) => {
    await isolate(page, []);
    await page.setViewportSize(viewports.mobile);
    await page.goto(base(site) + "/");
    const lang = page.locator(".rv-sound .rv-lang");
    await expect(lang).toHaveCount(1);
    await expect(lang).toHaveAttribute("data-lang-state", "status");
    await expect(lang).toContainText("LANG EN");
    await expect(lang.locator("a, button, details, summary")).toHaveCount(0);
    await expect(lang.locator("[aria-disabled]")).toHaveCount(0);
    const toggle = page.locator("[data-sound-toggle]");
    const box = (await toggle.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    // No Portuguese route is advertised.
    await expect(page.locator('a[hreflang="pt-BR"]')).toHaveCount(0);
  });

test("a search-page LANG link carries q and nothing else", async ({ page }) => {
  await isolate(page, []);
  await page.goto(
    base("docs") + searchPath.docs + "?scope=everywhere&utm=x#frag",
  );
  // Today the control is a status; stand in for the link a participating app
  // would render, and let the real shared script enhance it.
  await page.evaluate(() => {
    document.querySelector(".rv-lang")!.replaceChildren(
      Object.assign(document.createElement("a"), {
        href: "/pt/search/",
        textContent: "Português (Brasil)",
      }),
    );
    document
      .querySelector("a[href='/pt/search/']")!
      .setAttribute("data-lang-search", "");
  });
  const link = page.locator("a[data-lang-search]");
  await page.locator("[data-search-input]").fill("configuração nova");
  await expect(link).toHaveAttribute(
    "href",
    "/pt/search/?q=configura%C3%A7%C3%A3o+nova",
  );
  await page.locator("[data-search-input]").fill("");
  await expect(link).toHaveAttribute("href", "/pt/search/");
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
});
