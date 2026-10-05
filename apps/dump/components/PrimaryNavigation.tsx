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
                data-sound="nav"
              >
                {String(index).padStart(2, "0")}. {label}
              </Link>
            </li>
          );
        })}
      </ol>
      <PostSearch posts={posts} />
      <div id="post-toc-slot" />
    </nav>
  );
}
