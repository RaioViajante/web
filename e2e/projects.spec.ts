import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { base, isolate, settleMotion, watchHealth } from "./support";

// Root's projects pages: the cards and "show more" on /projects, the cases,
// the catalog filter on /projects/all, the home cards, and the rule that
// nothing links to a page that does not exist. Every sitemap page is also audited by
// pages.spec.ts; these tests cover the states only interaction reaches.

async function open(page: Page, path: string) {
  const external: string[] = [];
  await isolate(page, external);
  const health = watchHealth(page);
  const response = await page.goto(base("root") + path, { waitUntil: "load" });
  expect(response?.status()).toBe(200);
  return { external, health };
}

async function axe(page: Page) {
  await settleMotion(page);
  const { violations } = await new AxeBuilder({ page })
    .withRules(["label-content-name-mismatch"])
    .options({ rules: { "label-content-name-mismatch": { enabled: true } } })
    .analyze();
  const all = await new AxeBuilder({ page }).analyze();
  expect(
    [...violations, ...all.violations].map(
      (violation) =>
        `${violation.id}: ${violation.nodes.map((node) => node.target).join(", ")}`,
    ),
  ).toEqual([]);
}

for (const width of [1440, 390, 360]) {
  test(`/projects shows four cards, the rest on demand, and the cases at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const { health } = await open(page, "/projects");
    const cards = page.locator("main .pj-pks article.pj-pk:visible");
    const first = ["Mochifile", "Ordelis", "Refrain", "Orbit"];
    const rest = ["yanawa", "Sweep", "Hum", "Morrowferry"];
    // Four projects up front; the cases' cards follow in their own grid.
    await expect(
      page.locator("#my-projects-heading ~ .pj-pks article:visible"),
    ).toHaveCount(4);
    for (const name of first)
      await expect(
        page.getByRole("heading", { level: 3, name, exact: true }),
      ).toBeVisible();
    for (const name of rest)
      await expect(
        page.getByRole("heading", { level: 3, name, exact: true }),
      ).toBeHidden();
    // Every card says its status in words, over its art.
    await expect(page.locator("#mochifile .pj-pk__status")).toHaveText(
      "pre-launch",
    );
    await expect(page.locator("#refrain .rf3")).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    // The other four appear in place, and the button says what it does.
    const more = page.getByRole("button", { name: "Show 4 more projects" });
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await more.focus();
    await page.keyboard.press("Enter");
    const fewer = page.getByRole("button", { name: "Show fewer projects" });
    await expect(fewer).toHaveAttribute("aria-expanded", "true");
    await expect(fewer).toBeFocused();
    for (const name of rest)
      await expect(
        page.getByRole("heading", { level: 3, name, exact: true }),
      ).toBeVisible();
    await expect(page.locator("#morrowferry")).toContainText(
      "no public link yet",
    );
    await expect(cards).toHaveCount(10);
    await fewer.click();
    await expect(more).toHaveAttribute("aria-expanded", "false");

    // Cases: both published, each linking only to its page. The demos are
    // only reachable from the case pages.
    await expect(page.locator("#stucco h3")).toHaveText("Stucco.");
    await expect(page.locator("#quadra h3")).toHaveText("Quadra");
    await expect(
      page.getByRole("link", { name: /^Read the case\s*: Quadra$/ }),
    ).toHaveAttribute("href", "/projects/quadra");
    await expect(page.locator('main a[href*="/work/"]')).toHaveCount(0);
    await expect(page.locator('a[href*="/projects/clients"]')).toHaveCount(0);

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(0);
    await axe(page);
    expect(health).toEqual([]);
  });
}

test("the catalog filters by kind, in both languages", async ({ page }) => {
  const { health } = await open(page, "/projects/all");
  const tiles = page.locator(".pj-grid__item:visible");
  await expect(tiles).toHaveCount(8);
  const shown = page.locator(".pj-filters__shown");
  await expect(shown).toHaveText("08 projects");
  // Projects without a logo show their initial in its place, hidden from
  // assistive technology because the name sits beside it.
  for (const [id, letter] of [
    ["sweep", "S"],
    ["hum", "H"],
  ])
    await expect(
      page.locator(`#${id} .pj-letter[aria-hidden="true"]`),
    ).toHaveText(letter);
  // Loops rest until a tile is hovered or focused (WCAG 2.2.2).
  const running = () =>
    page.evaluate(
      () =>
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation.playState === "running" &&
              (animation.effect as KeyframeEffect | null)?.target?.closest?.(
                ".mn",
              ),
          ).length,
    );
  expect(await running()).toBe(0);
  await page.locator(".pj-tile", { hasText: "Hum" }).hover();
  await expect.poll(running).toBeGreaterThan(0);
  const music = page.getByRole("button", { name: /^music/ });
  await music.focus();
  await page.keyboard.press("Space");
  await expect(music).toHaveAttribute("aria-pressed", "true");
  await expect(tiles).toHaveCount(2);
  await expect(shown).toHaveText("02 projects · music");
  await expect(tiles.getByRole("heading", { level: 3 })).toHaveText([
    "Refrain",
    "Hum",
  ]);
  await page.getByRole("button", { name: /^games/ }).click();
  await expect(tiles).toHaveCount(1);
  await expect(shown).toHaveText("01 project · games");
  await page.getByRole("button", { name: /^all/ }).click();
  await expect(tiles).toHaveCount(8);
  // The catalog marks "projects" as its section, not as the current page.
  const pagesNav = page.locator('.rv-nav[data-nav="pages"]');
  await expect(pagesNav.locator('[aria-current="true"]')).toHaveAttribute(
    "href",
    "/projects",
  );
  await expect(pagesNav.locator('[aria-current="page"]')).toHaveCount(0);
  await axe(page);

  await page.goto(base("root") + "/pt/projects/all");
  await page.getByRole("button", { name: /^música/ }).click();
  await expect(tiles).toHaveCount(2);
  await expect(shown).toHaveText("02 projetos · música");
  await expect(page.locator(".rv-lang a")).toHaveAttribute(
    "href",
    "/projects/all",
  );
  expect(health).toEqual([]);
});

