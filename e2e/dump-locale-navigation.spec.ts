import { request as httpRequest } from "node:http";
import { expect, test, type Page } from "@playwright/test";
import { ports } from "../security/local-servers.mjs";
import { base, isolate } from "./support";

const expectLang = async (page: Page, lang: string) =>
  expect(await page.evaluate(() => document.documentElement.lang)).toBe(lang);
const canonicalDumpOrigin = "https://dump.raioviajante.com";

const rawGet = (path: string, headers: Record<string, string> = {}) =>
  new Promise<{ status: number; location?: string; body: string }>(
    (resolve, reject) => {
      const request = httpRequest(
        {
          host: "127.0.0.1",
          port: ports.dump,
          path,
          headers,
        },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
          response.on("end", () =>
            resolve({
              status: response.statusCode ?? 0,
              ...(response.headers.location
                ? { location: response.headers.location }
                : {}),
              body: Buffer.concat(chunks).toString("utf8"),
            }),
          );
        },
      );
      request.on("error", reject);
      request.end();
    },
  );

test("Dump keeps locale-pure navigation and document history", async ({
  page,
}) => {
  const external: string[] = [];
  await isolate(page, external);

  await page.goto(`${base("dump")}/`);
  await expectLang(page, "en");
  await page.goto(`${base("dump")}/pt`);
  await expectLang(page, "pt-BR");
  await expect(page.locator(".rv-lang a[href='/']")).toHaveCount(1);
  // The Follow section offers the Portuguese feed, never the English one.
  await expect(page.getByRole("link", { name: "RSS" })).toHaveAttribute(
    "href",
    "/pt/rss.xml",
  );
  await expect(page.locator("a[href='/rss.xml']")).toHaveCount(0);
  await expect(
    page.locator('link[rel="alternate"][type="application/rss+xml"]'),
  ).toHaveAttribute("href", /\/pt\/rss\.xml$/);
  // Every series part has a Portuguese version, so the section exists.
  await expect(page.getByRole("heading", { name: /Séries/ })).toHaveCount(1);

  // By destination: post titles now contain "arquivo" too.
  await page.locator("a[href='/pt/archive']").first().click();
  await expect(page).toHaveURL(`${base("dump")}/pt/archive`);
  await expectLang(page, "pt-BR");
  await page.locator("a[href='/pt/tags']").first().click();
  await expect(page).toHaveURL(`${base("dump")}/pt/tags`);
  await expectLang(page, "pt-BR");

  await page.goBack({ waitUntil: "load" });
  await expectLang(page, "pt-BR");
  await page.goBack({ waitUntil: "load" });
  await expectLang(page, "pt-BR");
  await page.goBack({ waitUntil: "load" });
  await expectLang(page, "en");
  await page.goForward({ waitUntil: "load" });
  await expectLang(page, "pt-BR");

  await page
    .getByRole("navigation", { name: "Informações legais" })
    .getByRole("link", { name: "Termos de Uso", exact: true })
    .click();
  await expect(page).toHaveURL(`${base("dump")}/pt/terms`);
  await expectLang(page, "pt-BR");
  await expect(
    page.getByRole("heading", { level: 1, name: "Termos de Uso" }),
  ).toBeVisible();
  await expect(page.locator(".rv-lang a")).toHaveAttribute("href", "/terms");
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", `${canonicalDumpOrigin}/terms`);
  await page
    .getByRole("navigation", { name: "Informações legais" })
    .getByRole("link", { name: "Política de Privacidade", exact: true })
    .click();
  await expect(page).toHaveURL(`${base("dump")}/pt/privacy`);
  await expectLang(page, "pt-BR");
  expect(external).toEqual([]);
});

