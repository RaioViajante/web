"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SearchPost = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
};

export function PostSearch({ posts }: { posts: SearchPost[] }) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const matches = query.trim().toLowerCase();
  const results = matches
    ? posts
        .filter((post) =>
          `${post.slug} ${post.title} ${post.description} ${post.tags.join(" ")}`
            .toLowerCase()
            .includes(matches),
        )
        .slice(0, 8)
    : [];

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if (
        event.key !== "/" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      event.preventDefault();
      input.current?.focus();
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);

  return (
    <div className="post-search">
      <label className="rv-nav-label" htmlFor="post-search">
        Search
      </label>
      <div className="post-search-control">
        <input
          ref={input}
          id="post-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="find a post"
        />
        <kbd>/</kbd>
      </div>
      {matches && (
        <div className="post-search-results" role="status" aria-live="polite">
          {results.length ? (
            results.map((post) => (
              <Link
                href={`/posts/${post.slug}`}
                data-sound="nav"
                key={post.slug}
                onClick={() => setQuery("")}
              >
                {post.title}
              </Link>
            ))
          ) : (
            <span>No matching posts.</span>
          )}
        </div>
      )}
    </div>
  );
}
