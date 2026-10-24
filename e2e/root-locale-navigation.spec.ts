import { expect, test, type Page } from "@playwright/test";
import { base, isolate } from "./support";

const expectLang = async (page: Page, lang: string) =>
  expect(page.locator("html")).toHaveAttribute("lang", lang);

test("Root keeps document language correct across locale history and localized legal links", async ({
  page,
}) => {
  const external: string[] = [];
  await isolate(page, external);

  await page.goto(`${base("root")}/`);
  await expectLang(page, "en");
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/pt",
  );
  await page.getByTestId("language-counterpart").click();
  await expectLang(page, "pt-BR");
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/",
  );

  await page.goBack({ waitUntil: "load" });
  await expectLang(page, "en");
  await page.goForward({ waitUntil: "load" });
  await expectLang(page, "pt-BR");

  await page
    .getByTestId("footer-legal")
    .and(page.getByRole("navigation", { name: "Informações legais" }))
    .getByTestId("footer-legal-link")
    .and(
      page
        .getByTestId("footer-legal")
        .and(page.getByRole("navigation", { name: "Informações legais" }))
        .getByRole("link", { name: "Termos de Uso", exact: true }),
    )
    .click();
  await expect(page).toHaveURL(`${base("root")}/pt/terms`);
  await expectLang(page, "pt-BR");
  await page.goBack({ waitUntil: "load" });
  await expectLang(page, "pt-BR");
  await page.goForward({ waitUntil: "load" });
  await expectLang(page, "pt-BR");

  await page.goto(`${base("root")}/pt`);
  await page
    .getByTestId("footer-legal")
    .and(page.getByRole("navigation", { name: "Informações legais" }))
    .getByTestId("footer-legal-link")
    .and(
      page
        .getByTestId("footer-legal")
        .and(page.getByRole("navigation", { name: "Informações legais" }))
        .getByRole("link", { name: "Política de Privacidade", exact: true }),
    )
    .click();
  await expect(page).toHaveURL(`${base("root")}/pt/privacy`);
  await expectLang(page, "pt-BR");
  await page.goBack({ waitUntil: "load" });
  await expectLang(page, "pt-BR");

  expect(external).toEqual([]);
});

test("Root offers no invented translations and links only active Portuguese hosts", async ({
  page,
}) => {
  await isolate(page, []);
  await page.goto(`${base("root")}/projects`);
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/pt/projects",
  );
  await page.goto(`${base("root")}/pt/projects`);
  await expectLang(page, "pt-BR");
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/projects",
  );
  await expect(
    page
      .getByTestId("page-title")
      .and(page.getByRole("heading", { name: "Projetos" }))
      .first(),
  ).toBeVisible();
  await expect(
    page
      .getByTestId("project-kind")
      .and(page.getByText("ferramenta / automação")),
  ).toBeVisible();
  await page.goto(`${base("root")}/pt`);
  await expect(page.locator("#projects-heading")).toContainText("Projetos");
  await expect(page.getByTestId("preview-sweep")).toContainText(
    "Uma ferramenta em Python",
  );
  await page.goto(`${base("root")}/pt/contact`);
  await expectLang(page, "pt-BR");
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/contact",
  );
  await expect(
    page
      .getByTestId("page-title")
      .and(page.getByRole("heading", { name: "Vamos conversar" })),
  ).toBeVisible();
  await page.goto(`${base("root")}/pt/about`);
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/about",
  );
  await expect(
    page.locator('main a[href="https://dump.raioviajante.com/pt"]'),
  ).toHaveAttribute("hreflang", "pt-BR");
  await expect(
    page.locator('main a[href="https://docs.raioviajante.com/pt/"]'),
  ).toHaveAttribute("hreflang", "pt-BR");
  await expect(
    page.locator('main a[href="https://lab.raioviajante.com/pt/"]'),
  ).toHaveAttribute("hreflang", "pt-BR");
  const footer = page.locator(
    '[data-testid="footer-sites"] [data-testid="footer-site-link"]',
  );
  await expect(footer.nth(0)).toHaveAttribute(
    "href",
    "https://raioviajante.com/pt",
  );
  await expect(footer.nth(1)).toHaveAttribute(
    "href",
    "https://dump.raioviajante.com/pt",
  );
  await expect(footer.nth(2)).toHaveAttribute("hreflang", "pt-BR");
  await expect(footer.nth(3)).toHaveAttribute(
    "href",
    "https://lab.raioviajante.com/pt/",
  );
  await expect(footer.nth(3)).toHaveAttribute("hreflang", "pt-BR");
  await page.goto(`${base("root")}/pt/does-not-exist`);
  await expectLang(page, "pt-BR");
  await expect(
    page.locator('main a[href="https://dump.raioviajante.com/pt"]'),
  ).toHaveAttribute("hreflang", "pt-BR");
  await expect(
    page.locator('main a[href="https://docs.raioviajante.com/pt/"]'),
  ).toHaveAttribute("hreflang", "pt-BR");
  await expect(
    page.locator('main a[href="https://lab.raioviajante.com/pt/"]'),
  ).toHaveAttribute("hreflang", "pt-BR");
});

