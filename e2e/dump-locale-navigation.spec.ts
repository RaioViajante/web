import { request as httpRequest } from "node:http";
import { expect, test, type Page } from "@playwright/test";
import { ports } from "../security/local-servers.mjs";
import { base, isolate } from "./support";

const expectLang = async (page: Page, lang: string) =>
  expect(await page.evaluate(() => document.documentElement.lang)).toBe(lang);

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
  await expect(page.locator("[data-lang-state='status'] a")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "RSS" })).toHaveCount(0);

  await page.getByRole("link", { name: /arquivo/ }).click();
  await expect(page).toHaveURL(`${base("dump")}/pt/archive`);
  await expectLang(page, "pt-BR");
  await page.getByRole("link", { name: /tags/ }).click();
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
    .getByRole("link", { name: "Termos de Uso (em inglês)" })
    .click();
  await expect(page).toHaveURL(`${base("dump")}/terms`);
  await expectLang(page, "en");
  expect(external).toEqual([]);
});

test("Dump dynamic misses use localized server-rendered 404 documents", async ({
  page,
}) => {
  const path = "/pt/posts/talvez-isso-vire-alguma-coisa-um-dia";
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
    ["/pt/tags/pessoal", "pt-BR"],
    ["/pt/tags/PESSOAL", "pt-BR"],
    ["/pt/tags/%70essoal", "pt-BR"],
  ] as const) {
    const response = await rawGet(path, { "x-locale": "client-controlled" });
    expect(response.status, path).toBe(404);
    expect(response.location, path).toBeUndefined();
    expect(response.body, path).toContain(`<html lang="${lang}"`);
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

test("English post comments retain the pathname-mapped Giscus boundary", async ({
  page,
}) => {
  await page.goto(`${base("dump")}/posts/maybe-this-can-be-something-someday`);
  await expectLang(page, "en");
  await expect(page.getByRole("heading", { name: "Comments" })).toHaveCount(1);
  await expect(page.locator(".comments")).toHaveCount(1);
});
