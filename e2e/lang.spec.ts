import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  mountLanguageControl,
  renderLanguageControls,
  tabTo,
} from "./lang-fixtures";
import {
  base,
  isolate,
  searchPath,
  sites,
  viewports,
  watchHealth,
} from "./support";

for (const site of sites)
  test(`${site} home has the shared clock and compact LANG at mobile and desktop widths`, async ({
    page,
  }) => {
    await isolate(page, []);
    const health = watchHealth(page);
    await page.setViewportSize(viewports.mobile);
    await page.goto(base(site) + "/");
    const utilityRow = page.locator(".rv-sound");
    const clock = utilityRow.locator(".rv-clock");
    await expect(clock.locator('span[aria-hidden="true"]')).toHaveText("SP");
    await expect(clock.locator("time")).toHaveText(/^\d{2}:\d{2}$/);
    await expect(clock.locator(".rv-sr-only")).toHaveText(
      "Owner's local time in SP:",
    );
    await expect(utilityRow.locator("[data-owner-clock]")).not.toHaveAttribute(
      "aria-live",
      /.*/,
    );
    await expect(utilityRow.locator("input, select")).toHaveCount(0);
    const lang = page.locator(".rv-sound .rv-lang");
    await expect(lang).toHaveAttribute("data-lang-state", "link");
    const link = lang.locator("a");
    const destination = site === "docs" || site === "lab" ? "/pt/" : "/pt";
    await expect(link).toHaveText("LANG EN");
    await expect(link).toHaveAccessibleName(
      "Language: English. Switch to Portuguese.",
    );
    await expect(link).toHaveAttribute("href", destination);
    await expect(link).toHaveAttribute("hreflang", "pt-BR");
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await overflows(page)).toBe(false);
    await page.setViewportSize(viewports.desktop);
    expect(await overflows(page)).toBe(false);
    expect(await inside(page, ".rv-sound")).toBe(true);
    await tabTo(page, ".rv-lang a");
    expect(await link.evaluate((el) => el.matches(":focus-visible"))).toBe(
      true,
    );
    await axeClean(page);
    await link.press("Enter");
    await expect(page).toHaveURL(base(site) + destination);
    await expect(page.locator(".rv-lang a[href='/']")).toHaveCount(1);
    await expect(page.locator(".rv-lang a")).toHaveText("LANG PT");
    expect(health).toEqual([]);
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
  const result = await new AxeBuilder({ page }).include(".rv-sound").analyze();
  expect(
    result.violations.map((v) => `${v.id}: ${v.nodes[0]?.target.join(" ")}`),
  ).toEqual([]);
}

const colorOf = (page: Page, selector: string) =>
  page.locator(selector).evaluate((node) => getComputedStyle(node).color);

test("the utility row keeps labels bright and applies hover only to state values", async ({
  page,
}) => {
  await isolate(page, []);
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const viewport of [viewports.mobile, viewports.desktop]) {
    await page.context().clearCookies();
    await page.setViewportSize(viewport);
    await page.goto(base("root") + "/");

    const clockLabel = ".rv-clock .rv-utility__label";
    const clockValue = ".rv-clock .rv-utility__value";
    const sound = ".rv-sound button";
    const soundLabel = `${sound} .rv-utility__label`;
    const soundValue = `${sound} .rv-sound__value`;
    const lang = ".rv-lang a";
    const langLabel = `${lang} .rv-utility__label`;
    const langValue = `${lang} .rv-utility__value`;

    const primary = await colorOf(page, clockLabel);
    const secondary = await colorOf(page, clockValue);
    expect(primary).not.toBe(secondary);
    expect(await colorOf(page, soundLabel)).toBe(primary);
    expect(await colorOf(page, langLabel)).toBe(primary);
    expect(await colorOf(page, soundValue)).toBe(secondary);
    expect(await colorOf(page, langValue)).toBe(secondary);

    await page.locator(sound).hover();
    expect(await colorOf(page, soundLabel)).toBe(primary);
    expect(await colorOf(page, soundValue)).not.toBe(secondary);
    expect(await colorOf(page, clockValue)).toBe(secondary);

    await page.locator(lang).hover();
    expect(await colorOf(page, langLabel)).toBe(primary);
    expect(await colorOf(page, langValue)).not.toBe(secondary);
    expect(await colorOf(page, clockValue)).toBe(secondary);

    await page.locator(sound).click();
    await expect(page.locator(sound)).toHaveAttribute("aria-pressed", "true");
    await page.locator("main h1").hover();
    expect(await colorOf(page, soundValue)).toBe(primary);
    expect(await colorOf(page, soundLabel)).toBe(primary);
  }
});

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
    const control = page.locator(".rv-sound .rv-lang");
    await expect(control).toHaveAttribute("data-lang-state", "link");
    const link = control.locator("a");
    await expect(link).toHaveText("LANG EN");
    await expect(link).toHaveAccessibleName(
      "Language: English. Switch to Portuguese.",
    );
    await expect(link).toHaveAttribute("hreflang", "pt-BR");
    await expect(link).toHaveAttribute("href", "/pt/guia/");
    expect(await height(page, ".rv-lang a")).toBeGreaterThanOrEqual(44);
    expect(await overflows(page)).toBe(false);
    expect(await inside(page, ".rv-lang")).toBe(true);
    await tabTo(page, ".rv-lang a");
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
    const control = page.locator(".rv-sound .rv-lang");
    await expect(control).toHaveAttribute("data-lang-state", "disclosure");
    const details = control.locator("details");
    const summary = details.locator("summary");
    await expect(summary).toHaveText("LANG EN");
    await expect(summary).toHaveAccessibleName(
      "Language: English. Check Portuguese availability.",
    );
    expect(await height(page, ".rv-lang summary")).toBeGreaterThanOrEqual(44);
    await tabTo(page, ".rv-lang summary");
    expect(await summary.evaluate((el) => el.matches(":focus-visible"))).toBe(
      true,
    );
    await expect(details).not.toHaveAttribute("open", "");
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open", "");
    await expect(details.locator("p")).toHaveText(
      "This page is not available in Portuguese.",
    );
    const home = details.locator("a");
    await expect(home).toHaveAttribute("hreflang", "pt-BR");
    await expect(home).toHaveAttribute("href", "/pt/");
    expect(await height(page, ".rv-lang details a")).toBeGreaterThanOrEqual(44);
    expect(await overflows(page)).toBe(false);
    expect(await inside(page, ".rv-lang details a")).toBe(true);
    expect(await inside(page, ".rv-lang details p")).toBe(true);
    await tabTo(page, ".rv-lang details a");
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
    await page.locator(".rv-lang summary").click();
    await expect(page.locator(".rv-lang details p")).toHaveText(
      "Esta página não está disponível em inglês.",
    );
    expect(await overflows(page)).toBe(false);
    expect(await inside(page, ".rv-lang details p")).toBe(true);
    expect(await inside(page, ".rv-lang details a")).toBe(true);
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
  const link = page.locator("a[data-lang-search]");
  await expect(link).toHaveAttribute("href", "/pt/search/");
  const input = page.locator("[data-search-input]");
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
