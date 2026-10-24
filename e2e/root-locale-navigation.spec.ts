import { expect, test, type Page } from "@playwright/test";
import { base, isolate } from "./support";

const expectLang = async (page: Page, lang: string) =>
  expect(page.locator("html")).toHaveAttribute("lang", lang);

test("Root keeps document language correct across locale history and English legal links", async ({
  page,
}) => {
  const external: string[] = [];
  await isolate(page, external);

  await page.goto(`${base("root")}/`);
  await expectLang(page, "en");
  await expect(page.locator(".rv-lang a")).toHaveAttribute("href", "/pt");
  await page.locator(".rv-lang a").click();
  await expectLang(page, "pt-BR");
  await expect(page.locator(".rv-lang a")).toHaveAttribute("href", "/");

  await page.goBack({ waitUntil: "load" });
  await expectLang(page, "en");
  await page.goForward({ waitUntil: "load" });
  await expectLang(page, "pt-BR");

  await page
    .getByRole("navigation", { name: "Informações legais" })
    .getByRole("link", { name: "Termos de Uso (em inglês)" })
    .click();
  await expect(page).toHaveURL(`${base("root")}/terms`);
  await expectLang(page, "en");
  await page.goBack({ waitUntil: "load" });
  await expectLang(page, "pt-BR");
  await page.goForward({ waitUntil: "load" });
  await expectLang(page, "en");

  await page.goto(`${base("root")}/pt`);
  await page
    .getByRole("navigation", { name: "Informações legais" })
    .getByRole("link", { name: "Política de Privacidade (em inglês)" })
    .click();
  await expect(page).toHaveURL(`${base("root")}/privacy`);
  await expectLang(page, "en");
  await page.goBack({ waitUntil: "load" });
  await expectLang(page, "pt-BR");

  expect(external).toEqual([]);
});

test("Root offers no invented translations and links only active Portuguese hosts", async ({
  page,
}) => {
  await isolate(page, []);
  await page.goto(`${base("root")}/projects`);
  await expect(page.locator(".rv-lang a")).toHaveAttribute(
    "href",
    "/pt/projects",
  );
  await page.goto(`${base("root")}/pt/projects`);
  await expectLang(page, "pt-BR");
  await expect(page.locator(".rv-lang a")).toHaveAttribute("href", "/projects");
  await expect(
    page.getByRole("heading", { name: "Projetos" }).first(),
  ).toBeVisible();
  await expect(page.getByText("ferramenta / automação")).toBeVisible();
  await page.goto(`${base("root")}/pt`);
  await expect(page.locator("#projects-heading")).toContainText("Projetos");
  await expect(page.locator("#preview-sweep")).toContainText(
    "Uma ferramenta em Python",
  );
  await page.goto(`${base("root")}/pt/contact`);
  await expectLang(page, "pt-BR");
  await expect(page.locator(".rv-lang a")).toHaveAttribute("href", "/contact");
  await expect(
    page.getByRole("heading", { name: "Vamos conversar" }),
  ).toBeVisible();
  await page.goto(`${base("root")}/pt/about`);
  await expect(page.locator(".rv-lang a")).toHaveAttribute("href", "/about");
  await expect(
    page.locator('main a[href="https://dump.raioviajante.com/pt"]'),
  ).toHaveAttribute("hreflang", "pt-BR");
  await expect(
    page.locator('main a[href="https://docs.raioviajante.com/pt/"]'),
  ).toHaveAttribute("hreflang", "pt-BR");
  await expect(
    page.locator('main a[href="https://lab.raioviajante.com/pt/"]'),
  ).toHaveAttribute("hreflang", "pt-BR");
  const footer = page.locator("footer nav:first-of-type a");
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
    page.getByRole("heading", { name: "raioviajante.com" }),
  ).toBeVisible();
  await expect(page.locator("#site-heading").locator("..")).toContainText(
    "Este é o ponto de partida para os sites do RaioViajante.",
  );
  await expect(page.locator("#built-heading + ul li")).toHaveCount(5);
  await expect(page.locator('.rv-lang a[hreflang="en"]')).toHaveAttribute(
    "href",
    "/this-site",
  );
  await expect(
    page
      .getByRole("main")
      .getByRole("link", { name: "Termos de Uso (em inglês)" }),
  ).toHaveAttribute("hreflang", "en");
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
  await expect(page.locator(".rv-lang a")).toHaveAttribute(
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
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Setup");
  await expect(page.locator("#gear-heading")).toContainText(
    "Lista de equipamentos",
  );
  await expect(page.locator(".setup-gear")).toHaveCount(14);
  const disclosure = page.locator("#affiliate-disclosure");
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
            document.querySelector(".setup-gear__link a")!,
          ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ),
  ).toBeTruthy();
  const english = await (async () => {
    await page.goto(`${root}/setup`);
    return page
      .locator(".setup-gear__link a")
      .evaluateAll((links) =>
        links.map((link) => [
          link.getAttribute("href"),
          link.getAttribute("rel"),
        ]),
      );
  })();
  await expect(page.locator("#affiliate-disclosure")).toContainText(
    "affiliate links",
  );
  await expect(page.locator("#affiliate-disclosure")).toContainText(
    "commission",
  );
  await page.goto(`${root}/pt/setup`);
  const links = page.locator(".setup-gear__link a");
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
  await expect(page.getByText("Nenhum link confiável disponível.")).toHaveCount(
    6,
  );
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
  await expect(page.locator('.rv-lang a[hreflang="en"]')).toHaveAttribute(
    "href",
    "/setup",
  );

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
  await expect(page.locator(".rv-lang a")).toHaveAttribute("href", "/pt/setup");

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
