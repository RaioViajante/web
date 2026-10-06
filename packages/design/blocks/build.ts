/**
 * The one implementation of the soft-block markup (see docs/blocks.md).
 * It builds hast, which the rehype plugin inserts into markdown output and
 * the React components turn into elements.
 */
import type { Element, ElementContent } from "hast";
import { h } from "hastscript";
import type { BlockModel, BlockPanel, BlockRow } from "./model";
import { TREE_CLASSES } from "./model";
import type { Line } from "./highlight";

function tokenNodes(tokens: Line, variant: BlockModel["variant"]) {
  return tokens.map((token): ElementContent => {
    if (!token.cls) return { type: "text", value: token.text };
    const className =
      variant === "tree" ? TREE_CLASSES[token.cls] : `tok-${token.cls}`;
    return className
      ? h("span", { className: [className] }, token.text)
      : { type: "text", value: token.text };
  });
}

function lineNode(
  row: BlockRow,
  index: number,
  model: BlockModel,
): ElementContent {
  const classes = ["line"];
  if (row.kind === "add" || row.kind === "del") classes.push(row.kind);
  if (row.kind === "out") classes.push("term-out");
  if (model.highlight.includes(index + 1)) classes.push("is-hl");
  if (model.variant === "terminal" && row.kind === "cmd") {
    return h("span", { className: classes }, [
      h("span", { className: ["term-prompt"] }, "$ "),
      h(
        "span",
        { className: ["term-cmd"] },
        row.tokens.map((t) => t.text).join(""),
      ),
    ]);
  }
  const inner: ElementContent[] = tokenNodes(row.tokens, model.variant);
  if (row.mark !== undefined)
    inner.push(h("span", { className: ["mark"] }, String(row.mark)));
  return h("span", { className: classes, dataN: index + 1 }, [
    h("span", {}, inner),
  ]);
}

function preNode(panel: BlockPanel, model: BlockModel): Element {
  return h("pre", { tabIndex: 0 }, [
    h(
      "code",
      {},
      panel.rows.map((row, index) => lineNode(row, index, model)),
    ),
  ]);
}

/** Stable, content-derived id so server and client agree without a counter. */
export function blockId(model: BlockModel) {
  let hash = 5381;
  const text = model.panels
    .map(
      (panel) =>
        `${panel.file ?? ""}${panel.rows.length}${panel.rows[0]?.tokens[0]?.text ?? ""}`,
    )
    .join("|");
  for (let i = 0; i < text.length; i++) hash = (hash * 33) ^ text.charCodeAt(i);
  return `b${(hash >>> 0).toString(36)}`;
}

function metaNode(model: BlockModel): Element | null {
  const [first] = model.panels;
  const tabs = model.panels.length > 1;
  const right: ElementContent[] = [];
  if (model.variant === "diff") {
    const add = first.rows.filter((r) => r.kind === "add").length;
    const del = first.rows.filter((r) => r.kind === "del").length;
    right.push(
      h("span", { className: ["diff-count"] }, [
        h("span", { className: ["add"] }, `+${add}`),
        " ",
        h("span", { className: ["del"] }, `−${del}`),
      ]),
    );
  } else {
    const parts: string[] = [];
    if (model.language) parts.push(model.language);
    const lines = model.highlight;
    if (lines.length)
      parts.push(
        lines.length > 1
          ? `lines ${lines[0]}–${lines[lines.length - 1]}`
          : `line ${lines[0]}`,
      );
    if (parts.length) right.push(h("span", {}, parts.join(" · ")));
  }
  if (tabs || (!first.file && !right.length)) return null;
  return h("div", { className: ["block__meta"] }, [
    h("span", { className: ["block__file"] }, first.file ?? ""),
    ...right,
  ]);
}

export function buildBlock(model: BlockModel): Element {
  const id = blockId(model);
  const tabs = model.panels.length > 1;
  const classes = ["block"];
  if (tabs) classes.push("block--tabs");
  if (model.variant === "terminal") classes.push("block--terminal");
  if (model.variant === "diff") classes.push("block--diff");
  if (model.numbered) classes.push("block--numbered");
  if (model.collapsible) classes.push("block--collapsible", "is-collapsed");

  const copy = h(
    "button",
    { type: "button", className: ["block__copy"] },
    model.variant === "terminal" ? "copy commands" : "copy",
  );
  const body: ElementContent[] = [];

  if (tabs) {
    body.push(
      h(
        "div",
        { className: ["block__tabs"], role: "tablist", ariaLabel: "Files" },
        [
          ...model.panels.map((panel, index) =>
            h(
              "button",
              {
                type: "button",
                className: ["block__tab"],
                role: "tab",
                id: `${id}-t${index}`,
                ariaControls: `${id}-p${index}`,
                ariaSelected: String(index === 0),
              },
              panel.file ?? `file ${index + 1}`,
            ),
          ),
          copy,
        ],
      ),
    );
    model.panels.forEach((panel, index) =>
      body.push(
        h(
          "div",
          {
            role: "tabpanel",
            id: `${id}-p${index}`,
            ariaLabelledBy: `${id}-t${index}`,
            ...(index === 0 ? {} : { hidden: true }),
          },
          [preNode(panel, model)],
        ),
      ),
    );
  } else {
    body.push(copy, preNode(model.panels[0], model));
    if (model.notes.length)
      body.push(
        h(
          "ol",
          { className: ["block__notes"] },
          model.notes.map((note, index) =>
            h("li", {}, [
              h("span", {}, String(index + 1)),
              h("span", {}, note),
            ]),
          ),
        ),
      );
  }

  if (model.collapsible) {
    const total = Math.max(...model.panels.map((p) => p.rows.length));
    body.push(
      h("div", { className: ["block__more"] }, [
        h(
          "button",
          { type: "button", ariaExpanded: "false" },
          `show all ${total} lines`,
        ),
      ]),
    );
  }

  const meta = metaNode(model);
  return h("div", { className: classes }, [
    ...(meta ? [meta] : []),
    h("div", { className: ["block__body"] }, body),
  ]);
}

export const CALLOUT_KINDS = {
  note: "Note",
  important: "Important",
  warning: "Warning",
  deprecated: "Deprecated",
  til: "TIL",
  careful: "Careful",
} as const;
export type CalloutKind = keyof typeof CALLOUT_KINDS;

export function buildCallout(
  kind: CalloutKind,
  children: ElementContent[],
  label: string = CALLOUT_KINDS[kind],
): Element {
  return h(
    "div",
    {
      className:
        kind === "note" ? ["callout"] : ["callout", `callout--${kind}`],
      role: "note",
    },
    [h("span", { className: ["callout__label"] }, label), ...children],
  );
}
