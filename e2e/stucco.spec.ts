import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { base, isolate, settleMotion, watchHealth } from "./support";

// The Stucco. client case: the card's one link, the tour, the brand toggles
// and the demo layer, whose iframe depends on the per-page framing rules.

async function open(page: Page, path: string) {
  await isolate(page, []);
  const health = watchHealth(page);
  const response = await page.goto(base("root") + path, { waitUntil: "load" });
  expect(response?.status()).toBe(200);
  return health;
}

const demoButton = (page: Page) =>
  page.getByRole("button", { name: "Open the demo" });
const layer = (page: Page) =>
  page.getByRole("dialog", { name: "Stucco. demo" });
const closeDemo = (page: Page) =>
  page.getByRole("button", { name: "Close the demo" });
const noScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.style.overflow);

async function demoLoaded(page: Page) {
  const frame = page.frameLocator('iframe[title="Stucco. demo"]');
  await expect(frame.locator("body")).toBeVisible();
  // The script ran, which the CSP would have prevented on a nonce policy.
  await expect(frame.locator(".burger").first()).toBeVisible();
  return frame;
}

test("the /projects card links only to the case, by full navigation", async ({
  page,
}) => {
  await open(page, "/projects");
  const card = page.locator("#stucco");
  await expect(card.getByRole("link")).toHaveCount(1);
  await expect(card.locator(".st-art")).toHaveAttribute("aria-hidden", "true");
  let documents = 0;
  page.on("response", (response) => {
    if (response.request().isNavigationRequest()) documents++;
  });
  await card.getByRole("link", { name: "Read the case" }).click();
  await expect(page).toHaveURL(/\/projects\/stucco$/);
  expect(documents).toBeGreaterThan(0);
  await demoButton(page).click();
  await demoLoaded(page);
});

test("the slideshow waits for the card to be in view", async ({ page }) => {
  await open(page, "/projects");
  const art = page.locator("#stucco .st-art");
  await expect(art).toHaveClass(/st-wait/);
  await art.scrollIntoViewIfNeeded();
  await expect(art).not.toHaveClass(/st-wait/);
});

test("the tour wraps, follows the device and keeps its step in view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "/projects/stucco");
  const tour = page.locator("#sc-tour");
  const counter = tour.locator(".sc-n");
  await expect(counter).toHaveText("01 / 11 · Home");
  await tour.getByRole("button", { name: "Previous" }).click();
  await expect(counter).toHaveText("11 / 11 · Contact");
  await expect(tour.locator(".sc-url")).toContainText("contact.html");
  // The device already showing keeps its place.
  await tour.getByRole("button", { name: "desktop" }).click();
  await expect(counter).toHaveText("11 / 11 · Contact");
  await tour.getByRole("button", { name: "Next" }).click();
  await expect(counter).toHaveText("01 / 11 · Home");
  await tour.getByRole("button", { name: "mobile" }).click();
  await expect(counter).toHaveText("01 / 15 · Home");
  await expect(tour.locator(".sc-phone img")).toBeVisible();
  const last = tour.locator(".sc-th").last();
  await last.click();
  await expect(last).toHaveAttribute("aria-pressed", "true");
  await expect(counter).toHaveText("15 / 15 · Contact");
  await expect
    .poll(() =>
      last.evaluate((button) => {
        const strip = button.parentElement!.getBoundingClientRect();
        const box = button.getBoundingClientRect();
        return box.left >= strip.left && box.right <= strip.right;
      }),
    )
    .toBe(true);
});

test("a brand piece swaps between mockup and art", async ({ page }) => {
  await open(page, "/projects/stucco");
  const piece = page.locator(".bd-item").first();
  const art = piece.getByRole("button", { name: "art" });
  await art.click();
  await expect(art).toHaveAttribute("aria-pressed", "true");
  await expect(piece.locator(".bd-art img").first()).toBeVisible();
  await expect(piece.locator(".bd-mock")).toBeHidden();
});

