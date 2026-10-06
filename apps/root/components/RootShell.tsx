import Link from "next/link";
import type { ReactNode } from "react";
import { Shell, type NavItem } from "@raioviajante/design/components";
import { SearchNavItem } from "@raioviajante/design/search";

const pages: NavItem[] = [
  { label: "index", href: "/" },
  { label: "about", href: "/about" },
  { label: "projects", href: "/projects" },
  { label: "contact", href: "/contact" },
  { label: "gallery", href: "/gallery" },
  { label: "this site", href: "/this-site" },
];

/** The shared shell with root's pages. `current` is the page's own path. */
export function RootShell({
  current,
  children,
}: {
  current?: string;
  children: ReactNode;
}) {
  return (
    <Shell
      site="root"
      linkComponent={Link}
      pages={pages}
      currentPage={current}
      pagesExtra={
        <SearchNavItem
          number="06."
          current={current === "/search"}
          linkComponent={Link}
        />
      }
    >
      {children}
    </Shell>
  );
}
