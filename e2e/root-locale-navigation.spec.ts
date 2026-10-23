import { expect, test, type Page } from "@playwright/test";
import { base, isolate } from "./support";

const expectLang = async (page: Page, lang: string) =>
  expect(await page.evaluate(() => document.documentElement.lang)).toBe(lang);

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
  await expect(page.locator(".rv-lang")).toHaveAttribute(
    "data-lang-state",
    "disclosure",
  );
  await page.locator(".rv-lang summary").click();
  await expect(page.locator(".rv-lang details a")).toHaveAttribute(
    "href",
    "/pt",
  );
  await page.goto(`${base("root")}/pt/about`);
  await expect(page.locator(".rv-lang a")).toHaveAttribute("href", "/about");
  await expect(
    page.locator('main a[href="https://dump.raioviajante.com/pt"]'),
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
  await expect(footer.nth(3)).toHaveAttribute("hreflang", "en");
  await page.goto(`${base("root")}/pt/does-not-exist`);
  await expectLang(page, "pt-BR");
  await expect(
    page.locator('main a[href="https://dump.raioviajante.com/pt"]'),
  ).toHaveAttribute("hreflang", "pt-BR");
});
