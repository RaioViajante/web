import { expect, test } from "@playwright/test";
import { audit } from "./audit";
import { base } from "./support";

test("Portuguese Docs navigation, search and pre-activation LANG stay locale-pure", async ({ page }) => {
  for (const path of ["/pt/", "/pt/projetos/sweep/", "/pt/search/"]) {
    await page.goto(base("docs") + path);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.locator('.rv-lang[data-lang-state="status"]')).toBeVisible();
    await expect(page.locator(".rv-lang a, .rv-lang summary")).toHaveCount(0);
    await expect(page.locator('.rv-nav[data-nav="pages"] a')).toHaveCount(3);
    await expect(page.locator('.rv-nav[data-nav="pages"] a[href^="/pt/"]')).toHaveCount(3);
  }
  await page.goto(base("docs") + "/pt/search/?q=organização");
  await expect(page.locator('[data-search-locale="pt-BR"]')).toBeVisible();
  await expect(page.locator('a[href="/pt/projetos/sweep/"]')).toBeVisible();
  await expect(page.locator('a[href*="/projects/sweep/cli/"]')).toHaveCount(0);
});

test("Portuguese Docs pages remain accessible at mobile and desktop widths", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/pt/", "/pt/projetos/sweep/", "/pt/search/"]) {
      expect(await audit(page, "docs", path, width), `${path} at ${width}px`).toEqual([]);
    }
  }
});

test("Portuguese avatar label remains localized with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base("docs") + "/pt/");
  await expect(page.locator(".avatar-coin")).toHaveAttribute("aria-label", "Personagem ilustrado do RaioViajante");
});
