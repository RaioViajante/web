import { expect, test } from "@playwright/test";
import { base, isolate, searchPath } from "./support";

for (const { site, query, title, number } of [
  { site: "root", query: "setup", title: "setup", number: "06." },
  { site: "lab", query: "boot sector", title: "boot sector", number: "003" },
] as const) {
  test(`${site} preserves its supplied search number after filtering`, async ({
    page,
  }) => {
    await isolate(page, []);
    await page.goto(
      base(site) + searchPath[site] + "?q=" + encodeURIComponent(query),
    );
    const result = page
      .locator("[data-search-result]")
      .filter({ hasText: title });
    await expect(result).toHaveCount(1);
    await expect(result.locator(".rv-result__number")).toHaveText(number);
    const input = page.locator("[data-search-input]");
    await input.fill("no matching result");
    await expect(page.locator("[data-search-result]")).toHaveCount(0);
    await input.fill(query);
    await expect(result.locator(".rv-result__number")).toHaveText(number);
  });
}
