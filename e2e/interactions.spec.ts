import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import {
  base,
  inventory,
  isolate,
  searchPath,
  watchHealth,
  type Site,
} from "./support";

// Targeted behavior of the shared interactive primitives, driven by the real
// keyboard (never element.focus()), on a desktop and a mobile viewport where it
// matters. Axe covers semantics; these cover what only interaction shows.

import { viewports } from "./support";

const desktop = viewports.desktop;

async function open(
  page: Page,
  site: Site,
  path: string,
  external: string[] = [],
) {
  await isolate(page, external);
  const health = watchHealth(page);
  await page.goto(base(site) + path, { waitUntil: "load" });
  await page.waitForLoadState("networkidle");
  return health;
}

/** Tab until `selector` is focused, at most `max` presses; false if never. */
async function tabTo(page: Page, selector: string, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    if (
      await page.evaluate(
        (s) => document.activeElement?.matches(s) ?? false,
        selector,
      )
    )
      return true;
  }
  return false;
}

// The focus ring is the one rule in the shared stylesheet; read it instead of
// restating it, so the test follows the design contract rather than a stale copy.
const css = readFileSync(
  new URL("../packages/design/styles/base.css", import.meta.url),
  "utf8",
);
const tokens = readFileSync(
  new URL("../packages/design/styles/tokens.css", import.meta.url),
  "utf8",
);
const ring =
  /:focus-visible\s*\{\s*outline:\s*(\S+)\s+solid\s+var\(--accent\);\s*outline-offset:\s*(\S+);/.exec(
    css,
  );
const accent = /--accent:\s*(#[0-9a-f]{6})/i.exec(tokens)?.[1];
const hex = (value: string) =>
  "#" +
  [...value.matchAll(/\d+/g)]
    .slice(0, 3)
    .map((m) => Number(m[0]).toString(16).padStart(2, "0"))
    .join("");

async function expectFocusRing(page: Page, what: string) {
  expect(
    ring,
    "the shared :focus-visible rule was not found in base.css",
  ).toBeTruthy();
  const style = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement!);
    return {
      style: s.outlineStyle,
      width: s.outlineWidth,
      offset: s.outlineOffset,
      color: s.outlineColor,
      match: document.activeElement!.matches(":focus-visible"),
    };
  });
  expect(style.match, `${what}: not :focus-visible after keyboard focus`).toBe(
    true,
  );
  expect(style.style, `${what}: outline style`).toBe("solid");
  expect(style.width, `${what}: outline width`).toBe(ring![1]);
  expect(style.offset, `${what}: outline offset`).toBe(ring![2]);
  expect(hex(style.color), `${what}: outline colour`).toBe(
    accent!.toLowerCase(),
  );
}

for (const [size, viewport] of Object.entries(viewports))
  test.describe(`global navigation (${size})`, () => {
    test.use({ viewport });

    for (const site of ["root", "dump", "docs", "lab"] as Site[])
      test(`${site}: skip link and nav links are keyboard operable with a visible focus ring`, async ({
        page,
      }) => {
        const health = await open(page, site, "/");
        await page.keyboard.press("Tab");
        await expect(page.locator(".rv-skip")).toBeFocused();
        await expectFocusRing(page, `${site} skip link`);
        // A nav link to another page is reachable, and Enter follows it.
        expect(await tabTo(page, "nav.rv-nav a:not([aria-current])")).toBe(
          true,
        );
        await expectFocusRing(page, `${site} nav link`);
        const target = await page.evaluate(
          () =>
            new URL((document.activeElement as HTMLAnchorElement).href)
              .pathname,
        );
        await Promise.all([
          page.waitForURL((url) => url.pathname === target),
          page.keyboard.press("Enter"),
        ]);
        await page.waitForLoadState("load");
        expect(health, health.join("\n")).toEqual([]);
      });
  });

