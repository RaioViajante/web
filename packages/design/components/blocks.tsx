import type { Nodes } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, type ReactNode } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { buildBlock, buildCallout, type CalloutKind } from "../blocks/build";
import { DEFAULT_LOCALE, type LocaleId } from "../../../site/locales";
import { catalogFor } from "../catalog";
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
export function CodeBlock({
  model,
  locale = DEFAULT_LOCALE,
}: {
  model: BlockModel;
  /** The page's locale: the copy, tab and expand controls are rendered in it. */
  locale?: LocaleId;
}) {
  return render(buildBlock(model, locale));
}

export function Callout({
  kind = "note",
  label,
  children,
  locale = DEFAULT_LOCALE,
}: {
  kind?: CalloutKind;
  /** The author's own label; without it the kind's name in `locale` is used. */
  label?: string;
  children: ReactNode;
  locale?: LocaleId;
}) {
  const shell = buildCallout(kind, [], label, locale);
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
  locale = DEFAULT_LOCALE,
}: {
  items: { id: string; content: ReactNode }[];
  locale?: LocaleId;
}) {
  return (
    <ol className="footnotes" aria-label={catalogFor(locale).blocks.footnotes}>
      {items.map((item, index) => (
        <li key={item.id} id={item.id}>
          <span>{index + 1}</span>
          <span>{item.content}</span>
        </li>
      ))}
    </ol>
  );
}

/** A quotation: a 2px rule on the left, muted text. */
export function Quote({ children }: { children: ReactNode }) {
  return <blockquote className="quote">{children}</blockquote>;
}

export function PullQuote({ children }: { children: ReactNode }) {
  return <p className="pull">{children}</p>;
}
