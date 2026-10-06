import type { ReactNode } from "react";
import { Shell } from "@raioviajante/design/shell";
import { SearchNavItem } from "@raioviajante/design/search";
import { experiments } from "../data/experiments";

export function LabFrame({
  current,
  children,
}: {
  current?: string;
  children?: ReactNode;
}) {
  return (
    <Shell
      site="lab"
      termsHref="/terms/"
      privacyHref="/privacy/"
      pages={[
        { label: "experiments", href: "/" },
        { label: "notebook", href: "/#notebook" },
      ]}
      currentPage={
        current === "/search/"
          ? undefined
          : current?.startsWith("/experiments/")
            ? "/"
            : current
      }
      pagesExtra={
        <SearchNavItem
          number="02."
          href="/search/"
          current={current === "/search/"}
        />
      }
      experiments={[...experiments].reverse().map((e) => ({
        number: e.id,
        label: e.title,
        href: `/experiments/${e.slug}/`,
      }))}
      currentExperiment={current}
    >
      {children}
    </Shell>
  );
}
