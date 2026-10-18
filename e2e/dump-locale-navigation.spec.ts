import { expect, test, type Page } from "@playwright/test";
import { base, isolate } from "./support";

const expectLang = async (page: Page, lang: string) =>
  expect(await page.evaluate(() => document.documentElement.lang)).toBe(lang);

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

test("English post comments retain the pathname-mapped Giscus boundary", async ({
  page,
}) => {
  await page.goto(
    `${base("dump")}/posts/maybe-this-can-be-something-someday`,
  );
  await expectLang(page, "en");
  await expect(page.getByRole("heading", { name: "Comments" })).toHaveCount(1);
  await expect(page.locator(".comments")).toHaveCount(1);
});
