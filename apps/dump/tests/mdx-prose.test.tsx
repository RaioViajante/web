import fs from "node:fs";
import path from "node:path";
import {
  createElement,
  type ComponentType,
  type ComponentPropsWithoutRef,
} from "react";
import { render, screen } from "@testing-library/react";

import { useMDXComponents } from "@/mdx-components";

const css = fs.readFileSync(
  path.join(process.cwd(), "app", "globals.css"),
  "utf8",
);

function cssRule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))?.[1] ?? "";
}

describe("MDX prose elements", () => {
  it("keeps inline code separate from fenced-code layout", () => {
    const inlineCode = cssRule(".prose :not(pre) > code");

    expect(inlineCode).toMatch(/font-family:\s*var\(--font-mono\)/);
    expect(inlineCode).not.toMatch(/display:\s*(?:block|grid|flex)/);
    expect(inlineCode).not.toMatch(/white-space:\s*pre/);
    expect(inlineCode).not.toMatch(/overflow-x:\s*auto/);
  });

  it("preserves table semantics inside a scrolling region", () => {
    const Table = useMDXComponents().table as ComponentType<
      ComponentPropsWithoutRef<"table">
    >;

    const { container } = render(
      createElement(Table, null, createElement("tbody", null)),
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(container.querySelector(".table-scroll > table")).toBe(
      screen.getByRole("table"),
    );
    expect(cssRule(".table-scroll")).toMatch(/overflow-x:\s*auto/);
  });

  it("leaves list and blockquote elements as semantic MDX defaults", () => {
    const components = useMDXComponents();

    expect(components.ul).toBeUndefined();
    expect(components.ol).toBeUndefined();
    expect(components.li).toBeUndefined();
    expect(components.blockquote).toBeUndefined();
  });
});
