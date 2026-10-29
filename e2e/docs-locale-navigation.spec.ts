import { expect, test, type Locator } from "@playwright/test";
import { audit } from "./audit";
import { base, isolate } from "./support";

/** Every Docs page that exists in both languages: English path, Portuguese path. */
const pairs = [
  ["/", "/pt/"],
  ["/projects/sweep/", "/pt/projetos/sweep/"],
  ["/projects/sweep/cli/", "/pt/projetos/sweep/cli/"],
  ["/raioviajante/design-language/", "/pt/raioviajante/linguagem-de-design/"],
  [
    "/raioviajante/repository-conventions/",
    "/pt/raioviajante/convencoes-de-repositorio/",
  ],
  ["/terms/", "/pt/terms/"],
  ["/privacy/", "/pt/privacy/"],
  ["/search/", "/pt/search/"],
] as const;

test("Portuguese Docs navigation and LANG use real counterparts", async ({
  page,
}) => {
  for (const [counterpart, path] of pairs) {
    await page.goto(base("docs") + path);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.locator('.rv-lang[data-lang-state="link"] a'),
    ).toHaveAttribute("href", counterpart);
    await expect(page.locator(".rv-lang a")).toHaveAttribute("hreflang", "en");
    // home, four documents and search, all in Portuguese and none missing
    await expect(page.locator('.rv-nav[data-nav="pages"] a')).toHaveCount(6);
    await expect(
      page.locator('.rv-nav[data-nav="pages"] a[href^="/pt/"]'),
    ).toHaveCount(6);
    // The footer links the Portuguese legal pages, without an English qualifier.
    const legal = page.getByRole("navigation", { name: "Informações legais" });
    await expect(legal.getByRole("link")).toHaveText([
      "Termos de Uso",
      "Política de Privacidade",
    ]);
    await expect(legal.getByRole("link").first()).toHaveAttribute(
      "href",
      "/pt/terms/",
    );
    await expect(legal.getByRole("link").last()).toHaveAttribute(
      "href",
      "/pt/privacy/",
    );
  }
  await page.goto(base("docs") + "/pt/search/?q=organização");
  await expect(page.locator('[data-search-locale="pt-BR"]')).toBeVisible();
  await expect(
    page.locator('a[href="/pt/projetos/sweep/"]').first(),
  ).toBeVisible();
  await expect(page.locator('a[href*="/projects/sweep/cli/"]')).toHaveCount(0);
});

test("English Docs links every Portuguese counterpart and nothing else", async ({
  page,
}) => {
  for (const [path, counterpart] of pairs) {
    await page.goto(base("docs") + path);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.locator('.rv-lang[data-lang-state="link"] a'),
    ).toHaveAttribute("href", counterpart);
    await expect(page.locator(".rv-lang a")).toHaveAttribute(
      "hreflang",
      "pt-BR",
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="pt-BR"]'),
    ).toHaveAttribute("href", `https://docs.raioviajante.com${counterpart}`);
    // English pages still link the English legal pages.
    const legal = page.getByRole("navigation", { name: "Legal" });
    await expect(legal.getByRole("link")).toHaveText([
      "Terms of Use",
      "Privacy Policy",
    ]);
  }
});

test("Portuguese Docs home lists everything the English home lists", async ({
  page,
}) => {
  await page.goto(base("docs") + "/");
  const englishCount = await page.locator(".docs-entry").count();
  const labels = (locator: Locator) =>
    locator
      .locator(".docs-entry .rv-leader span:first-child")
      .allTextContents();
  const english = await labels(page.locator("main"));
  await page.goto(base("docs") + "/pt/");
  await expect(page.locator(".docs-entry")).toHaveCount(englishCount);
  // The projects that are not documented here are listed in both languages.
  const portuguese = await labels(page.locator("main"));
  expect(portuguese.slice(0, 4)).toEqual(["sweep", "hum", "orbit", "yanawa"]);
  expect(portuguese.length).toBe(english.length);
  await expect(page.getByText("ainda não documentado")).toHaveCount(2);
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "01.projetos/",
    "02.raioviajante/",
  ]);
});

