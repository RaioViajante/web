import Link from "next/link";

import { site } from "@/lib/site";

const NAV = [
  { href: "/archive", label: "Archive" },
  { href: "/tags", label: "Tags" },
  { href: "/about", label: "About" },
  { href: "/uses", label: "Uses" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-title">
        {site.name}
      </Link>
      <nav aria-label="Primary">
        <ul>
          {NAV.map((entry) => (
            <li key={entry.href}>
              <Link href={entry.href}>{entry.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