test("the demo layer traps focus, locks scrolling and restores the trigger", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const health = await open(page, "/projects/stucco");
  await demoButton(page).click();
  await expect(layer(page)).toBeVisible();
  await expect(layer(page)).toHaveAttribute("aria-modal", "true");
  await expect(closeDemo(page)).toBeFocused();
  expect(await noScroll(page)).toBe("hidden");
  // The site's search shortcut must not navigate away from behind the layer.
  for (const shortcut of ["/", "Control+k", "Control+Shift+K"])
    await page.keyboard.press(shortcut);
  await expect(layer(page)).toBeVisible();
  await expect(page).toHaveURL(/\/projects\/stucco$/);
  const frame = await demoLoaded(page);

  await layer(page).getByRole("button", { name: "mobile" }).click();
  await expect
    .poll(() =>
      page
        .locator(".dm-frame")
        .evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeLessThanOrEqual(420);

  // Inside the demo, Esc closes the demo's own menu first.
  await frame.locator(".burger").first().click();
  await expect(frame.locator(".menu-open").first()).toBeAttached();
  await frame.locator(".burger").first().press("Escape");
  await expect(frame.locator(".menu-open")).toHaveCount(0);
  await expect(layer(page)).toBeVisible();

  // Esc from inside the demo, which is a separate window.
  await frame.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.press("Escape");
  await expect(layer(page)).toHaveCount(0);
  await expect(demoButton(page)).toBeFocused();
  expect(await noScroll(page)).toBe("");

  await page.keyboard.press("Enter");
  await expect(closeDemo(page)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(layer(page)).toHaveCount(0);

  await demoButton(page).click();
  await page.mouse.click(4, 450);
  await expect(layer(page)).toHaveCount(0);
  expect(health).toEqual([]);
});

test("#demo opens the layer and closing it removes the hash", async ({
  page,
}) => {
  await open(page, "/projects/stucco#demo");
  await expect(layer(page)).toBeVisible();
  await demoLoaded(page);
  await closeDemo(page).click();
  await expect(layer(page)).toHaveCount(0);
  await expect(page).toHaveURL(/\/projects\/stucco$/);
});

test("under 760px the layer is the full screen, with no device toggle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/projects/stucco");
  await demoButton(page).click();
  await expect(layer(page).getByRole("group")).toBeHidden();
  await expect
    .poll(() =>
      page.locator(".dm-frame").evaluate((element) => {
        const box = element.getBoundingClientRect();
        return [box.left, box.top, box.width, box.height].map(Math.round);
      }),
    )
    .toEqual([0, 0, 390, 844]);
});

test("reduced motion stills the slideshow and the layer", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/projects");
  const first = page.locator("#stucco .st-win .st-sl.s1");
  await expect(first).toHaveCSS("animation-name", "none");
  await expect(first).toHaveCSS("opacity", "1");
  await page.goto(`${base("root")}/projects/stucco`);
  await demoButton(page).click();
  await expect(layer(page)).toBeVisible();
  expect(
    await page
      .locator(".dm-frame")
      .evaluate((element) => element.getAnimations().length),
  ).toBe(0);
});

test("the demo stays out of the indexes and is only framed by this site", async ({
  page,
  request,
}) => {
  await open(page, "/");
  for (const path of [
    "/sitemap.xml",
    "/search-index.json",
    "/pt/search-index.json",
  ]) {
    const body = await (await request.get(base("root") + path)).text();
    expect(body, path).not.toContain("/work/");
    expect(body, path).toContain("/projects/stucco");
  }
  const response = await request.get(`${base("root")}/work/stucco/index.html`);
  expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'self'",
  );
});

test("the states only interaction reaches pass axe and use the shared focus ring", async ({
  page,
}) => {
  await open(page, "/projects/stucco");
  await settleMotion(page);
  for (const button of await page
    .getByRole("button", { name: "art", exact: true })
    .all())
    await button.click();
  // Measure the pressed colors at rest, not during their transition.
  await settleMotion(page);
  // The demo is checked as its own document; this covers the page around it.
  const violations = async () =>
    (await new AxeBuilder({ page }).exclude("iframe").analyze()).violations.map(
      (violation) =>
        `${violation.id}: ${violation.nodes.map((node) => node.target).join(", ")}`,
    );
  expect(await violations()).toEqual([]);

  await demoButton(page).click();
  await demoLoaded(page);
  await settleMotion(page);
  expect(await violations()).toEqual([]);
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator(".dm-btn")).toBeFocused();
  await expect(page.locator(".dm-btn")).toHaveCSS("outline-width", "2px");
  await expect(page.locator(".dm-btn")).toHaveCSS("outline-style", "solid");
});

test("keyboard focus on the card pauses the slideshow", async ({ page }) => {
  await open(page, "/projects");
  const slide = page.locator("#stucco .st-win .st-sl.s1");
  await slide.scrollIntoViewIfNeeded();
  await expect(page.locator("#stucco .st-art")).not.toHaveClass(/st-wait/);
  await expect(slide).toHaveCSS("animation-play-state", "running");
  await page.locator("#stucco a").focus();
  await expect(slide).toHaveCSS("animation-play-state", "paused");
});