test("Portuguese Docs search suggestions lead to results", async ({ page }) => {
  await isolate(page, []);
  await page.goto(base("docs") + "/pt/search/");
  await expect(page.locator("[data-search-page]")).toHaveAttribute(
    "data-search-state",
    "ready",
  );
  const input = page.locator("[data-search-input]");
  // Nothing matches yet: the empty state offers the suggestions.
  await input.fill("zzzz-nada");
  for (const scope of ["site", "everywhere"] as const) {
    if (scope === "everywhere") {
      await page.locator('[data-search-scope="everywhere"]').click();
      await input.fill("zzzz-nada");
    }
    await expect(page.locator("[data-search-empty]")).toBeVisible();
    const line = page.locator(`[data-search-suggestions="${scope}"]`);
    await expect(line).toBeVisible();
    const buttons = line.locator("[data-search-suggestion]");
    const terms = await buttons.allTextContents();
    expect(terms.length).toBeGreaterThanOrEqual(3);
    for (const term of terms) {
      await input.fill("zzzz-nada");
      await line.locator("button", { hasText: term }).click();
      await expect(input).toHaveValue(term);
      await expect(
        page.locator("[data-search-result]").first(),
        `"${term}" (${scope}) finds something`,
      ).toBeVisible();
      await expect(page.locator("[data-search-empty]")).toBeHidden();
    }
  }
});

test("Portuguese Docs blocks speak Portuguese and announce copying", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await isolate(page, []);
  await page.goto(base("docs") + "/pt/projetos/sweep/");
  const copy = page.locator(".block__copy").first();
  await expect(copy).toHaveText("copiar");
  await expect(page.locator(".callout__label")).toHaveText([
    "Nota",
    "Importante",
    "Aviso",
  ]);
  await copy.focus();
  await page.keyboard.press("Enter");
  await expect(copy).toHaveText("copiado");
  await expect(page.locator('[role="status"][data-block-status]')).toHaveText(
    "copiado",
  );
  await expect(copy).toHaveText("copiar", { timeout: 5000 });
  await expect(page.locator("pre").first()).toBeVisible();
  // Nothing on the page keeps an English control word.
  await expect(page.getByRole("button", { name: /^copy/i })).toHaveCount(0);
});

test("Docs search LANG carries q only, in both directions", async ({
  page,
}) => {
  for (const [path, destination] of [
    ["/search/", "/pt/search/"],
    ["/pt/search/", "/search/"],
  ]) {
    await page.goto(base("docs") + path + "?scope=everywhere&utm=x#frag");
    const link = page.locator("a[data-lang-search]");
    await expect(link).toHaveAttribute("href", destination);
    await page.locator("[data-search-input]").fill("configuração nova");
    await expect(link).toHaveAttribute(
      "href",
      destination + "?q=configura%C3%A7%C3%A3o+nova",
    );
  }
});

test("Root and Dump Portuguese federation includes Docs and Lab", async ({
  page,
}) => {
  const external: string[] = [];
  await isolate(page, external);
  for (const site of ["root", "dump", "docs", "lab"] as const) {
    const index = await (
      await fetch(`${base(site)}/pt/search-index.json`)
    ).text();
    await page.route(
      (url) =>
        url.pathname === "/pt/search-index.json" &&
        (url.origin === base(site) ||
          url.origin ===
            (
              {
                root: "https://raioviajante.com",
                dump: "https://dump.raioviajante.com",
                docs: "https://docs.raioviajante.com",
                lab: "https://lab.raioviajante.com",
              } as const
            )[site]),
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: index,
        }),
    );
  }
  for (const site of ["root", "dump"] as const) {
    const requested: string[] = [];
    page.on("request", (request) => {
      if (request.url().endsWith("/pt/search-index.json"))
        requested.push(request.url());
    });
    await page.goto(base(site) + "/pt/search");
    const search = page.locator("[data-search-page]");
    await expect(search).toHaveAttribute("data-search-state", "ready");
    await page.locator("[data-search-input]").fill("organização");
    await page.locator('[data-search-scope="everywhere"]').click();
    const result = page.locator(
      '[data-search-result][href$="/pt/projetos/sweep/"]',
    );
    await expect(result).toHaveCount(1);
    await expect(result).toContainText("Sweep");
    expect(requested).toContain(
      "https://docs.raioviajante.com/pt/search-index.json",
    );
    expect(requested).toContain(
      "https://lab.raioviajante.com/pt/search-index.json",
    );
    expect(external).toEqual([]);
    expect(
      await page
        .locator("[data-search-result]")
        .evaluateAll((rows) =>
          rows.every((row) => row.getAttribute("href")?.includes("/pt/")),
        ),
    ).toBe(true);
    page.removeAllListeners("request");
  }
});

test("Portuguese Docs pages remain accessible at mobile and desktop widths", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [, path] of pairs) {
      expect(
        await audit(page, "docs", path, width),
        `${path} at ${width}px`,
      ).toEqual([]);
    }
  }
});

test("Portuguese avatar label remains localized with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base("docs") + "/pt/");
  await expect(page.locator(".avatar-coin")).toHaveAttribute(
    "aria-label",
    "Personagem ilustrado do RaioViajante",
  );
});
