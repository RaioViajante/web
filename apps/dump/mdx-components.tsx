import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";

function Table(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="table-scroll">
      <table {...props} />
    </div>
  );
}

function Callout({
  kind,
  children,
}: {
  kind: "note" | "important" | "warning" | "deprecated";
  children: ReactNode;
}) {
  return (
    <aside className={`prose-callout prose-callout--${kind}`} aria-label={kind}>
      <strong>{kind}</strong>
      <div>{children}</div>
    </aside>
  );
}

const components: MDXComponents = {
  table: Table,
  Note: ({ children }: { children: ReactNode }) => (
    <Callout kind="note">{children}</Callout>
  ),
  Important: ({ children }: { children: ReactNode }) => (
    <Callout kind="important">{children}</Callout>
  ),
  Warning: ({ children }: { children: ReactNode }) => (
    <Callout kind="warning">{children}</Callout>
  ),
  Deprecated: ({ children }: { children: ReactNode }) => (
    <Callout kind="deprecated">{children}</Callout>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
