import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { base, isolate, settleMotion, watchHealth } from "./support";

// Root's projects pages: the four interactive sketches on /projects, the
// catalog filter on /projects/all, the home cards, and the rule that nothing
// links to a page that does not exist. Every sitemap page is also audited by
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
  test(`/projects sketches work by keyboard and pointer at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const { health } = await open(page, "/projects");
    await expect(page.locator("main .pj-list article.pj-card")).toHaveCount(4);
    for (const name of ["Mochifile", "Ordelis", "Refrain", "Orbit"])
      await expect(
        page.getByRole("heading", { level: 3, name, exact: true }),
      ).toBeVisible();

    // Mochifile: a target size changes the example result, which stays under it.
    const mochifile = page.getByRole("group", { name: /^Mochifile sketch/ });
    await expect(mochifile).toContainText("192 KB · under 200 KB");
    const target = mochifile.getByRole("button", { name: "500 KB" });
    await target.focus();
    await page.keyboard.press("Enter");
    await expect(target).toHaveAttribute("aria-pressed", "true");
    await expect(mochifile).toContainText("480 KB · under 500 KB");
    await expect(mochifile).toContainText("example values");
    // The design's other two tabs: visual only, and said to be coming soon.
    await expect(mochifile).not.toContainText("coming soon");
    await mochifile.getByRole("button", { name: "Convert" }).click();
    await mochifile.getByRole("button", { name: "PNG" }).click();
    await expect(mochifile).toContainText("photo.png");
    await expect(mochifile.locator(".mo-badge")).toHaveText("+105%");
    await expect(mochifile).toContainText(
      "coming soon to Mochifile · example values",
    );
    await expect(mochifile.locator(".mo-meta[aria-live]")).toContainText(
      "coming soon to Mochifile",
    );
    await mochifile.getByRole("button", { name: "Resize" }).click();
    await mochifile.getByRole("button", { name: "1080" }).click();
    await expect(mochifile).toContainText("410 KB · 1080 × 810");
    await expect(mochifile.locator(".mo-frame")).toBeVisible();
    await mochifile.getByRole("button", { name: "Compress" }).click();
    await expect(mochifile).toContainText("480 KB · under 500 KB");

    // Ordelis: the planned review step answers both decisions.
    const ordelis = page.getByRole("group", { name: /^Ordelis sketch/ });
    await expect(ordelis).toContainText("planned workflow");
    await ordelis.getByRole("button", { name: "Approve" }).click();
    await expect(ordelis).toContainText("Approved by you. Ready to merge.");
    await ordelis.getByRole("button", { name: "Request changes" }).click();
    await expect(ordelis).toContainText("Sent back with your notes.");

    // Refrain: the record plays and stops; its name follows its visible label.
    const record = page.getByRole("button", { name: "play the record" });
    await record.click();
    await expect(
      page.getByRole("button", { name: "stop the record" }),
    ).toBeVisible();
    await expect(page.locator(".sk--refrain")).toHaveAttribute(
      "data-playing",
      "true",
    );
    await page.getByRole("button", { name: "stop the record" }).click();
    await expect(page.locator(".sk--refrain")).not.toHaveAttribute(
      "data-playing",
      /.*/,
    );

    // Orbit: queue and cancel follow Orbit's rules, simulated in the browser.
    const orbit = page.getByRole("group", { name: /^Orbit sketch/ });
    await expect(orbit).toContainText("simulated in your browser");
    await orbit.getByRole("button", { name: "Queue a job" }).click();
    await expect(
      orbit.getByRole("list", { name: "State changes" }),
    ).toContainText("queued");
    const cancel = orbit.getByRole("button", { name: "Cancel" });
    await expect(cancel).toHaveAttribute("aria-disabled", "false");
    await cancel.focus();
    await page.keyboard.press("Enter");
    await expect(
      orbit.getByRole("list", { name: "State changes" }),
    ).toContainText("cancelled");
    // Focus stays on Cancel even when nothing is left to cancel.
    await expect(cancel).toBeFocused();

    // Client work: the published case, the next slot, and no route that does
    // not exist. The demo itself is only reachable from the case page.
    await expect(page.locator("#stucco h3")).toHaveText("Stucco.");
    await expect(page.locator("main .pj-empty")).toContainText(
      "Case coming soon",
    );
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
    await expect(
      page.locator(`a.pj-home-card[href="/projects#${id}"]`),
    ).toHaveCount(1);
  await page.locator('a.pj-home-card[href="/projects#orbit"]').click();
  await expect(page).toHaveURL(/\/projects#orbit$/);
  await page.getByRole("link", { name: /View all projects/ }).click();
  await expect(page).toHaveURL(/\/projects\/all$/);
  await page.getByRole("link", { name: /02\. Projects/ }).click();
  await expect(page).toHaveURL(/\/projects$/);

  for (const path of [
    "/projects",
    "/projects/all",
    "/pt/projects",
    "/pt/projects/all",
    "/",
    "/pt",
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