test.describe("search", () => {
  test.use({ viewport: desktop });

  for (const site of ["root", "dump", "docs", "lab"] as Site[])
    test(`${site}: input, scope buttons and results work from the keyboard`, async ({
      page,
    }) => {
      const health = await open(page, site, searchPath[site]);
      const input = page.locator("[data-search-input]");
      await expect(input).toBeVisible();
      // The page focuses the input itself; it also has a name and is reachable.
      await expect(input).toBeFocused();
      const name = await input.evaluate(
        (el) =>
          (el as HTMLInputElement).labels?.[0]?.textContent ||
          el.getAttribute("aria-label"),
      );
      expect(name?.trim(), "search input has an accessible name").toBeTruthy();

      await input.fill("sweep");
      const results = page.locator("[data-search-result]");
      await expect(results.first()).toBeVisible();
      const first = await results.first().getAttribute("href");
      await page.keyboard.press("ArrowDown");
      // Moving the selection moves aria-current.
      await expect(
        page.locator("[data-search-result][aria-current=true]"),
      ).toHaveCount(1);

      // Scope buttons: Tab reaches them, Space toggles aria-pressed.
      expect(await tabTo(page, '[data-search-scope="site"]', 6)).toBe(true);
      await expectFocusRing(page, `${site} scope button`);
      await page.keyboard.press("Tab");
      await expect(
        page.locator('[data-search-scope="everywhere"]'),
      ).toBeFocused();
      await page.keyboard.press("Space");
      await expect(
        page.locator('[data-search-scope="everywhere"]'),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator('[data-search-scope="site"]')).toHaveAttribute(
        "aria-pressed",
        "false",
      );

      // The page is not indexed but behaves the same with or without a query.
      expect(first).toBeTruthy();
      expect(
        health.filter(
          (m) => !/search-index|Failed to load resource|ERR_/.test(m),
        ),
        health.join("\n"),
      ).toEqual([]);
    });

  test("a query in the URL fills the input and keeps the bare canonical", async ({
    page,
  }) => {
    await open(page, "root", "/search?q=sweep&utm_source=x");
    await expect(page.locator("[data-search-input]")).toHaveValue("sweep");
    expect(await page.locator("link[rel=canonical]").getAttribute("href")).toBe(
      "https://raioviajante.com/search",
    );
    expect(
      await page.locator("meta[name=robots]").getAttribute("content"),
    ).toBe("noindex, follow");
  });
});

for (const [size, viewport] of Object.entries(viewports))
  test.describe(`sound toggle (${size})`, () => {
    test.use({ viewport });

    for (const site of ["root", "dump", "docs", "lab"] as Site[])
      test(`${site}: no cookie until the keyboard toggles it, then on and off`, async ({
        page,
        context,
      }) => {
        const health = await open(page, site, "/");
        expect(
          await context.cookies(),
          "no cookie before any interaction",
        ).toEqual([]);
        expect(await tabTo(page, "[data-sound-toggle]", 6)).toBe(true);
        await expectFocusRing(page, `${site} sound toggle`);
        await expect(page.locator("[data-sound-toggle]")).toHaveAttribute(
          "aria-pressed",
          "false",
        );
        expect(
          await context.cookies(),
          "focusing is not an interaction that stores anything",
        ).toEqual([]);

        await page.keyboard.press("Enter");
        await expect(page.locator("[data-sound-toggle]")).toHaveAttribute(
          "aria-pressed",
          "true",
        );
        await expect(page.locator("[data-sound-toggle]")).toBeFocused();
        const [cookie] = await context.cookies();
        expect(cookie?.name).toBe("rv-sound");
        expect(cookie?.value).toBe("on");
        expect(cookie?.sameSite).toBe("Lax");
        expect(cookie?.path).toBe("/");
        // Host-only here: the .raioviajante.com Domain is production-only.
        expect(cookie?.domain).toBe("127.0.0.1");
        expect((cookie!.expires - Date.now() / 1000) / 86400).toBeGreaterThan(
          360,
        );

        await page.keyboard.press("Space");
        await expect(page.locator("[data-sound-toggle]")).toHaveAttribute(
          "aria-pressed",
          "false",
        );
        expect((await context.cookies())[0]?.value).toBe("off");
        expect(health, health.join("\n")).toEqual([]);
      });
  });

