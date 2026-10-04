"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [
  { number: "00.", label: "index", href: "/" },
  { number: "00.1", label: "setup", href: "/setup" },
  { number: "01.", label: "projects", href: "/projects" },
  { number: "02.", label: "now", href: "/now" },
];

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <nav className="rv-sidebar" aria-label="Pages">
      <p className="rv-nav-label">pages</p>
      <ol className="rv-nav-list">
        {pages.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className={`rv-nav-link${page.href === "/setup" ? " rv-nav-subitem" : ""}`}
              aria-current={pathname === page.href ? "page" : undefined}
            >
              {page.number} {page.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