test("Root publishes the Portuguese This Site counterpart across navigation, SEO and search", async ({
  page,
  request,
}) => {
  await isolate(page, []);
  const root = base("root");

  await page.goto(`${root}/pt/this-site`);
  await expectLang(page, "pt-BR");
  await expect(
    page
      .getByTestId("page-title")
      .and(page.getByRole("heading", { name: "raioviajante.com" })),
  ).toBeVisible();
  await expect(page.locator("#site-heading").locator("..")).toContainText(
    "Este é o ponto de partida para os sites do RaioViajante.",
  );
  await expect(page.locator("#built-heading + ul li")).toHaveCount(5);
  await expect(
    page.locator('[data-testid="language-counterpart"][hreflang="en"]'),
  ).toHaveAttribute("href", "/this-site");
  await expect(
    page
      .getByTestId("main-content")
      .and(page.getByRole("main"))
      .getByTestId("content-link")
      .and(
        page
          .getByTestId("main-content")
          .and(page.getByRole("main"))
          .getByRole("link", { name: "Termos de Uso" }),
      ),
  ).toHaveAttribute("href", "/pt/terms");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://raioviajante.com/pt/this-site",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://raioviajante.com/this-site");
  await expect(
    page.locator('link[rel="alternate"][hreflang="pt-BR"]'),
  ).toHaveAttribute("href", "https://raioviajante.com/pt/this-site");

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${root}/pt/this-site`);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const navigationLink = page.locator('nav a[href="/pt/this-site"]').first();
  await navigationLink.focus();
  await expect(navigationLink).toBeFocused();
  await expect(navigationLink).toBeVisible();

  await page.goto(`${root}/this-site`);
  await expectLang(page, "en");
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/pt/this-site",
  );

  const sitemap = await (await request.get(`${root}/sitemap.xml`)).text();
  expect(sitemap).toContain("<loc>https://raioviajante.com/pt/this-site</loc>");
  const search = await (
    await request.get(`${root}/pt/search-index.json`)
  ).json();
  expect(search).toContainEqual(
    expect.objectContaining({
      locale: "pt-BR",
      title: "este site",
      href: "https://raioviajante.com/pt/this-site",
      description: "Como este site é construído",
    }),
  );
});

test("Root publishes the Portuguese Setup counterpart with its gear links intact", async ({
  page,
  request,
}) => {
  await isolate(page, []);
  const root = base("root");

  await page.goto(`${root}/pt/setup`);
  await expectLang(page, "pt-BR");
  await expect(
    page.getByTestId("page-title").and(page.getByRole("heading", { level: 1 })),
  ).toHaveText("Setup");
  await expect(page.locator("#gear-heading")).toContainText(
    "Lista de equipamentos",
  );
  await expect(page.getByTestId("setup-gear")).toHaveCount(14);
  const disclosure = page.getByTestId("affiliate-disclosure");
  await expect(disclosure).toBeVisible();
  await expect(disclosure).toContainText("links de afiliado");
  await expect(disclosure).toContainText("comissão");
  // The disclosure precedes the first affiliate link in reading order.
  expect(
    await page.evaluate(
      () =>
        document
          .getElementById("affiliate-disclosure")!
          .compareDocumentPosition(
            document.querySelector('[data-testid="setup-gear-link"]')!,
          ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ),
  ).toBeTruthy();
  const english = await (async () => {
    await page.goto(`${root}/setup`);
    return page
      .locator('[data-testid="setup-gear-link"]')
      .evaluateAll((links) =>
        links.map((link) => [
          link.getAttribute("href"),
          link.getAttribute("rel"),
        ]),
      );
  })();
  await expect(page.getByTestId("affiliate-disclosure")).toContainText(
    "affiliate links",
  );
  await expect(page.getByTestId("affiliate-disclosure")).toContainText(
    "commission",
  );
  await page.goto(`${root}/pt/setup`);
  const links = page.locator('[data-testid="setup-gear-link"]');
  expect(
    await links.evaluateAll((nodes) =>
      nodes.map((link) => [
        link.getAttribute("href"),
        link.getAttribute("rel"),
      ]),
    ),
  ).toEqual(english);
  expect(english.length).toBe(8);
  for (const [, rel] of english) expect(rel).toBe("sponsored");
  await expect(
    page
      .getByTestId("setup-gear-source")
      .and(page.getByText("Nenhum link confiável disponível.")),
  ).toHaveCount(6);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://raioviajante.com/pt/setup",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://raioviajante.com/setup");
  await expect(
    page.locator('link[rel="alternate"][hreflang="pt-BR"]'),
  ).toHaveAttribute("href", "https://raioviajante.com/pt/setup");
  await expect(
    page.locator('[data-testid="language-counterpart"][hreflang="en"]'),
  ).toHaveAttribute("href", "/setup");

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${root}/pt/setup`);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const firstLink = links.first();
  await firstLink.focus();
  await expect(firstLink).toBeFocused();
  await expect(firstLink).toBeVisible();

  await page.goto(`${root}/pt`);
  const setupRow = page.locator('main a[href="/pt/setup"]');
  await expect(setupRow).toHaveCount(1);
  await expect(page.locator("#other-links-heading")).toContainText(
    "Outros links",
  );

  await page.goto(`${root}/setup`);
  await expectLang(page, "en");
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/pt/setup",
  );

  const sitemap = await (await request.get(`${root}/sitemap.xml`)).text();
  expect(sitemap).toContain("<loc>https://raioviajante.com/pt/setup</loc>");
  const search = await (
    await request.get(`${root}/pt/search-index.json`)
  ).json();
  expect(search).toContainEqual(
    expect.objectContaining({
      locale: "pt-BR",
      title: "setup",
      href: "https://raioviajante.com/pt/setup",
      description: "Ferramentas e setup",
    }),
  );
});

