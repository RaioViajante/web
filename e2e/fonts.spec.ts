import { test, expect } from "@playwright/test";
import { base } from "./support";

// The font uses display: "optional", so a slow or failed download leaves the
// fallback on screen for the whole page view. That fallback must be monospace,
// not proportional Arial. Root and Dump are the Next apps that self-host it.
for (const site of ["root", "dump"] as const) {
  test(`${site} keeps a monospace fallback when the font cannot load`, async ({
    page,
  }) => {
    await page.route(/\.woff2(\?|$)/, (route) => route.abort());
    await page.goto(base(site) + "/");
    const widths = await page.evaluate(() => {
      const probe = (text: string) => {
        const span = document.createElement("span");
        span.style.cssText =
          "position:absolute;white-space:pre;visibility:hidden";
        span.textContent = text;
        document.body.append(span);
        const width = span.getBoundingClientRect().width;
        span.remove();
        return width;
      };
      return {
        narrow: probe("iiiiiiiiii"),
        wide: probe("mmmmmmmmmm"),
        loaded: [...document.fonts].some(
          (font) =>
            !font.family.includes("Fallback") && font.status === "loaded",
        ),
      };
    });
    expect(widths.loaded).toBe(false);
    // Equal advance widths are what make a face monospace.
    expect(widths.narrow).toBeCloseTo(widths.wide, 1);
  });
}
