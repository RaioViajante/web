/**
 * Markdown and MDX integration for the soft blocks:
 *
 * - `remarkSoftCallouts` (after remark-directive): `:::note ... :::` and the
 *   other callout kinds.
 * - `rehypeSoftBlocks`: fenced code (code, terminal, diff, tree, tabs),
 *   callouts, tables, and footnotes.
 *
 * Both build the markup with build.ts; there is no second implementation.
 */
import type {
  Element,
  ElementContent,
  Root as HastRoot,
  RootContent,
} from "hast";
import type {} from "mdast-util-directive";
import type { Paragraph, Root as MdastRoot } from "mdast";
import { toString } from "hast-util-to-string";
import { h } from "hastscript";
import { visit } from "unist-util-visit";
import {
  buildBlock,
  buildCallout,
  CALLOUT_KINDS,
  type CalloutKind,
} from "./build";
import { parseFenceMeta } from "./meta";
import { createBlockModel, mergeIntoTabs, type BlockModel } from "./model";

const isCalloutKind = (name: string): name is CalloutKind =>
  name in CALLOUT_KINDS;

/** Marks callout directives; rehypeSoftBlocks builds the markup. */
export function remarkSoftCallouts() {
  return (tree: MdastRoot) => {
    visit(tree, (node, index, parent) => {
      if (node.type === "containerDirective" && isCalloutKind(node.name)) {
        const [first] = node.children;
        const isLabel =
          first?.type === "paragraph" &&
          (first.data as { directiveLabel?: boolean } | undefined)
            ?.directiveLabel;
        const label = isLabel
          ? (first as Paragraph).children
              .map((child) => ("value" in child ? child.value : ""))
              .join("")
          : undefined;
        if (isLabel) node.children.shift();
        const data = (node.data ??= {}) as Record<string, unknown>;
        data.hName = "div";
        data.hProperties = {
          dataCallout: node.name,
          ...(label ? { dataLabel: label } : {}),
        };
        return;
      }
      // Not a callout: restore the literal text so stray colons survive.
      if (
        parent &&
        typeof index === "number" &&
        node.type === "textDirective"
      ) {
        parent.children[index] = { type: "text", value: `:${node.name}` };
      }
    });
  };
}

function isElement(
  node: RootContent | undefined,
  name?: string,
): node is Element {
  return node?.type === "element" && (!name || node.tagName === name);
}

function codeOf(pre: Element) {
  return pre.children.find((child): child is Element =>
    isElement(child, "code"),
  );
}

function languageOf(code: Element) {
  const classes = code.properties?.className;
  const list = Array.isArray(classes) ? classes.map(String) : [];
  return list.find((name) => name.startsWith("language-"))?.slice(9);
}

/** Replaces a node's contents in place, keeping its position in the tree. */
function become(node: Element, next: Element) {
  for (const key of Object.keys(node))
    delete (node as unknown as Record<string, unknown>)[key];
  Object.assign(node, next);
}

function footnotes(section: Element): Element | null {
  const list = section.children.find((child): child is Element =>
    isElement(child, "ol"),
  );
  if (!list) return null;
  const items = list.children.filter((child): child is Element =>
    isElement(child, "li"),
  );
  return h(
    "ol",
    { className: ["footnotes"], ariaLabel: "Footnotes" },
    items.map((item, index) => {
      const content: ElementContent[] = [];
      for (const child of item.children) {
        if (isElement(child, "p")) {
          if (content.length) content.push({ type: "text", value: " " });
          content.push(...child.children);
        } else if (child.type !== "text" || child.value.trim()) {
          content.push(child as ElementContent);
        }
      }
      return h("li", { id: item.properties?.id as string | undefined }, [
        h("span", {}, String(index + 1)),
        h("span", {}, content),
      ]);
    }),
  );
}

interface Parent {
  children: RootContent[];
}
interface Pending {
  group: string;
  parent: Parent;
  first: number;
  end: number;
  models: BlockModel[];
}

export function rehypeSoftBlocks() {
  return async (tree: HastRoot) => {
    const fences: { parent: Parent; index: number; pre: Element }[] = [];

    visit(tree, "element", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (node.tagName === "pre" && codeOf(node)) {
        fences.push({ parent, index, pre: node });
        return "skip";
      }
      if (node.tagName === "table") {
        become(node, h("div", { className: ["table-block"] }, [{ ...node }]));
        return "skip";
      }
      if (
        node.tagName === "section" &&
        node.properties?.dataFootnotes !== undefined
      ) {
        const list = footnotes(node);
        if (list) become(node, list);
        return "skip";
      }
      const kind = node.properties?.dataCallout;
      if (
        node.tagName === "div" &&
        typeof kind === "string" &&
        isCalloutKind(kind)
      ) {
        const label = node.properties?.dataLabel;
        become(
          node,
          buildCallout(
            kind,
            node.children,
            typeof label === "string" ? label : undefined,
          ),
        );
      }
    });

    // Models are built in document order; adjacent fences of one group merge into tabs.
    const replacements: {
      parent: Parent;
      start: number;
      count: number;
      node: Element;
    }[] = [];
    let pending: Pending | null = null;
    const flush = () => {
      if (!pending) return;
      const model =
        pending.models.length > 1
          ? mergeIntoTabs(pending.models)
          : pending.models[0];
      replacements.push({
        parent: pending.parent,
        start: pending.first,
        count: pending.end - pending.first + 1,
        node: buildBlock(model),
      });
      pending = null;
    };

    for (const { parent, index, pre } of fences) {
      const code = codeOf(pre)!;
      const meta = parseFenceMeta(
        (code.data as { meta?: string } | undefined)?.meta,
      );
      const model = await createBlockModel({
        code: toString(code),
        lang: languageOf(code),
        meta,
      });
      const current = pending as Pending | null;
      const continues =
        current &&
        meta.group &&
        current.group === meta.group &&
        current.parent === parent &&
        parent.children
          .slice(current.end + 1, index)
          .every((sibling) => sibling.type === "text" && !sibling.value.trim());
      if (continues && current) {
        current.models.push(model);
        current.end = index;
      } else {
        flush();
        pending = {
          group: meta.group ?? "",
          parent,
          first: index,
          end: index,
          models: [model],
        };
      }
    }
    flush();
    for (const { parent, start, count, node } of replacements.reverse())
      parent.children.splice(start, count, node);
  };
}
