import type { Element, ElementContent, Root } from "hast";

/** `01.` for the first section of a page, then `01.1`, `01.2`, … */
export function sectionNumber(index: number): string {
  return index === 0 ? "01." : `01.${index}`;
}

export interface SectionHeading {
  depth: number;
  slug: string;
  text: string;
  /** Present only on headings actually numbered by this plugin. */
  number?: string;
}

/** Read the semantic headings persisted through Astro's content renderer. */
export function getSectionHeadings(
  frontmatter: Record<string, unknown>,
): SectionHeading[] {
  if (!Array.isArray(frontmatter.sectionHeadings)) {
    throw new Error(
      "Enable captureHeadings in rehypeNumberSections before reading section headings",
    );
  }
  return frontmatter.sectionHeadings as SectionHeading[];
}

/** Concatenated text of a node's descendants, as `hast-util-to-string`. */
function textOf(node: Element): string {
  const part = (child: ElementContent): string =>
    child.type === "text"
      ? child.value
      : child.type === "element"
        ? textOf(child)
        : "";
  return node.children.map(part).join("");
}

/** Every heading element under `node`, in document order, at any depth. */
function* headingElements(node: Root | Element): Generator<Element> {
  for (const child of node.children) {
    if (child.type !== "element") continue;
    if (/^h[1-6]$/.test(child.tagName)) yield child;
    yield* headingElements(child);
  }
}

/**
 * Numbers a page's top-level `##` headings in document order with
 * `sectionNumber`, as a leading `.rv-num` span. With capture enabled, consumers
 * receive semantic titles and the exact number assigned to each heading.
 */
export function rehypeNumberSections({ captureHeadings = false } = {}) {
  return (
    tree: Root,
    file: {
      data: {
        [key: string]: unknown;
        astro?: { frontmatter?: Record<string, unknown> };
      };
    },
  ) => {
    // Opt in for Astro: its normal heading collection runs after numbering.
    // Preserve text before mutation, keyed by the actual node, never position.
    const headings = new Map<Element, SectionHeading>();
    if (captureHeadings) {
      // No dynamic imports here: Astro renders Markdown through a Vite module
      // runner that can close mid-transform, and Dump's Jest (CommonJS) loads
      // this file for `sectionNumber`, so ESM-only helpers are avoided.
      for (const node of headingElements(tree)) {
        if (typeof node.properties.id !== "string") {
          throw new Error("Run rehype-slug before capturing section headings");
        }
        headings.set(node, {
          depth: Number(node.tagName[1]),
          slug: node.properties.id,
          text: textOf(node),
        });
      }
      const astro = (file.data.astro ??= {});
      const frontmatter = (astro.frontmatter ??= {});
      frontmatter.sectionHeadings = [...headings.values()];
    }
    let index = 0;
    for (const node of tree.children) {
      if (node.type !== "element" || node.tagName !== "h2") continue;
      const label = sectionNumber(index);
      const heading = headings.get(node);
      if (heading) heading.number = label;
      const number: Element = {
        type: "element",
        tagName: "span",
        properties: { className: ["rv-num"], ariaHidden: "true" },
        children: [{ type: "text", value: label }],
      };
      // Keep inline code/emphasis in one flex item so the title wraps as text.
      node.children = [
        number,
        {
          type: "element",
          tagName: "span",
          properties: {},
          children: node.children,
        },
      ];
      index += 1;
    }
  };
}

/** Marks top-level ordered lists as numbered steps (`.steps`). */
export function rehypeSteps() {
  return (tree: Root) => {
    for (const node of tree.children) {
      if (node.type === "element" && node.tagName === "ol") {
        const existing = node.properties?.className;
        node.properties = {
          ...node.properties,
          className: [
            ...(Array.isArray(existing) ? (existing as string[]) : []),
            "steps",
          ],
        };
      }
    }
  };
}