test("Dump publishes the reviewed Portuguese inventory without English fallback", async ({
  page,
}) => {
  const translatedPath = "/pt/posts/talvez-isso-vire-alguma-coisa-um-dia";
  const originalPath =
    "/pt/posts/traduzir-o-site-sem-fingir-que-tudo-ja-existe";
  const englishTranslationPath =
    "/posts/translating-the-site-without-pretending-everything-already-exists";

  let response = await page.goto(`${base("dump")}/pt`);
  expect(response?.status()).toBe(200);
  await expectLang(page, "pt-BR");
  await expect(
    page.getByRole("link", { name: /Talvez isso vire alguma coisa um dia/ }),
  ).toHaveAttribute("href", translatedPath);
  await expect(
    page.getByRole("link", {
      name: /Traduzir o site sem fingir que tudo já existe/,
    }),
  ).toHaveAttribute("href", originalPath);
  await expect(
    page.getByText("Maybe This Can Be Something Someday", { exact: true }),
  ).toHaveCount(0);

  response = await page.goto(base("dump") + translatedPath);
  expect(response?.status()).toBe(200);
  await expectLang(page, "pt-BR");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${canonicalDumpOrigin}${translatedPath}`,
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    `${canonicalDumpOrigin}/posts/maybe-this-can-be-something-someday`,
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="pt-BR"]'),
  ).toHaveAttribute("href", `${canonicalDumpOrigin}${translatedPath}`);
  await expect(
    page.locator(
      ".rv-lang a[href='/posts/maybe-this-can-be-something-someday']",
    ),
  ).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Comentários" })).toHaveCount(
    1,
  );

  response = await page.goto(base("dump") + originalPath);
  expect(response?.status()).toBe(200);
  await expectLang(page, "pt-BR");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${canonicalDumpOrigin}${originalPath}`,
  );
  // The Portuguese original has an English translation: a complete cluster
  // whose x-default is the English member.
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", `${canonicalDumpOrigin}${englishTranslationPath}`);
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute("href", `${canonicalDumpOrigin}${englishTranslationPath}`);
  await expect(
    page.locator(`.rv-lang a[href="${englishTranslationPath}"]`),
  ).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Comentários" })).toHaveCount(
    1,
  );

  response = await page.goto(`${base("dump")}/pt/archive`);
  expect(response?.status()).toBe(200);
  await expectLang(page, "pt-BR");
  await expect(page.locator(`a[href="${translatedPath}"]`)).toHaveCount(1);
  await expect(page.locator(`a[href="${originalPath}"]`)).toHaveCount(1);

  response = await page.goto(`${base("dump")}/pt/tags`);
  expect(response?.status()).toBe(200);
  await expectLang(page, "pt-BR");
  for (const slug of [
    "arquitetura",
    "automacao",
    "dump",
    "meta",
    "pessoal",
    "seguranca",
    "sistemas-distribuidos",
    "web",
  ])
    await expect(page.locator(`a[href="/pt/tags/${slug}"]`)).toHaveCount(1);

  await page.goto(`${base("dump")}/pt/tags/pessoal`);
  await expect(page.locator(".rv-lang a")).toHaveAttribute(
    "href",
    "/tags/personal",
  );
  // Every English tag has a Portuguese page now, so its LANG link is direct.
  await page.goto(`${base("dump")}/tags/osdev`);
  await expect(page.locator(".rv-lang a")).toHaveAttribute(
    "href",
    "/pt/tags/osdev",
  );
});

