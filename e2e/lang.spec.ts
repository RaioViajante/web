import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  mountLanguageControl,
  renderLanguageControls,
  tabTo,
} from "./lang-fixtures";
import { base, isolate, searchPath, sites, viewports } from "./support";

for (const site of sites)
  test(`${site} home LANG links its real counterpart at phone width`, async ({
    page,
  }) => {
    await isolate(page, []);
    await page.setViewportSize(viewports.mobile);
    await page.goto(base(site) + "/");
    const lang = page.getByTestId("language-control");
    await expect(lang).toHaveAttribute("data-lang-state", "link");
    const link = lang
      .getByTestId("language-counterpart")
      .and(lang.getByRole("link", { name: "Português (Brasil)" }));
    const destination = site === "docs" || site === "lab" ? "/pt/" : "/pt";
    await expect(link).toHaveAttribute("href", destination);
    await expect(link).toHaveAttribute("hreflang", "pt-BR");
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await overflows(page)).toBe(false);
    await tabTo(page, '[data-testid="language-counterpart"]');
    expect(await link.evaluate((el) => el.matches(":focus-visible"))).toBe(
      true,
    );
    await axeClean(page);
    await link.press("Enter");
    await expect(page).toHaveURL(base(site) + destination);
    await expect(
      page.locator("[data-testid=\"language-counterpart\"][href='/']"),
    ).toHaveCount(1);
  });

const overflows = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

async function height(page: Page, selector: string) {
  return (await page.locator(selector).boundingBox())!.height;
}

async function inside(page: Page, selector: string) {
  const box = (await page.locator(selector).boundingBox())!;
  const width = await page.evaluate(() => window.innerWidth);
  return box.x >= 0 && box.x + box.width <= width;
}

async function axeClean(page: Page) {
  const result = await new AxeBuilder({ page })
    .include('[data-testid="shell-utilities"]')
    .analyze();
  expect(
    result.violations.map((v) => `${v.id}: ${v.nodes[0]?.target.join(" ")}`),
  ).toEqual([]);
}

// Real LanguageControl markup, rendered once per state (see lang-fixtures.ts).
let controls: Awaited<ReturnType<typeof renderControls>>;
const renderControls = () =>
  renderLanguageControls({
    link: { counterpart: "/pt/guia/" },
    disclosure: {},
    ptDisclosure: { locale: "pt-BR" },
    search: { search: true },
  });
test.beforeAll(async () => {
  controls = await renderControls();
});

test.describe("the real interactive LanguageControl at phone width", () => {
  test.beforeEach(async ({ page }) => {
    await isolate(page, []);
    await page.setViewportSize(viewports.mobile);
    await page.goto(base("docs") + "/");
  });

  test("direct counterpart link", async ({ page }) => {
    await mountLanguageControl(page, controls.link);
    const control = page.getByTestId("language-control");
    await expect(control).toHaveAttribute("data-lang-state", "link");
    const link = control.getByTestId("language-counterpart");
    await expect(link).toHaveText("Português (Brasil)");
    await expect(link).toHaveAttribute("lang", "pt-BR");
    await expect(link).toHaveAttribute("hreflang", "pt-BR");
    await expect(link).toHaveAttribute("href", "/pt/guia/");
    expect(
      await height(page, '[data-testid="language-counterpart"]'),
    ).toBeGreaterThanOrEqual(44);
    expect(await overflows(page)).toBe(false);
    expect(await inside(page, '[data-testid="language-control"]')).toBe(true);
    await tabTo(page, '[data-testid="language-counterpart"]');
    expect(await link.evaluate((el) => el.matches(":focus-visible"))).toBe(
      true,
    );
    await axeClean(page);
    // Native link behavior: Enter follows it.
    await Promise.all([
      page.waitForURL("**/pt/guia/"),
      page.keyboard.press("Enter"),
    ]);
  });

  test("no-counterpart disclosure", async ({ page }) => {
    await mountLanguageControl(page, controls.disclosure);
    const control = page.getByTestId("language-control");
    await expect(control).toHaveAttribute("data-lang-state", "disclosure");
    const details = control.getByTestId("language-disclosure");
    const summary = details.getByTestId("language-summary");
    await expect(summary).toContainText("Português (Brasil)");
    await expect(summary.locator('[lang="pt-BR"]')).toHaveCount(1);
    expect(
      await height(page, '[data-testid="language-summary"]'),
    ).toBeGreaterThanOrEqual(44);
    await tabTo(page, '[data-testid="language-summary"]');
    expect(await summary.evaluate((el) => el.matches(":focus-visible"))).toBe(
      true,
    );
    await expect(details).not.toHaveAttribute("open", "");
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open", "");
    await expect(details.getByTestId("language-message")).toHaveText(
      "This page is not available in Portuguese.",
    );
    const home = details.getByTestId("language-home");
    await expect(home).toHaveAttribute("hreflang", "pt-BR");
    await expect(home).toHaveAttribute("href", "/pt/");
    expect(
      await height(page, '[data-testid="language-home"]'),
    ).toBeGreaterThanOrEqual(44);
    expect(await overflows(page)).toBe(false);
    expect(await inside(page, '[data-testid="language-home"]')).toBe(true);
    expect(await inside(page, '[data-testid="language-message"]')).toBe(true);
    await tabTo(page, '[data-testid="language-home"]');
    expect(await home.evaluate((el) => el.matches(":focus-visible"))).toBe(
      true,
    );
    await axeClean(page);
    // Space closes it again on the summary.
    await summary.focus();
    await page.keyboard.press("Space");
    await expect(details).not.toHaveAttribute("open", "");
  });

  test("Portuguese-only page discloses toward English with long Portuguese text inside the viewport", async ({
    page,
  }) => {
    await mountLanguageControl(page, controls.ptDisclosure);
    await page.getByTestId("language-summary").click();
    await expect(page.getByTestId("language-message")).toHaveText(
      "Esta página não está disponível em inglês.",
    );
    expect(await overflows(page)).toBe(false);
    expect(await inside(page, '[data-testid="language-message"]')).toBe(true);
    expect(await inside(page, '[data-testid="language-home"]')).toBe(true);
    await axeClean(page);
  });
});

test("the real search LANG link carries q and nothing else", async ({
  page,
}) => {
  await isolate(page, []);
  await page.goto(
    base("docs") + searchPath.docs + "?scope=everywhere&utm=x#frag",
  );
  await mountLanguageControl(page, controls.search);
  const link = page.locator('a[data-testid="language-counterpart"]');
  await expect(link).toHaveAttribute("href", "/pt/search/");
  const input = page.getByTestId("search-input");
  await input.fill("configuração nova");
  await expect(link).toHaveAttribute(
    "href",
    "/pt/search/?q=configura%C3%A7%C3%A3o+nova",
  );
  await input.fill("");
  await expect(link).toHaveAttribute("href", "/pt/search/");
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
});
