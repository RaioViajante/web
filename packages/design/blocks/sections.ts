import type { Element, Root } from "hast";

/** `01.` for the first section of a page, then `01.1`, `01.2`, … */
export function sectionNumber(index: number): string {
  return index === 0 ? "01." : `01.${index}`;
}

/**
 * Numbers a page's top-level `##` headings in document order with
 * `sectionNumber`, as a leading `.rv-num` span. The "on this page" list uses
 * the same function, so the two always agree.
 */
export function rehypeNumberSections() {
  return (tree: Root) => {
    let index = 0;
    for (const node of tree.children) {
      if (node.type !== "element" || node.tagName !== "h2") continue;
      const number: Element = {
        type: "element",
        tagName: "span",
        properties: { className: ["rv-num"], ariaHidden: "true" },
        children: [{ type: "text", value: sectionNumber(index) }],
      };
      node.children.unshift(number);
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
