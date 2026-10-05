"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ecosystem = [
  { label: "dump", detail: "writing", href: "https://dump.raioviajante.com" },
  { label: "lab", detail: "experiments", href: "https://lab.raioviajante.com" },
  { label: "docs", detail: "reference", href: "https://docs.raioviajante.com" },
];

const pages = [
  { number: "01.", label: "about", href: "/about" },
  { number: "02.", label: "projects", href: "/projects" },
  { number: "03.", label: "now", href: "/now" },
  { number: "04.", label: "contact", href: "/contact" },
  { number: "05.", label: "gallery", href: "/gallery" },
];

export function SiteNavigation() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

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
          <button
            type="button"
            className="rv-nav-toggle"
            aria-expanded={expanded}
            aria-controls="ecosystem-links"
            onClick={() => setExpanded((value) => !value)}
            data-sound="nav"
          >
            {expanded ? "−" : "+"} {ecosystem.length} links
          </button>
          <ol className="rv-subnav" id="ecosystem-links" hidden={!expanded}>
            {ecosystem.map((site) => (
              <li key={site.href}>
                <a href={site.href} data-sound="nav">
                  <span>{site.label}</span>
                  <span className="rv-subnav-detail">{site.detail} ↗</span>
                </a>
              </li>
            ))}
          </ol>
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