for (const width of [390, 360])
  test(`Portuguese projects pages fit and pass axe at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ["/pt", "/pt/projects", "/pt/projects/all"]) {
      const { health } = await open(page, path);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
        path,
      ).toBeLessThanOrEqual(0);
      await axe(page);
      expect(health, path).toEqual([]);
    }
  });

test("the small sketches say when they show planned or simulated work", async ({
  page,
}) => {
  await open(page, "/");
  await expect(page.locator(".mn--ordelis")).toContainText(
    "planned workflow · sketch",
  );
  await expect(page.locator(".mn--orbit")).toContainText(
    "simulated in your browser",
  );
  await expect(page.locator(".mn--mochifile")).toContainText("example values");
});

test("projects pages link only to real pages and public destinations", async ({
  page,
}) => {
  await open(page, "/");
  for (const id of ["mochifile", "ordelis", "refrain", "orbit"])
    await expect(page.locator(`main article.pj-pk#${id}`)).toHaveCount(1);
  await expect(
    page.locator("#orbit").getByRole("link", { name: /Try the experiment/ }),
  ).toHaveAttribute(
    "href",
    "https://lab.raioviajante.com/experiments/execution-states/",
  );
  await page
    .getByRole("link", { name: /All projects, including client work/ })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.getByRole("link", { name: /View all projects/ }).click();
  await expect(page).toHaveURL(/\/projects\/all$/);
  await page.getByRole("link", { name: /02\. Projects/ }).click();
  await expect(page).toHaveURL(/\/projects$/);

  for (const path of [
    "/projects",
    "/projects/all",
    "/projects/quadra",
    "/pt/projects",
    "/pt/projects/all",
    "/pt/projects/quadra",
    "/",
    "/pt",
    "/about",
    "/pt/about",
    "/contact",
    "/pt/contact",
  ]) {
    await page.goto(base("root") + path);
    const hrefs = await page
      .locator("main a[href]")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
    for (const href of hrefs) {
      if (href.startsWith("mailto:")) continue;
      if (href.startsWith("https://")) {
        expect(href, path).not.toMatch(/RaioViajante\/(refrain|morrowferry)/i);
        continue;
      }
      const response = await page.request.get(
        base("root") + href.split("#")[0],
      );
      expect(response.status(), `${path} → ${href}`).toBe(200);
    }
  }
});
