import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { base, isolate, settleMotion, watchHealth } from "./support";

// The parts of Root's redesign only interaction reaches: the Quadra demo
// layer (whose demo handles Esc itself and stores nothing), and Contact's
// email card, subjects, copy button and phones' sticky button.

async function open(page: Page, path: string) {
  await isolate(page, []);
  const health = watchHealth(page);
  const response = await page.goto(base("root") + path, { waitUntil: "load" });
  expect(response?.status()).toBe(200);
  return health;
}

async function axe(page: Page) {
  await settleMotion(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.map(
      (violation) =>
        `${violation.id}: ${violation.nodes.map((node) => node.target).join(", ")}`,
    ),
  ).toEqual([]);
}

test("the Quadra demo opens in the layer, keeps its own Esc and stores nothing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const health = await open(page, "/projects/quadra");
  const demo = page.getByRole("button", { name: "Open the demo" });
  await demo.click();
  const layer = page.getByRole("dialog", { name: "Quadra demo" });
  await expect(layer).toBeVisible();
  const frame = page.frameLocator('iframe[title="Quadra demo"]');
  // The demo's script ran under its CSP and drew the sign-in screen.
  await expect(
    frame.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await frame
    .getByRole("button", { name: /Explore with the demo account/ })
    .click();
  const demoWindow = page
    .frames()
    .find((item) => item.url().includes("/work/quadra/"))!;
  // When the demo uses Esc itself (its dialogs, drawers and menus mark the
  // key handled), the layer stays open.
  await demoWindow.evaluate(() => {
    const handled = (event: KeyboardEvent) => {
      if (event.key === "Escape") event.preventDefault();
    };
    document.addEventListener("keydown", handled, { once: true });
  });
  await frame.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.press("Escape");
  await expect(layer).toBeVisible();
  // Nothing the visitor did was stored in the browser.
  expect(
    await demoWindow.evaluate(() => [
      localStorage.length,
      sessionStorage.length,
    ]),
  ).toEqual([0, 0]);
  // Otherwise Esc inside the demo closes the layer.
  await page.keyboard.press("Escape");
  await expect(layer).toHaveCount(0);
  await expect(demo).toBeFocused();
  expect(health).toEqual([]);
});

test("the Quadra case credits Rafael's real profile, in a new tab", async ({
  page,
}) => {
  await open(page, "/projects/quadra");
  const links = page.locator('.sc-credit a[href^="https://"]');
  await expect(links).toHaveCount(2);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/diasgarcia/",
    );
    await expect(link).toHaveAttribute("target", "_blank");
  }
  // No placeholder link is left in the page.
  await expect(page.locator('main a[href^="#"]')).toHaveCount(0);
});

test("Contact's subjects fill the email and the address copies", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-write"]);
  await page.setViewportSize({ width: 1440, height: 900 });
  const health = await open(page, "/contact");
  const write = page.getByRole("link", { name: "Write an email" });
  await expect(write).toHaveAttribute("href", "mailto:mail@raioviajante.com");
  const music = page.getByRole("button", { name: "Music" }).first();
  await music.focus();
  await page.keyboard.press("Enter");
  await expect(music).toHaveAttribute("aria-pressed", "true");
  await expect(write).toHaveAttribute(
    "href",
    "mailto:mail@raioviajante.com?subject=Music",
  );
  await expect(page.locator(".ct-hint")).toHaveText(
    "Recommend me an album and tell me why it matters.",
  );
  await music.click();
  await expect(music).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Copy address" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  await expect(page.locator(".ct-mail [aria-live]").first()).toHaveText(
    "Copied",
  );
  // Each offer writes its own subject.
  await expect(
    page.getByRole("link", { name: /^Interfaces/ }),
  ).toHaveAttribute(
    "href",
    "mailto:mail@raioviajante.com?subject=Project%3A%20Interfaces",
  );
  await axe(page);
  expect(health).toEqual([]);
});

test("on phones, Write to me appears only once the email card has scrolled past", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const health = await open(page, "/pt/contact");
  const sticky = page.locator(".ct-sticky");
  await expect(sticky).toHaveAttribute("aria-hidden", "true");
  await expect(sticky).toHaveAttribute("tabindex", "-1");
  await page.locator("#offers-heading").scrollIntoViewIfNeeded();
  await page.evaluate(() => scrollBy(0, 600));
  await expect(sticky).toHaveAttribute("aria-hidden", "false");
  await expect(sticky).toHaveAttribute("tabindex", "0");
  await expect(sticky).toBeInViewport();
  await page.evaluate(() => scrollTo(0, 0));
  await expect(sticky).toHaveAttribute("aria-hidden", "true");
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
