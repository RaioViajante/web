import Link from "next/link";
import type { ReactNode } from "react";
import { Shell, type NavItem } from "@raioviajante/design/shell";
import { SearchNavItem } from "@raioviajante/design/search";

const pages: NavItem[] = [
  { label: "posts", href: "/" },
  { label: "archive", href: "/archive" },
  { label: "tags", href: "/tags" },
];

/**
 * The shared shell with dump's pages. `current` is the page's own path (a post
 * counts as "posts"); `toc` is a post's "on this page" list.
 */
export function DumpShell({
  current,
  toc,
  children,
}: {
  current?: string;
  toc?: NavItem[];
  children: ReactNode;
}) {
  return (
    <Shell
      site="dump"
      linkComponent={Link}
      pages={pages}
      currentPage={current}
      toc={toc}
      pagesExtra={
        <SearchNavItem
          number="03."
          current={current === "/search"}
          linkComponent={Link}
        />
      }
    >
      {children}
    </Shell>
  );
}
