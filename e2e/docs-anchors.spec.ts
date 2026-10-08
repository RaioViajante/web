import { expect, test } from "@playwright/test";
import { base, isolate } from "./support";

// Visible section numbers are presentation: heading ids, "on this page" hrefs
// and the Docs search index are built from the title alone. Run against the
// real built Docs content.

const page_ = "/projects/sweep/";

test.describe("docs anchors and search titles", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("heading ids are title slugs while the numbers stay visible", async ({
    page,
  }) => {
    await isolate(page, []);
    await page.goto(base("docs") + page_);
    const headings = await page
      .locator(".prose h2, .prose h3")
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          id: node.id,
          tag: node.tagName,
          number: node.querySelector(".rv-num")?.textContent ?? "",
          title: (node.lastElementChild ?? node).textContent ?? "",
        })),
      );
    const h2 = headings.filter((heading) => heading.tag === "H2");
    expect(h2.length).toBeGreaterThan(3);
    h2.forEach((heading, index) => {
      expect(heading.number).toBe(index === 0 ? "01." : `01.${index}`);
      expect(heading.id).not.toMatch(/^\d/);
      expect(heading.id).toBe(
        heading.title
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s-]/gu, "")
          .replace(/\s/g, "-"),
      );
    });
    expect(headings.some((heading) => heading.id === "classification")).toBe(
      true,
    );
  });

  test("on this page keeps numbered labels, links to the ids and navigates", async ({
    page,
  }) => {
    await isolate(page, []);
    await page.goto(base("docs") + page_);
    const links = page.locator('nav[aria-label="on this page"] a');
    const entries = await links.evaluateAll((nodes) =>
      nodes.map((node) => ({
        href: node.getAttribute("href") ?? "",
        text: node.textContent ?? "",
      })),
    );
    const ids = await page
      .locator(".prose h2")
      .evaluateAll((nodes) => nodes.map((node) => node.id));
    expect(entries.map((entry) => entry.href)).toEqual(
      ids.map((id) => `#${id}`),
    );
    expect(entries[2]!.text).toMatch(/^01\.2\s*Classification$/);

    await links.nth(2).click();
    await expect(page).toHaveURL(/#classification$/);
    await expect(page.locator("#classification")).toBeInViewport();
    await links.nth(0).click();
    await expect(page).toHaveURL(new RegExp(`#${ids[0]}$`));
    await page.goBack();
    await expect(page).toHaveURL(/#classification$/);
    await expect(page.locator("#classification")).toBeInViewport();
    await page.goForward();
    await expect(page).toHaveURL(new RegExp(`#${ids[0]}$`));
    await expect(page.locator(`[id="${ids[0]}"]`)).toBeInViewport();

    // A direct load of the semantic fragment reaches the heading.
    await page.goto("about:blank");
    await page.goto(base("docs") + page_ + "#classification");
    await expect(page.locator("#classification")).toBeInViewport();
  });

  test("search entries have clean titles, semantic fragments and no number field", async () => {
    const entries = (await (
      await fetch(base("docs") + "/search-index.json")
    ).json()) as {
      title: string;
      href: string;
      description: string;
      number?: string;
    }[];
    const sections = entries.filter((entry) => entry.href.includes("#"));
    expect(sections.length).toBeGreaterThan(5);
    for (const entry of sections) {
      expect(entry.title, entry.href).not.toMatch(/^\d{2}\./);
      expect(entry.href).not.toMatch(/#\d/);
      expect(entry).not.toHaveProperty("number");
    }
    const classification = sections.find(
      (entry) => entry.title === "Classification",
    );
    expect(classification?.description).toBe("Sweep");
    expect(classification?.href).toMatch(/\/projects\/sweep\/#classification$/);
    expect(new Set(entries.map((entry) => entry.href)).size).toBe(
      entries.length,
    );
  });

  test("section queries retain semantic titles and page context", async ({
    page,
  }) => {
    await isolate(page, []);
    await page.goto(base("docs") + "/search/?q=classification");
    const results = page.locator("[data-search-result]");
    await expect(results.first()).toBeVisible();
    // The page matches through its body; the section matches by its title.
    const section = results.filter({ hasText: "Classification" });
    await expect(section).toHaveCount(1);
    await expect(section).toHaveAttribute(
      "href",
      /\/projects\/sweep\/#classification$/,
    );
    await expect(section).not.toContainText(/01\.\d/);
    await expect(section.locator(".rv-result__number")).toHaveText("02.");
    await page.goto(base("docs") + "/search/?q=sweep%20classification");
    await expect(section).toHaveCount(1);
    await expect(section).toHaveAttribute(
      "href",
      /\/projects\/sweep\/#classification$/,
    );
    await section.click();
    await expect(page).toHaveURL(/\/projects\/sweep\/#classification$/);
    await expect(page.locator("#classification")).toBeInViewport();
  });
});
