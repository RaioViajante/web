import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { base, isolate, viewports } from "./support";

test("Portuguese Lab publishes only the real Sweep counterpart with active LANG", async ({
  page,
}) => {
  await isolate(page, []);
  await page.setViewportSize(viewports.mobile);
  await page.goto(`${base("lab")}/pt/`);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(
    page.locator('[data-testid="experiment-list"] article'),
  ).toHaveCount(1);
  await expect(page.getByTestId("experiment-list")).toContainText(
    "classificador de arquivos",
  );
  await expect(page.getByTestId("experiment-list")).not.toContainText(
    "execution states",
  );
  await expect(page.getByTestId("language-control")).toHaveAttribute(
    "data-lang-state",
    "link",
  );
  await expect(page.getByTestId("language-control")).toContainText("LANG PT");
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/",
  );
  await page.getByTestId("language-counterpart").press("Enter");
  await expect(page).toHaveURL(`${base("lab")}/`);
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/pt/",
  );
  await page.goto(`${base("lab")}/pt/`);
  await page.getByTestId("filter-done").click();
  await expect(page.getByTestId("filter-result")).toHaveText("0 experimentos");
  await page.getByTestId("filter-all").click();
  await expect(page.getByTestId("filter-result")).toHaveText("1 experimento");
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
  await expect(page.getByTestId("main-content")).toContainText("executa aqui");
  await expect(page.getByTestId("summary")).toContainText("Imagens 1");
  await page.getByTestId("filenames").fill("photo.png\nREADME");
  await page.getByTestId("classify").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("summary")).toHaveText(
    "2 arquivos classificados · Imagens 1 · Documentos 0 · Arquivos compactados 0 · Outros 1",
  );
  await expect(page.getByTestId("classifier-results")).toContainText(
    "~/Downloads/Images/photo.png",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://lab.raioviajante.com/experiments/filename-classifier/",
  );
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/experiments/filename-classifier/",
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Portuguese search is locale-pure and missing translations use the English 404 fallback", async ({
  page,
}) => {
  await isolate(page, []);
  await page.goto(`${base("lab")}/pt/search/`);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(
    page.locator('[data-testid="search-page"][data-search-locale="pt-BR"]'),
  ).toBeVisible();
  await expect(page.getByTestId("search-page")).toHaveAttribute(
    "data-search-state",
    "ready",
  );
  await page.getByTestId("search-input").fill("classificador");
  await expect(page.getByTestId("search-result")).toHaveCount(1);
  await expect(page.getByTestId("search-result")).toContainText(
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
  for (const path of [
    "/experiments/execution-states/",
    "/experiments/boot-sector/",
  ]) {
    await page.goto(base("lab") + path);
    await expect(page.getByTestId("language-control")).toHaveAttribute(
      "data-lang-state",
      "disclosure",
    );
    await expect(page.getByTestId("language-home")).toHaveAttribute(
      "href",
      "/pt/",
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="pt-BR"]'),
    ).toHaveCount(0);
  }
});

test("every Portuguese Lab suggestion finds a published Portuguese experiment in both scopes", async ({
  page,
}) => {
  await isolate(page, []);
  await page.goto(`${base("lab")}/pt/search/`);
  await expect(page.getByTestId("search-page")).toHaveAttribute(
    "data-search-state",
    "ready",
  );
  for (const scope of ["site", "everywhere"]) {
    await page.locator(`[data-testid="search-scope-${scope}"]`).click();
    await page.getByTestId("search-input").fill("no-match-for-lab");
    const suggestions = page.locator(
      `[data-testid="search-suggestions-${scope}"] [data-testid="search-suggestion"]`,
    );
    await expect(suggestions.first()).toBeVisible();
    const terms = await suggestions.allTextContents();
    expect(terms).toEqual(["classificador de arquivos", "sweep"]);
    for (const [index, term] of terms.entries()) {
      const button = page
        .locator(`[data-testid="search-suggestions-${scope}"]`)
        .getByTestId("search-suggestion")
        .and(
          page
            .locator(`[data-testid="search-suggestions-${scope}"]`)
            .getByRole("button", { name: term, exact: true }),
        );
      if (index === 0) {
        await button.focus();
        await expect(button).toBeFocused();
        await page.keyboard.press("Enter");
      } else await button.click();
      await expect(page.getByTestId("search-input")).toHaveValue(term);
      await expect(page.getByTestId("search-input")).toBeFocused();
      await expect(page.getByTestId("search-result").first()).toHaveAttribute(
        "href",
        `${base("lab")}/pt/experiments/classificador-de-arquivos/`,
      );
      await page.getByTestId("search-input").fill("no-match-for-lab");
    }
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Lab avatar keeps language-specific names with and without reduced motion", async ({
  page,
}) => {
  await isolate(page, []);
  for (const [path, interactive, reduced] of [
    ["/", "Flip RaioViajante avatar", "Illustrated RaioViajante character"],
    [
      "/pt/",
      "Girar o avatar do RaioViajante",
      "Personagem ilustrado do RaioViajante",
    ],
  ] as const) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(base("lab") + path);
    const avatar = page.getByTestId("avatar-toggle");
    await expect(avatar).toHaveAttribute("aria-label", interactive);
    await avatar.focus();
    await expect(avatar).toBeFocused();
    expect(
      await avatar.evaluate((button) => getComputedStyle(button).outlineStyle),
    ).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(avatar).toHaveClass(/is-flipping/);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(avatar).toHaveAttribute("aria-label", reduced);
    await expect(avatar).toBeDisabled();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(avatar).toHaveAttribute("aria-label", interactive);
    await expect(avatar).toBeEnabled();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
