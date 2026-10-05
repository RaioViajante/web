"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [
  { number: "01.", label: "about", href: "/about" },
  { number: "02.", label: "projects", href: "/projects" },
  { number: "03.", label: "contact", href: "/contact" },
  { number: "04.", label: "gallery", href: "/gallery" },
];

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <nav className="rv-sidebar" aria-label="Pages">
      <p className="rv-nav-label">pages</p>
      <ol className="rv-nav-list">
        <li>
          <Link
            href="/"
            className="rv-nav-link"
            aria-current={pathname === "/" ? "page" : undefined}
            data-sound="nav"
          >
            00. index
          </Link>
        </li>
        {pages.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="rv-nav-link"
              aria-current={pathname === page.href ? "page" : undefined}
              data-sound="nav"
            >
              {page.number} {page.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
