// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IndexHeader, PageHeader } from "../components/page";
import { TYPED_STEPS, TypedTitle, typedSteps } from "../components/typed-title";

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

  it("type short titles a character at a time, long ones in at most twenty steps", () => {
    expect(typedSteps("docs")).toEqual(["d", "o", "c", "s"]);
    const long = "I Started Designing a Language Before I Could Compile One";
    const steps = typedSteps(long);
    expect(steps).toHaveLength(TYPED_STEPS);
    expect(steps.join("")).toBe(long);
    // The caret is the last step's shadow, so that step is one character.
    expect(steps.at(-1)).toBe("e");
    const title = h1(renderToStaticMarkup(<TypedTitle text={long} />));
    expect(title.textContent).toBe(long);
    expect(title.lastElementChild!.className).toBe(`rv-c${TYPED_STEPS - 1}`);
  });

  it("have a place for every step, and type only when motion is welcome", () => {
    for (let index = 0; index < TYPED_STEPS; index++)
      expect(css).toContain(`.rv-c${index} {\n  --rv-i: ${index};\n}`);
    expect(css).not.toContain(`.rv-c${TYPED_STEPS} {`);
    // Nothing types under reduced motion: every animation is inside the
    // no-preference query.
    const outside = css.replace(
      /@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}\n/,
      "",
    );
    expect(outside).not.toMatch(/animation: rv-/);
  });
});
