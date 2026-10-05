import Link from "next/link";
import { sortPostsNewestFirst, type Post, type TagCount } from "@/lib/posts";

export function tagHref(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}`;
}
export function formatTagPostDate(date: string): string {
  return date.slice(2);
}

export function TagIndex({ tags }: { tags: TagCount[] }) {
  if (!tags.length) return <p className="tags-empty">No tags yet.</p>;
  return (
    <div>
      {[
        { label: "Recurring", items: tags.filter((item) => item.count > 1) },
        { label: "Once", items: tags.filter((item) => item.count === 1) },
      ].map(
        ({ label, items }) =>
          items.length > 0 && (
            <section key={label}>
              <h2 className="tag-group-title">{label}</h2>
              <ol className="tag-index">
                {items.map(({ tag, count }) => (
                  <li className="tag-index-item" key={tag}>
                    <Link
                      className="dump-leader tag-index-link"
                      data-sound="nav"
                      href={tagHref(tag)}
                    >
                      <span>{tag}</span>
                      <span className="dump-dots" aria-hidden="true" />
                      <span>
                        {count} {count === 1 ? "post" : "posts"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ),
      )}
    </div>
  );
}

export function TagPostList({ posts }: { posts: Post[] }) {
  return (
    <ol className="tag-post-list">
      {sortPostsNewestFirst(posts).map((post) => (
        <li key={post.slug}>
          <Link
            className="dump-leader"
            data-sound="nav"
            href={`/posts/${post.slug}`}
          >
            <span>{post.title}</span>
            <span className="dump-dots" aria-hidden="true" />
            <time dateTime={post.date}>{formatTagPostDate(post.date)}</time>
          </Link>
        </li>
      ))}
    </ol>
  );
}
