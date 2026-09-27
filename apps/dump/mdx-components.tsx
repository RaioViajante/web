import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";

function Table(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="table-scroll">
      <table {...props} />
    </div>
  );
}

const components: MDXComponents = { table: Table };

export function useMDXComponents(): MDXComponents {
  return components;
}
