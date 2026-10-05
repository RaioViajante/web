"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PostSearch } from "@/components/PostSearch";

type SearchPost = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
};

const pages = [
  { href: "/", label: "posts" },
  { href: "/archive", label: "archive" },
  { href: "/tags", label: "tags" },
  { href: "/uses", label: "uses" },
];

const sites = [
  { href: "https://raioviajante.com", label: "raioviajante.com" },
  { href: "https://dump.raioviajante.com", label: "dump" },
  { href: "https://docs.raioviajante.com", label: "docs" },
  { href: "https://lab.raioviajante.com", label: "lab" },
];

export function PrimaryNavigation({ posts = [] }: { posts?: SearchPost[] }) {
  const pathname = usePathname();

  return (
    <nav className="primary-navigation" aria-label="Primary">
      <p className="rv-nav-label">Pages</p>
      <ol className="rv-nav-list">
        {pages.map(({ href, label }, index) => {
          const active =
            href === "/"
              ? pathname === "/" || pathname.startsWith("/posts/")
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                className="rv-nav-link"
                href={href}
                aria-current={active ? "page" : undefined}
              >
                {String(index).padStart(2, "0")}. {label}
              </Link>
            </li>
          );
        })}
      </ol>
      <PostSearch posts={posts} />
      <p className="rv-nav-label">Sites</p>
      <ul className="rv-nav-list">
        {sites.map(({ href, label }) => (
          <li key={href}>
            <a
              className="rv-nav-link"
              href={href}
              aria-current={label === "dump" ? "page" : undefined}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
      <div id="post-toc-slot" />
    </nav>
  );
}