test("Dump searches its local Portuguese index and federates Root, Docs and Lab", async ({
  page,
}) => {
  const external: string[] = [];
  await isolate(page, external);
  const rootIndex = await (
    await fetch(`${base("root")}/pt/search-index.json`)
  ).text();
  const docsIndex = await (
    await fetch(`${base("docs")}/pt/search-index.json`)
  ).text();
  const labIndex = await (
    await fetch(`${base("lab")}/pt/search-index.json`)
  ).text();
  let rootRequests = 0;
  let docsRequests = 0;
  let labRequests = 0;
  await page.route(
    (url) =>
      url.pathname === "/pt/search-index.json" &&
      (url.origin === "https://raioviajante.com" ||
        /^http:\/\/127\.0\.0\.1:300[02]$/.test(url.origin)),
    (route) => {
      rootRequests++;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: rootIndex,
      });
    },
  );
  await page.route(
    (url) =>
      url.pathname === "/pt/search-index.json" &&
      (url.origin === "https://docs.raioviajante.com" ||
        url.origin === base("docs")),
    (route) => {
      docsRequests++;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: docsIndex,
      });
    },
  );
  await page.route(
    (url) =>
      url.pathname === "/pt/search-index.json" &&
      (url.origin === "https://lab.raioviajante.com" ||
        url.origin === base("lab")),
    (route) => {
      labRequests++;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: labIndex,
      });
    },
  );
  await page.setViewportSize({ width: 390, height: 844 });

  const indexResponse = page.waitForResponse(
    (response) =>
      response.url() === `${base("dump")}/pt/search-index.json` &&
      response.status() === 200,
  );
  const response = await page.goto(`${base("dump")}/pt/search`);
  expect(response?.status()).toBe(200);
  await expectLang(page, "pt-BR");

  const entries = (await (await indexResponse).json()) as Array<{
    contentId: string;
    title: string;
    href: string;
  }>;
  expect(entries).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        contentId: "maybe-this-can-be-something-someday",
        title: "Talvez isso vire alguma coisa um dia",
        href: `${canonicalDumpOrigin}/pt/posts/talvez-isso-vire-alguma-coisa-um-dia`,
      }),
      expect.objectContaining({
        contentId: "traduzir-o-site-sem-fingir-que-tudo-ja-existe",
        title: "Traduzir o site sem fingir que tudo já existe",
        href: `${canonicalDumpOrigin}/pt/posts/traduzir-o-site-sem-fingir-que-tudo-ja-existe`,
      }),
    ]),
  );

  const search = page.locator("[data-search-page]");
  const input = page.locator("[data-search-input]");
  await expect(search).toHaveAttribute("data-search-state", "ready");
  await expect(input).toBeFocused();
  await expect(page.locator("a[data-lang-search]")).toHaveAttribute(
    "href",
    "/search",
  );

  await input.fill("Traduzir o site");
  let result = page.locator("[data-search-result]");
  await expect(result).toHaveCount(1);
  await expect(result).toContainText(
    "Traduzir o site sem fingir que tudo já existe",
  );
  await expect(page.locator("a[data-lang-search]")).toHaveAttribute(
    "href",
    "/search?q=Traduzir+o+site",
  );
  // The index states canonical origins; the e2e harness maps them to the
  // local server when the client renders a result.
  await expect(result).toHaveAttribute(
    "href",
    `${base("dump")}/pt/posts/traduzir-o-site-sem-fingir-que-tudo-ja-existe`,
  );

  await input.fill("erro por três horas");
  result = page.locator("[data-search-result]");
  await expect(result).toHaveCount(1);
  await expect(result).toContainText("Talvez isso vire alguma coisa um dia");

  await input.fill("nenhum resultado publicado");
  await expect(page.locator("[data-search-result]")).toHaveCount(0);
  await expect(page.locator("[data-search-empty]")).toBeVisible();

  // Every suggestion on an empty result leads to results in the Portuguese index.
  const siteTerms = page.locator(
    '[data-search-suggestions="site"] [data-search-suggestion]',
  );
  expect(await siteTerms.allTextContents()).toEqual([
    "orbit",
    "assembly",
    "linguagem",
    "agendador",
  ]);
  for (const term of await siteTerms.allTextContents()) {
    await input.fill("nenhum resultado publicado");
    await expect(page.locator("[data-search-empty]")).toBeVisible();
    await page
      .locator(
        `[data-search-suggestions="site"] [data-search-suggestion="${term}"]`,
      )
      .click();
    await expect(input).toHaveValue(term);
    await expect(page.locator("[data-search-result]").first()).toBeVisible();
  }

  await page.locator('[data-search-scope="everywhere"]').click();
  await expect(search).toHaveAttribute("data-search-state", "ready");
  expect(rootRequests).toBe(1);
  expect(docsRequests).toBe(1);
  expect(labRequests).toBe(1);
  expect(external).toEqual([]);

  // The "everywhere" suggestions find an entry on another host's Portuguese index.
  const everywhereTerms = page.locator(
    '[data-search-suggestions="everywhere"] [data-search-suggestion]',
  );
  expect(await everywhereTerms.allTextContents()).toEqual([
    "galeria",
    "sweep",
    "classificador",
  ]);
  for (const term of await everywhereTerms.allTextContents()) {
    await input.fill("nenhum resultado publicado");
    await expect(page.locator("[data-search-empty]")).toBeVisible();
    await page
      .locator(
        `[data-search-suggestions="everywhere"] [data-search-suggestion="${term}"]`,
      )
      .click();
    await expect(page.locator("[data-search-result]").first()).toBeVisible();
  }

  await input.fill("Traduzir o site");
  await expect(page.locator("[data-search-result]")).toHaveCount(1);
  await input.press("Enter");
  await expect(page).toHaveURL(
    `${base("dump")}/pt/posts/traduzir-o-site-sem-fingir-que-tudo-ja-existe`,
  );
  await expectLang(page, "pt-BR");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  expect(external).toEqual([]);
});

