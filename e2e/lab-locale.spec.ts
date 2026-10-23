import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { base, isolate, viewports } from "./support";

test("Portuguese Lab publishes only the real Sweep counterpart, without activating LANG", async ({
  page,
}) => {
  await isolate(page, []);
  await page.setViewportSize(viewports.mobile);
  await page.goto(`${base("lab")}/pt/`);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator("[data-experiment-list] article")).toHaveCount(1);
  await expect(page.locator("[data-experiment-list]")).toContainText(
    "classificador de arquivos",
  );
  await expect(page.locator("[data-experiment-list]")).not.toContainText(
    "execution states",
  );
  await expect(page.locator(".rv-lang")).toHaveAttribute(
    "data-lang-state",
    "status",
  );
  await expect(page.locator(".rv-lang")).toContainText("LANG PT");
  await expect(page.locator(".rv-lang a, .rv-lang button")).toHaveCount(0);
  await page.locator('[data-filter="done"]').click();
  await expect(page.locator("[data-filter-result]")).toHaveText(
    "0 experimentos",
  );
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator("[data-filter-result]")).toHaveText(
    "1 experimento",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Portuguese classifier translates live output, preserves actual destination and keyboard access", async ({
  page,
}) => {
  await isolate(page, []);
  await page.setViewportSize(viewports.desktop);
  await page.goto(`${base("lab")}/pt/experiments/classificador-de-arquivos/`);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator("main")).toContainText("executa aqui");
  await expect(page.locator("[data-summary]")).toContainText("Imagens 1");
  await page.locator("#filenames").fill("photo.png\nREADME");
  await page.locator("[data-classify]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-summary]")).toHaveText(
    "2 arquivos classificados · Imagens 1 · Documentos 0 · Arquivos compactados 0 · Outros 1",
  );
  await expect(page.locator("tbody")).toContainText(
    "~/Downloads/Images/photo.png",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://lab.raioviajante.com/experiments/filename-classifier/",
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Portuguese search is locale-pure and missing translations use the English 404 fallback", async ({
  page,
}) => {
  await isolate(page, []);
  await page.goto(`${base("lab")}/pt/search/`);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator('[data-search-locale="pt-BR"]')).toBeVisible();
  await expect(page.locator("[data-search-page]")).toHaveAttribute(
    "data-search-state",
    "ready",
  );
  await page.locator("[data-search-input]").fill("classificador");
  await expect(page.locator("[data-search-result]")).toHaveCount(1);
  await expect(page.locator("[data-search-result]")).toContainText(
    "classificador de arquivos",
  );
  const index = await page.request.get(`${base("lab")}/pt/search-index.json`);
  expect(index.ok()).toBe(true);
  expect(await index.json()).toEqual([
    expect.objectContaining({
      contentId: "001",
      locale: "pt-BR",
      href: "https://lab.raioviajante.com/pt/experiments/classificador-de-arquivos/",
    }),
  ]);
  const missing = await page.request.get(
    `${base("lab")}/pt/experiments/execution-states/`,
  );
  expect(missing.status()).toBe(404);
  const html = await missing.text();
  expect(html).toContain('<html lang="en"');
  expect(html).toContain('name="robots" content="noindex, follow"');
  expect(html).not.toContain('rel="canonical"');
});
