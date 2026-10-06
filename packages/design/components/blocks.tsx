import type { Nodes } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, type ReactNode } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import {
  buildBlock,
  buildCallout,
  CALLOUT_KINDS,
  type CalloutKind,
} from "../blocks/build";
import {
  createBlockModel,
  mergeIntoTabs,
  type BlockInput,
  type BlockModel,
} from "../blocks/model";

function render(tree: Nodes) {
  return toJsxRuntime(tree, { Fragment, jsx, jsxs });
}

/**
 * Highlights at build time (server components, Astro frontmatter) and returns
 * the model `CodeBlock` renders. Several inputs make one tabbed block.
 */
export async function highlightBlock(
  ...inputs: [BlockInput, ...BlockInput[]]
): Promise<BlockModel> {
  const models = await Promise.all(inputs.map(createBlockModel));
  return models.length > 1 ? mergeIntoTabs(models) : models[0]!;
}

/** Code, tabs, terminal, diff, annotated code or file tree, from a model. */
export function CodeBlock({ model }: { model: BlockModel }) {
  return render(buildBlock(model));
}

export function Callout({
  kind = "note",
  label,
  children,
}: {
  kind?: CalloutKind;
  label?: string;
  children: ReactNode;
}) {
  const shell = buildCallout(kind, [], label ?? CALLOUT_KINDS[kind]);
  // children are React nodes: render the frame from hast, then place them after the label
  const [labelNode] = shell.children;
  return (
    <div
      className={kind === "note" ? "callout" : `callout callout--${kind}`}
      role="note"
    >
      {render(labelNode as Nodes)}
      <div>{children}</div>
    </div>
  );
}

export function TableBlock({ children }: { children: ReactNode }) {
  return (
    <div className="table-block">
      <table>{children}</table>
    </div>
  );
}

export function Figure({
  children,
  caption,
}: {
  children: ReactNode;
  caption?: ReactNode;
}) {
  return (
    <figure>
      {children}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function Footnotes({
  items,
}: {
  items: { id: string; content: ReactNode }[];
}) {
  return (
    <ol className="footnotes" aria-label="Footnotes">
      {items.map((item, index) => (
        <li key={item.id} id={item.id}>
          <span>{index + 1}</span>
          <span>{item.content}</span>
        </li>
      ))}
    </ol>
  );
}

export function PullQuote({ children }: { children: ReactNode }) {
  return <p className="pull">{children}</p>;
}