test.describe("dump comments (our own placeholder, never the giscus frame)", () => {
  test.use({ viewport: desktop });
  const SCRIPT = 'script[src="https://giscus.app/client.js"]';

  async function longArticle() {
    const { paths } = await inventory("dump");
    return paths.find((p) => p.startsWith("/posts/"))!;
  }

  test("before the trigger: a polite status and no giscus script; axe is clean", async ({
    page,
  }) => {
    const external: string[] = [];
    // The first article may be short enough to load comments on arrival; use
    // a tall viewport-independent check: only assert while the section is far.
    const path = await longArticle();
    await open(page, "dump", path, external);
    const far = await page.evaluate(
      () =>
        document.querySelector(".comments")!.getBoundingClientRect().top >
        innerHeight + 300,
    );
    test.skip(!far, "first article's comments are near the viewport");
    await expect(page.locator(".comments [role=status]")).toHaveText(
      /when you scroll/,
    );
    await expect(page.locator(SCRIPT)).toHaveCount(0);
    expect(external).toEqual([]);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });

  test("fallback without IntersectionObserver: Load comments is a reachable native button; focus follows", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // @ts-expect-error simulate a browser without the API
      delete window.IntersectionObserver;
    });
    const path = await longArticle();
    const health = await open(page, "dump", path);
    const button = page.getByRole("button", { name: "Load comments" });
    await expect(button).toBeVisible();
    expect(await button.evaluate((el) => el.tagName)).toBe("BUTTON");
    await expect(page.locator(SCRIPT)).toHaveCount(0);
    expect(await tabTo(page, ".comments button", 60)).toBe(true);
    await expectFocusRing(page, "Load comments");
    await page.keyboard.press("Enter");
    // The script loads once; the stub finishes it and the status goes away.
    await expect(page.locator(SCRIPT)).toHaveCount(1);
    await expect(page.locator(".comments [role=status]")).toHaveCount(0);
    expect(health, health.join("\n")).toEqual([]);
  });

  test("failure: status, a native Try again button, one script after the retry", async ({
    page,
  }) => {
    const path = await longArticle();
    let requests = 0;
    await page.addInitScript(() => {
      // @ts-expect-error simulate a browser without the API
      delete window.IntersectionObserver;
    });
    const health = await open(page, "dump", path);
    // Registered after the shared stub, so it wins: fail the first load only.
    await page.route("https://giscus.app/client.js", (route) =>
      ++requests === 1
        ? route.abort("failed")
        : route.fulfill({
            status: 200,
            contentType: "text/javascript",
            body: "",
          }),
    );
    await page.getByRole("button", { name: "Load comments" }).click();
    await expect(page.locator(".comments [role=status]")).toHaveText(
      "Comments could not be loaded.",
    );
    const retry = page.getByRole("button", { name: "Try again" });
    expect(await retry.evaluate((el) => el.tagName)).toBe("BUTTON");
    // Focus stays on the status text (set by the click) and the retry is the next stop.
    await expect(page.locator(".comments [role=status]")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(retry).toBeFocused();
    await expectFocusRing(page, "Try again");
    await page.keyboard.press("Enter");
    await expect(page.locator(SCRIPT)).toHaveCount(1);
    await expect(page.locator(".comments [role=status]")).toHaveCount(0);
    expect(requests).toBe(2);
    // The aborted request is the only expected console noise.
    expect(
      health.filter((m) => !/giscus\.app|ERR_FAILED/.test(m)),
      health.join("\n"),
    ).toEqual([]);
  });

  test("sign-in return (?giscus=): loads once at once, with no scroll, and stays accessible", async ({
    page,
  }) => {
    const path = await longArticle();
    const health = await open(page, "dump", `${path}?giscus=e2e-token`);
    await expect(page.locator(SCRIPT)).toHaveCount(1);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
    expect(health, health.join("\n")).toEqual([]);
  });
});