test("Root publishes the Portuguese Gallery counterpart across navigation, SEO and search", async ({
  page,
  request,
}) => {
  await isolate(page, []);
  const root = base("root");

  await page.goto(`${root}/pt/gallery`);
  await expectLang(page, "pt-BR");
  await expect(
    page.locator('nav a[href="/pt/gallery"][aria-current="page"]').first(),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="language-counterpart"][hreflang="en"]'),
  ).toHaveAttribute("href", "/gallery");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://raioviajante.com/pt/gallery",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://raioviajante.com/gallery");
  await expect(
    page.locator('link[rel="alternate"][hreflang="pt-BR"]'),
  ).toHaveAttribute("href", "https://raioviajante.com/pt/gallery");

  await page.goto(`${root}/gallery`);
  await expectLang(page, "en");
  await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
    "href",
    "/pt/gallery",
  );

  const sitemap = await (await request.get(`${root}/sitemap.xml`)).text();
  expect(sitemap).toContain("<loc>https://raioviajante.com/pt/gallery</loc>");
  const search = await (
    await request.get(`${root}/pt/search-index.json`)
  ).json();
  expect(search).toContainEqual(
    expect.objectContaining({
      locale: "pt-BR",
      title: "galeria",
      href: "https://raioviajante.com/pt/gallery",
      description: "Arte e imagens",
    }),
  );
});

