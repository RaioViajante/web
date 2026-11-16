// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IndexHeader, PageHeader } from "../components/page";
import { TYPED_MAX, TypedTitle, typedPace } from "../components/typed-title";

// The jsdom environment gives import.meta.url an http scheme; tests run from
// the package folder.
const css = readFileSync(resolve("styles/typed.css"), "utf8");
const h1 = (markup: string) => {
  const host = document.createElement("div");
  host.innerHTML = markup;
  return host.querySelector("h1")!;
};

describe("typed page titles", () => {
  it("keep the plain title as the heading's text", () => {
    const title = h1(
      renderToStaticMarkup(<TypedTitle text="Oi, aqui é o Bryan." />),
    );
    expect(title.textContent).toBe("Oi, aqui é o Bryan.");
    expect(title.getAttribute("aria-label")).toBe("Oi, aqui é o Bryan.");
    expect(title.querySelectorAll("span")).toHaveLength(19);
    expect(title.getAttribute("style")).toBeNull();
    expect(title.querySelector("[style]")).toBeNull();
  });

  it("are what every shared header renders", () => {
    for (const markup of [
      renderToStaticMarkup(<PageHeader title="Projects" />),
      renderToStaticMarkup(<IndexHeader name="dump" line="a line" />),
    ])
      expect(h1(markup).classList.contains("rv-typed")).toBe(true);
  });

  it("give characters past the last delay the last one", () => {
    const long = "x".repeat(TYPED_MAX + 5);
    const spans = h1(
      renderToStaticMarkup(<TypedTitle text={long} />),
    ).querySelectorAll("span");
    expect(spans[TYPED_MAX + 4]!.className).toBe(`rv-c${TYPED_MAX - 1}`);
  });

  it("have a delay for every index and a pace for every length", () => {
    for (let index = 0; index < TYPED_MAX; index++)
      expect(css).toContain(`.rv-c${index} {\n  --rv-i: ${index};\n}`);
    for (const length of [1, 20, 21, 40, 41, 120])
      expect(css).toMatch(
        typedPace(length) === "short"
          ? /\.rv-typed \{\n  --rv-type-step/
          : new RegExp(`data-pace="${typedPace(length)}"`),
      );
    // Nothing types under reduced motion: every animation is inside the
    // no-preference query.
    const outside = css.replace(
      /@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}\n/,
      "",
    );
    expect(outside).not.toMatch(/animation: rv-/);
  });
});
