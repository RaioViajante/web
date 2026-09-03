import Link from "next/link";
import type { Metadata } from "next";

import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse posts by topic.",
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <>
      <h1>Tags</h1>
      {tags.length === 0 ? (
        <p>No tags yet.</p>
      ) : (
        <ul className="post-list">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link href={`/tags/${encodeURIComponent(tag)}`}>{tag}</Link>
              <span className="post-meta"> · {count}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