test.describe("lab experiments", () => {
  test.use({ viewport: desktop });

  test("every control inside an experiment is reachable by Tab and operable without errors", async ({
    page,
  }) => {
    const { paths } = await inventory("lab");
    let total = 0;
    for (const path of paths.filter((p) => p.startsWith("/experiments/"))) {
      const health = await open(page, "lab", path);
      const controls = await page.evaluate(
        () =>
          [
            ...document.querySelectorAll(
              "main button, main input, main select, main textarea, main summary, main [tabindex]",
            ),
          ].filter(
            (el) =>
              (el as HTMLElement).offsetParent !== null &&
              el.getAttribute("tabindex") !== "-1" &&
              !(el as HTMLButtonElement).disabled,
          ).length,
      );
      total += controls;
      console.log(`[lab] ${path}: ${controls} controls`);
      const reached = new Set<string>();
      for (let i = 0; i < 250; i++) {
        await page.keyboard.press("Tab");
        const id = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          if (!el || !el.closest("main")) return "";
          if (!el.dataset.e2eId) el.dataset.e2eId = String(Math.random());
          return el.dataset.e2eId;
        });
        if (id) reached.add(id);
        if (reached.size >= controls) break;
      }
      expect(
        reached.size,
        `${path}: reached ${reached.size} of ${controls} controls by Tab`,
      ).toBeGreaterThanOrEqual(controls);
      // Operate the first button with the keyboard: nothing may throw.
      const button = page.locator("main button").first();
      if (await button.count()) {
        await button.focus();
        await page.keyboard.press("Enter");
      }
      expect(health, `${path}\n${health.join("\n")}`).toEqual([]);
    }
    expect(
      total,
      "the lab experiments expose controls to test",
    ).toBeGreaterThan(0);
  });
});

test.describe("reduced motion", () => {
  test("the avatar loop and the CSS animations stop when the visitor prefers reduced motion", async ({
    browser,
  }) => {
    const motionOf = async (
      reducedMotion: "reduce" | "no-preference",
      site: Site,
      path: string,
    ) => {
      const context = await browser.newContext({
        viewport: desktop,
        reducedMotion,
      });
      const page = await context.newPage();
      await open(page, site, path);
      await page.waitForTimeout(1500);
      const avatarSrc = () =>
        page.evaluate(
          () =>
            document.querySelector<HTMLImageElement>("[data-avatar-coin] img")
              ?.src ?? "",
        );
      const first = await avatarSrc();
      await page.waitForTimeout(1500);
      const result = {
        running: await page.evaluate(
          () =>
            document.getAnimations().filter((a) => a.playState === "running")
              .length,
        ),
        avatarChanged: (await avatarSrc()) !== first,
        avatarDisabled: await page.evaluate(
          () =>
            document.querySelector<HTMLButtonElement>("[data-avatar-coin]")
              ?.disabled ?? null,
        ),
      };
      await context.close();
      return result;
    };
    // Control: motion exists when nothing is asked for...
    const normal = await motionOf("no-preference", "root", "/");
    expect(
      normal.running + Number(normal.avatarChanged),
      "the home page has motion to reduce",
    ).toBeGreaterThan(0);
    // ...and is gone when reduced motion is requested.
    for (const [site, path] of [
      ["root", "/"],
      ["root", "/gallery"],
      ["dump", "/"],
      ["docs", "/"],
      ["lab", "/"],
    ] as const) {
      const reduced = await motionOf("reduce", site, path);
      expect(reduced.running, `${site} ${path}: running animations`).toBe(0);
      expect(
        reduced.avatarChanged,
        `${site} ${path}: avatar still cycling`,
      ).toBe(false);
    }
  });
});