test("Dump dynamic misses use localized server-rendered 404 documents", async ({
  page,
}) => {
  const path = "/pt/posts/building-orbit";
  const response = await page.goto(base("dump") + path);
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(base("dump") + path);
  await expectLang(page, "pt-BR");
  expect(
    await page
      .locator('meta[name="robots"]')
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("content")),
      ),
  ).toEqual(expect.arrayContaining([expect.stringMatching(/noindex/)]));
  await expect(
    page.getByRole("heading", { name: "Procurei em todo lugar." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /início \(em inglês\)/ }),
  ).toHaveAttribute("hreflang", "en");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
});

test("Dump rejects encoded malformed paths over actual HTTP without losing URL locale", async () => {
  for (const [path, lang] of [
    ["/posts/%E0%A4%A", "en"],
    ["/posts/foo%2Fbar", "en"],
    ["/tags/foo%2Fbar", "en"],
    ["/tags/foo%252Fbar", "en"],
    ["/pt/tags/%E0%A4%A", "pt-BR"],
  ] as const) {
    const response = await rawGet(path, { "x-locale": "client-controlled" });
    expect(response.status, path).toBe(404);
    expect(response.location, path).toBeUndefined();
    expect(response.body, path).toContain(`<html lang="${lang}"`);
  }
});

test("Dump tag misses preserve URL-authoritative localized 404s", async () => {
  for (const [path, lang] of [
    ["/tags/not-real", "en"],
    ["/pt/tags/not-real", "pt-BR"],
    ["/pt/tags/PESSOAL", "pt-BR"],
    ["/pt/tags/personal", "pt-BR"],
  ] as const) {
    const response = await rawGet(path, { "x-locale": "client-controlled" });
    expect(response.status, path).toBe(404);
    expect(response.location, path).toBeUndefined();
    expect(response.body, path).toContain(`<html lang="${lang}"`);
  }
});

test("Dump Portuguese tag routes accept canonical encoding but not aliases", async () => {
  for (const path of ["/pt/tags/pessoal", "/pt/tags/%70essoal"]) {
    const response = await rawGet(path, { "x-locale": "client-controlled" });
    expect(response.status, path).toBe(200);
    expect(response.location, path).toBeUndefined();
    expect(response.body, path).toContain('<html lang="pt-BR"');
    expect(response.body, path).toContain(
      `<link rel="canonical" href="${canonicalDumpOrigin}/pt/tags/pessoal"`,
    );
  }
});

test("Next normalizes repeated and trailing slashes before the localized 404", async () => {
  for (const [path, normalized, lang] of [
    ["//posts/x", "/posts/x", "en"],
    ["/pt//posts/x", "/pt/posts/x", "pt-BR"],
    ["/posts/not-real/", "/posts/not-real", "en"],
  ] as const) {
    const response = await rawGet(path, { "x-locale": "client-controlled" });
    expect(response.status, path).toBe(308);
    expect(response.location, path).toBe(normalized);

    const missing = await rawGet(normalized, {
      "x-locale": "client-controlled",
    });
    expect(missing.status, normalized).toBe(404);
    expect(missing.body, normalized).toContain(`<html lang="${lang}"`);
  }
});

test("Dump preserves established encoded, case-insensitive and trailing-slash behavior", async () => {
  for (const path of [
    "/tags/OSDEV",
    "/tags/%6f%73%64%65%76",
    "/posts/%6daybe-this-can-be-something-someday",
  ]) {
    const response = await rawGet(path);
    expect(response.status, path).toBe(200);
    expect(response.body, path).toContain('<html lang="en"');
  }

  const trailing = await rawGet("/posts/maybe-this-can-be-something-someday/");
  expect(trailing.status).toBe(308);
  expect(trailing.location).toBe("/posts/maybe-this-can-be-something-someday");
});

test("English post comments keep the lazy Giscus boundary", async ({
  page,
}) => {
  await page.goto(`${base("dump")}/posts/maybe-this-can-be-something-someday`);
  await expectLang(page, "en");
  await expect(page.getByRole("heading", { name: "Comments" })).toHaveCount(1);
  await expect(page.locator(".comments")).toHaveCount(1);
});
