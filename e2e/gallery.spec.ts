import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { base, isolate, watchHealth } from "./support";
import { galleryZip } from "../apps/root/lib/gallery-download";

test("Gallery ZIP preserves filenames, bytes, and CRC checks", async () => {
  const dir = mkdtempSync(join(tmpdir(), "gallery-zip-"));
  try {
    const content = new TextEncoder().encode("Original artwork bytes: café");
    const zip = galleryZip([
      { name: "personal/café.webp", data: content },
      { name: "branding/empty.png", data: new Uint8Array() },
    ]);
    const path = join(dir, "art.zip");
    writeFileSync(path, Buffer.from(await zip.arrayBuffer()));
    expect(execFileSync("unzip", ["-t", path], { encoding: "utf8" })).toContain(
      "No errors detected",
    );
    expect(
      execFileSync("python3", [
        "-c",
        "import sys, zipfile; z = zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; assert z.namelist() == ['personal/café.webp', 'branding/empty.png']; sys.stdout.buffer.write(z.read('personal/café.webp'))",
        path,
      ]),
    ).toEqual(Buffer.from(content));
  } finally {
    rmSync(dir, { recursive: true });
  }
});

for (const width of [1440, 390, 320]) {
  test(`Gallery viewer, keyboard, assets and downloads at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    const external: string[] = [];
    await isolate(page, external);
    const health = watchHealth(page);
    await page.goto(base("root") + "/gallery");
    const collection = page.locator("#gallery-collection");
    const cover = page.getByRole("button", {
      name: "Reveal the artwork collection",
    });
    await expect(cover).toBeVisible();
    await expect(collection).toBeHidden();
    await expect(
      page.getByRole("navigation", { name: "Collection sections" }),
    ).toBeHidden();
    await expect(page.getByRole("button", { name: /^View / })).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    // Reach the cover using the actual tab order, then exercise both native keys.
    for (
      let i = 0;
      i < 30 && !(await cover.evaluate((el) => el === document.activeElement));
      i++
    )
      await page.keyboard.press("Tab");
    await expect(cover).toBeFocused();
    await expect(cover).toHaveCSS("outline-style", "solid");
    await page.keyboard.press(width === 390 ? "Space" : "Enter");
    await expect(collection).toBeVisible();
    await expect(cover).toHaveAttribute("aria-expanded", "true");
    await expect(cover).toBeFocused();
    await expect(cover).toBeInViewport();
    await expect(
      page.getByRole("heading", { name: "Branding", exact: true }),
    ).toBeInViewport();
    await expect(
      collection.locator('button[aria-haspopup="dialog"]'),
    ).toHaveCount(41);
    await expect(page.locator("main")).not.toContainText(
      /requiem|pale choir|concept art/i,
    );
    await expect(page.locator(".gallery-sticker")).toHaveCount(30);
    await expect(page.locator(".gallery-profile")).toHaveCount(2);
    await expect(page.locator(".gallery-piece")).toHaveCount(9);
    const sticker = page.getByRole("button", {
      name: "View Work of art",
      exact: true,
    });
    await sticker.hover();
    await expect(sticker.locator(".gallery-caption")).toHaveCSS("opacity", "1");
    await sticker.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading")).toHaveText("Work of art");
    await expect(
      dialog.getByRole("button", { name: "Previous artwork" }),
    ).toHaveText("←");
    await expect(
      dialog.getByRole("button", { name: "Next artwork" }),
    ).toHaveText("→");
    for (const arrow of await dialog.locator(".gallery-arrow").all()) {
      await expect
        .poll(async () => (await arrow.boundingBox())!.width)
        .toBeGreaterThanOrEqual(44);
      await expect
        .poll(async () => (await arrow.boundingBox())!.height)
        .toBeGreaterThanOrEqual(44);
    }
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.getByRole("heading")).toHaveText("Still compiling");
    await page.keyboard.press("ArrowRight");
    await dialog
      .getByRole("button", { name: "Next artwork", exact: true })
      .click();
    await expect(dialog.getByRole("heading")).toHaveText("404");
    await dialog
      .getByRole("button", { name: "Previous artwork", exact: true })
      .click();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      expect(
        await page.evaluate(() =>
          Boolean(document.activeElement?.closest("dialog")),
        ),
      ).toBe(true);
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(sticker).toBeFocused();
    await expect(collection).toBeVisible();
    expect(
      await collection.evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter(
              (a) =>
                a instanceof CSSAnimation &&
                ["gallery-unfold", "gallery-release"].includes(a.animationName),
            ).length,
      ),
    ).toBe(0);
    await expect(sticker).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await page.mouse.click(2, 2);
    await expect(dialog).toHaveCount(0);
    await expect(sticker).toBeFocused();
    await page
      .getByRole("button", { name: "View Confused at the laptop" })
      .click();
    await expect(
      dialog.getByRole("link", { name: "download", exact: true }),
    ).toHaveAttribute(
      "download",
      "raioviajante-profiles-confused-at-the-laptop.png",
    );
    const singlePromise = page.waitForEvent("download");
    await dialog.getByRole("link", { name: "download", exact: true }).click();
    const single = await singlePromise;
    expect(single.suggestedFilename()).toBe(
      "raioviajante-profiles-confused-at-the-laptop.png",
    );
    expect(readFileSync((await single.path())!)).toEqual(
      readFileSync("packages/design/assets/gallery/profile-laptop.png"),
    );
    await dialog.getByRole("button", { name: "close", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page
      .getByRole("button", { name: "View Neon Code Lab Celebration" })
      .click();
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.getByRole("heading")).toHaveText(
      "Sad Man, Goofy Mirror Reflection",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await page.getByRole("button", { name: "download", exact: true }).click();
    await expect(dialog.getByRole("checkbox")).toHaveCount(3);
    await dialog.getByRole("checkbox", { name: /Profiles/ }).check();
    const zipPromise = page.waitForEvent("download");
    await dialog
      .getByRole("button", { name: "download .zip · 2 files" })
      .click();
    const zip = await zipPromise;
    expect(zip.suggestedFilename()).toBe("raioviajante-profiles.zip");
    const zipPath = (await zip.path())!;
    expect(
      execFileSync("unzip", ["-t", zipPath], { encoding: "utf8" }),
    ).toContain("No errors detected");
    const names = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" })
      .trim()
      .split("\n");
    expect(names).toEqual([
      "raioviajante-profiles-confused-at-the-laptop.png",
      "raioviajante-profiles-hmm.png",
    ]);
    if (width === 1440) {
      await dialog
        .getByRole("button", { name: "select all", exact: true })
        .click();
      const allPromise = page.waitForEvent("download");
      await dialog
        .getByRole("button", { name: "download .zip · 13 files" })
        .click();
      const all = await allPromise;
      expect(all.suggestedFilename()).toBe("raioviajante-gallery.zip");
      const allPath = (await all.path())!;
      expect(
        execFileSync("unzip", ["-t", allPath], { encoding: "utf8" }),
      ).toContain("No errors detected");
      const entries = execFileSync("unzip", ["-Z1", allPath], {
        encoding: "utf8",
      })
        .trim()
        .split("\n");
      expect(entries).toHaveLength(13);
      expect(new Set(entries.map((name) => name.split("/")[0]))).toEqual(
        new Set(["branding", "profiles", "personal"]),
      );
      expect(entries.join(" ")).not.toMatch(/requiem|pale-choir|concept/i);
      expect(
        execFileSync("unzip", ["-p", allPath, "branding/stickers.webp"], {
          maxBuffer: 2 * 1024 * 1024,
        }),
      ).toEqual(
        readFileSync("packages/design/assets/gallery/branding-stickers.webp"),
      );
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await page
      .getByRole("link", { name: "04.3 personal", exact: true })
      .click();
    await expect(collection).toBeVisible();
    await expect(page.locator("#gallery-personal")).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    for (const image of await collection.locator("img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty("complete", true);
      expect(
        await image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
      ).toBeGreaterThan(0);
    }
    expect(external).toEqual([]);
    expect(health).toEqual([]);
  });
}

test("Gallery reduced motion and failed collection download", async ({
  page,
}) => {
  await isolate(page, []);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base("root") + "/gallery");
  const cover = page.getByRole("button", {
    name: "Reveal the artwork collection",
  });
  await expect(cover.locator("img")).toHaveCSS("animation-name", "none");
  await cover.press("Space");
  await expect(page.locator("#gallery-collection")).toBeVisible();
  expect(
    await page
      .locator(".gallery-redesign")
      .evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await page.getByRole("button", { name: "View Search", exact: true }).click();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((node) => getComputedStyle(node).animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "download", exact: true }).click();
  await page.getByRole("checkbox", { name: /Branding/ }).check();
  await page.route("**/*branding-stickers*", (route) =>
    route.fulfill({ status: 503 }),
  );
  await page.getByRole("button", { name: "download .zip · 2 files" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "The collection could not be saved. Please try again.",
  );
  await expect(
    page.getByRole("button", { name: "download .zip · 2 files" }),
  ).toBeEnabled();
});

test("Gallery collection is available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await isolate(page, []);
  await page.goto(base("root") + "/gallery");
  await expect(page.locator("#gallery-collection")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Branding/ })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reveal the artwork collection" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "04.3 personal", exact: true }).click();
  await expect(page).toHaveURL(/#gallery-personal$/);
  await context.close();
});

test("Gallery uses one shared sound voice per entry and activation, gated by the preference", async ({
  page,
}) => {
  await isolate(page, []);
  const health = watchHealth(page);
  // Observe synthesis requests, never audio output or playback timing.
  await page.addInitScript(() => {
    const original = AudioContext.prototype.createOscillator;
    Object.assign(window, { galleryVoices: 0 });
    AudioContext.prototype.createOscillator = function () {
      (window as unknown as { galleryVoices: number }).galleryVoices++;
      return original.call(this);
    };
  });
  const voices = () =>
    page.evaluate(
      () => (window as unknown as { galleryVoices: number }).galleryVoices,
    );
  await page.goto(base("root") + "/gallery");
  const cover = page.getByRole("button", {
    name: "Reveal the artwork collection",
  });
  await expect(cover).toHaveAttribute("data-sound", "gallery");
  await cover.hover();
  expect(await voices()).toBe(0);
  await page.locator("[data-sound-toggle]").click();
  await expect(page.locator("[data-sound-toggle]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const beforeHover = await voices();
  await cover.hover();
  expect(await voices()).toBe(beforeHover + 1);
  // Transitions inside the same control must not count as another entry.
  await cover.locator("img").evaluate((el) =>
    el.dispatchEvent(
      new PointerEvent("pointerover", {
        bubbles: true,
        pointerType: "mouse",
        relatedTarget: el.parentElement,
      }),
    ),
  );
  expect(await voices()).toBe(beforeHover + 1);
  await cover.click();
  expect(await voices()).toBe(beforeHover + 2);
  // The reveal re-hit-tests the stationary pointer; no late duplicate hover
  // voice may arrive once the animations and scroll settle.
  await page.waitForTimeout(800);
  expect(await voices()).toBe(beforeHover + 2);
  const sticker = page.getByRole("button", {
    name: "View Work of art",
    exact: true,
  });
  await expect(
    page.locator('#gallery-collection button[data-sound="gallery"]'),
  ).toHaveCount(41);
  await sticker.hover();
  const beforeClick = await voices();
  await sticker.click();
  expect(await voices()).toBe(beforeClick + 1);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 12; i++) await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("heading")).toHaveText("It works!");
  await page.keyboard.press("Escape");
  await expect(sticker).toBeFocused();
  await expect(page.locator("#gallery-collection")).toBeVisible();
  // A synchronous burst across distinct artworks is bounded by the shared throttle.
  const beforeBurst = await voices();
  await page.locator(".gallery-sticker").evaluateAll((els) => {
    for (const el of els)
      el.dispatchEvent(
        new PointerEvent("pointerover", {
          bubbles: true,
          pointerType: "mouse",
        }),
      );
  });
  expect((await voices()) - beforeBurst).toBeLessThanOrEqual(1);
  await page.locator("[data-sound-toggle]").click();
  await expect(page.locator("[data-sound-toggle]")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  const muted = await voices();
  await sticker.hover();
  await sticker.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Next artwork" }).click();
  await dialog.getByRole("button", { name: "Previous artwork" }).click();
  await page.keyboard.press("Escape");
  expect(await voices()).toBe(muted);
  await page.locator("[data-sound-toggle]").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reduced = await voices();
  await sticker.hover();
  expect(await voices()).toBe(reduced);
  await sticker.click();
  expect(await voices()).toBe(reduced + 1);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await page.mouse.move(0, 0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const beforeTouch = await voices();
  await sticker.dispatchEvent("pointerover", { pointerType: "touch" });
  expect(await voices()).toBe(beforeTouch);
  expect(health).toEqual([]);
});

test("Gallery opening and immediate viewer activation remain independent", async ({
  page,
}) => {
  await isolate(page, []);
  const health = watchHealth(page);
  await page.goto(base("root") + "/gallery");
  await page.locator(".gallery-redesign").evaluate((el) => {
    Object.assign(window, { revealStarts: 0 });
    el.addEventListener("animationstart", (event) => {
      if (
        ["gallery-unfold", "gallery-release"].includes(
          (event as AnimationEvent).animationName,
        )
      )
        (window as unknown as { revealStarts: number }).revealStarts++;
    });
  });
  const cover = page.getByRole("button", {
    name: "Reveal the artwork collection",
  });
  await cover.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab"); // Existing avatar control.
  await page.keyboard.press("Tab"); // First artwork, while the reveal runs.
  const sticker = page.getByRole("button", {
    name: "View Work of art",
    exact: true,
  });
  await expect(sticker).toBeFocused();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(sticker).toBeFocused();
  await expect
    .poll(() =>
      page
        .locator("#gallery-collection")
        .evaluate((el) => el.getAnimations({ subtree: true }).length),
    )
    .toBe(0);
  const starts = await page.evaluate(
    () => (window as unknown as { revealStarts: number }).revealStarts,
  );
  expect(starts).toBeGreaterThan(0);
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sticker).toBeFocused();
  await expect(page.locator("#gallery-collection")).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as unknown as { revealStarts: number }).revealStarts,
    ),
  ).toBe(starts);
  expect(health).toEqual([]);
});
