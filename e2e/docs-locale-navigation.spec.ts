import { expect, test } from "@playwright/test";
import { audit } from "./audit";
import { base, isolate } from "./support";

test("Portuguese Docs navigation and LANG use real counterparts", async ({
  page,
}) => {
  for (const [path, counterpart] of [
    ["/pt/", "/"],
    ["/pt/projetos/sweep/", "/projects/sweep/"],
    ["/pt/search/", "/search/"],
  ]) {
    await page.goto(base("docs") + path);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.locator('.rv-lang[data-lang-state="link"] a'),
    ).toHaveAttribute("href", counterpart);
    await expect(page.locator(".rv-lang a")).toHaveAttribute("hreflang", "en");
    await expect(page.locator('.rv-nav[data-nav="pages"] a')).toHaveCount(3);
    await expect(
      page.locator('.rv-nav[data-nav="pages"] a[href^="/pt/"]'),
    ).toHaveCount(3);
  }
  await page.goto(base("docs") + "/pt/search/?q=organização");
  await expect(page.locator('[data-search-locale="pt-BR"]')).toBeVisible();
  await expect(page.locator('a[href="/pt/projetos/sweep/"]')).toBeVisible();
  await expect(page.locator('a[href*="/projects/sweep/cli/"]')).toHaveCount(0);
});

test("English Docs links only declared counterparts and discloses untranslated pages", async ({
  page,
}) => {
  for (const [path, counterpart] of [
    ["/", "/pt/"],
    ["/projects/sweep/", "/pt/projetos/sweep/"],
    ["/search/", "/pt/search/"],
  ]) {
    await page.goto(base("docs") + path);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.locator('.rv-lang[data-lang-state="link"] a'),
    ).toHaveAttribute("href", counterpart);
    await expect(page.locator(".rv-lang a")).toHaveAttribute(
      "hreflang",
      "pt-BR",
    );
  }
  for (const path of [
    "/projects/sweep/cli/",
    "/raioviajante/design-language/",
    "/raioviajante/repository-conventions/",
  ]) {
    await page.goto(base("docs") + path);
    const disclosure = page.locator('.rv-lang[data-lang-state="disclosure"]');
    await expect(disclosure.locator("summary")).toHaveText("LANG EN");
    await expect(disclosure.locator("summary")).toHaveAccessibleName(
      "LANG EN — Language: English. Check Portuguese availability.",
    );
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(
      0,
    );
    await disclosure.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(disclosure.locator("details")).toHaveAttribute("open", "");
    await expect(disclosure.locator("p")).toHaveText(
      "This page is not available in Portuguese.",
    );
    await expect(disclosure.locator("a")).toHaveAttribute("href", "/pt/");
  }
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
    for (const path of ["/pt/", "/pt/projetos/sweep/", "/pt/search/"]) {
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
