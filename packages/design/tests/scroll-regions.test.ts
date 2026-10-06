// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { updateScrollRegion } from "../scroll-regions";

function region(
  scrollWidth: number,
  clientWidth: number,
  html = "<div></div>",
) {
  document.body.innerHTML = html;
  const node = document.body.firstElementChild as HTMLElement;
  Object.defineProperty(node, "scrollWidth", {
    value: scrollWidth,
    configurable: true,
  });
  Object.defineProperty(node, "clientWidth", {
    value: clientWidth,
    configurable: true,
  });
  return node;
}

describe("scroll regions", () => {
  it("adds a labelled tab stop only when the region overflows", () => {
    const wide = region(800, 390, '<div class="table-block"></div>');
    updateScrollRegion(wide);
    expect(wide.tabIndex).toBe(0);
    expect(wide.getAttribute("role")).toBe("region");
    expect(wide.getAttribute("aria-label")).toBe("Table, scrolls sideways");

    const fits = region(390, 390, '<div class="table-block"></div>');
    updateScrollRegion(fits);
    expect(fits.hasAttribute("tabindex")).toBe(false);
    expect(fits.hasAttribute("role")).toBe(false);
  });

  it("removes what it added once the region fits, and honors a custom label", () => {
    const node = region(
      800,
      390,
      '<pre data-scroll-label="Boot sector"></pre>',
    );
    updateScrollRegion(node);
    expect(node.getAttribute("aria-label")).toBe("Boot sector");
    Object.defineProperty(node, "scrollWidth", { value: 390 });
    updateScrollRegion(node);
    expect(node.hasAttribute("tabindex")).toBe(false);
    expect(node.hasAttribute("aria-label")).toBe(false);
  });

  it("leaves an author's own tabindex alone", () => {
    const node = region(800, 390, '<div tabindex="-1"></div>');
    updateScrollRegion(node);
    expect(node.tabIndex).toBe(-1);
    expect(node.hasAttribute("role")).toBe(false);
  });
});
