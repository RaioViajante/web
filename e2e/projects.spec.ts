import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { base, isolate, watchHealth } from "./support";

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
    await expect(page.locator("main article.pj-card")).toHaveCount(4);
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
    await expect(cancel).toBeEnabled();
    await cancel.click();
    await expect(
      orbit.getByRole("list", { name: "State changes" }),
    ).toContainText("cancelled");

    // Client work: honest empty state, and no route that does not exist.
    await expect(
      page.getByText("No client cases published yet."),
    ).toBeVisible();
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
  await expect(page.getByText("08 projects")).toBeVisible();
  const music = page.getByRole("button", { name: /^music/ });
  await music.focus();
  await page.keyboard.press("Space");
  await expect(music).toHaveAttribute("aria-pressed", "true");
  await expect(tiles).toHaveCount(2);
  await expect(page.getByText("02 projects")).toBeVisible();
  await expect(tiles.getByRole("heading", { level: 3 })).toHaveText([
    "Refrain",
    "Hum",
  ]);
  await page.getByRole("button", { name: /^games/ }).click();
  await expect(tiles).toHaveCount(1);
  await expect(page.getByText("01 project", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^all/ }).click();
  await expect(tiles).toHaveCount(8);
  // The catalog keeps "projects" current in the sidebar.
  await expect(
    page
      .getByRole("link", { name: /projects/, exact: false })
      .and(page.locator('[aria-current="page"]')),
  ).toHaveAttribute("href", "/projects");
  await axe(page);

  await page.goto(base("root") + "/pt/projects/all");
  await page.getByRole("button", { name: /^música/ }).click();
  await expect(tiles).toHaveCount(2);
  await expect(page.getByText("02 projetos")).toBeVisible();
  await expect(page.locator(".rv-lang a")).toHaveAttribute(
    "href",
    "/projects/all",
  );
  expect(health).toEqual([]);
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