for (const [key, heading, summary, updated, englishUpdated, internal] of [
  [
    "terms",
    "Termos de Uso",
    "licença de cada repositório",
    "24 de outubro de 2026",
    "October 24, 2026",
    "/pt/privacy",
  ],
  [
    "privacy",
    "Política de Privacidade",
    "salva em um cookie",
    "24 de outubro de 2026",
    "October 24, 2026",
    undefined,
  ],
] as const)
  test(`Root publishes the Portuguese ${key} counterpart without changing the English document`, async ({
    page,
    request,
  }) => {
    await isolate(page, []);
    const root = base("root");

    await page.goto(`${root}/${key}`);
    await expectLang(page, "en");
    await expect(
      page.getByTestId("section-heading").and(page.getByText("In short")),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("page-meta-item")
        .and(page.getByText(`last updated ${englishUpdated}`)),
    ).toBeVisible();
    await expect(page.getByTestId("language-counterpart")).toHaveAttribute(
      "href",
      `/pt/${key}`,
    );
    const footer = page
      .getByTestId("footer-legal")
      .and(page.getByRole("navigation", { name: "Legal" }));
    await expect(
      footer
        .getByTestId("footer-legal-link")
        .and(footer.getByRole("link", { name: "Terms of Use" })),
    ).toHaveAttribute("href", "/terms");
    const englishFacts = await page
      .locator("main a[href^='mailto:'], main a[href^='https://']")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));

    await page.goto(`${root}/pt/${key}`);
    await expectLang(page, "pt-BR");
    await expect(
      page
        .getByTestId("page-title")
        .and(page.getByRole("heading", { level: 1 })),
    ).toHaveText(heading);
    await expect(
      page.getByTestId("section-heading").and(page.getByText("Em resumo")),
    ).toBeVisible();
    await expect(
      page.getByTestId("leader-value").and(page.getByText(summary)).first(),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("page-meta-item")
        .and(page.getByText(`última atualização ${updated}`)),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("legal-updated")
        .and(page.getByText(`Última atualização: ${updated}.`)),
    ).toBeVisible();
    await expect(page.getByTestId("main-content")).not.toContainText(
      englishUpdated,
    );
    // External references and contact data are identical to the English page.
    expect(
      await page
        .locator("main a[href^='mailto:'], main a[href^='https://']")
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href"))),
    ).toEqual(englishFacts);
    if (key === "privacy")
      await expect(page.getByTestId("main-content")).toContainText(
        "CNPJ 53.021.377/0001-93",
      );
    await expect(page.getByTestId("site-footer")).toContainText(
      "CNPJ: 53.021.377/0001-93",
    );
    // Internal legal links stay in Portuguese; the footer no longer names English.
    if (internal)
      await expect(page.locator(`main a[href="${internal}"]`)).toHaveCount(1);
    const legal = page
      .getByTestId("footer-legal")
      .and(page.getByRole("navigation", { name: "Informações legais" }));
    await expect(
      legal
        .getByTestId("footer-legal-link")
        .and(legal.getByRole("link", { name: "Termos de Uso", exact: true })),
    ).toHaveAttribute("href", "/pt/terms");
    await expect(
      legal
        .getByTestId("footer-legal-link")
        .and(
          legal.getByRole("link", {
            name: "Política de Privacidade",
            exact: true,
          }),
        ),
    ).toHaveAttribute("href", "/pt/privacy");
    await expect(legal.locator("a[hreflang]")).toHaveCount(0);
    await expect(legal).not.toContainText("em inglês");
    await expect(
      page.locator('[data-testid="language-counterpart"][hreflang="en"]'),
    ).toHaveAttribute("href", `/${key}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://raioviajante.com/pt/${key}`,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", `https://raioviajante.com/${key}`);
    await expect(
      page.locator('link[rel="alternate"][hreflang="pt-BR"]'),
    ).toHaveAttribute("href", `https://raioviajante.com/pt/${key}`);

    // Mobile: no overflow, keyboard focus reaches the footer legal links.
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(`${root}/pt/${key}`);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const link = legal
      .getByTestId("footer-legal-link")
      .and(legal.getByRole("link", { name: heading, exact: true }));
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toBeVisible();

    const sitemap = await (await request.get(`${root}/sitemap.xml`)).text();
    expect(sitemap).toContain(`<loc>https://raioviajante.com/pt/${key}</loc>`);
    expect(sitemap).toContain(`<loc>https://raioviajante.com/${key}</loc>`);
    const search = await (
      await request.get(`${root}/pt/search-index.json`)
    ).json();
    // Legal pages are not in the English search index, so not in the Portuguese one.
    expect(
      search.filter((entry: { href: string }) =>
        entry.href.endsWith(`/${key}`),
      ),
    ).toEqual([]);
  });

test("Root legal pages state the same audited facts in English and Portuguese", async ({
  page,
}) => {
  await isolate(page, []);
  const root = base("root");
  const main = page.getByTestId("main-content");

  await page.goto(`${root}/terms`);
  await expect(main).toContainText("affiliate links");
  await expect(main.locator('a[href="/setup"]')).toHaveCount(1);
  await page.goto(`${root}/pt/terms`);
  await expect(main).toContainText("links de afiliado");
  await expect(main.locator('a[href="/pt/setup"]')).toHaveCount(1);

  await page.goto(`${root}/privacy`);
  await expect(main).toContainText("browser's local storage");
  await expect(main).toContainText("the text you type is not sent to them");
  await page.goto(`${root}/pt/privacy`);
  await expect(main).toContainText("armazenamento local");
  await expect(main).toContainText(
    "o texto que você digita não é enviado a eles",
  );
});
