import Link from "next/link";

import { formatPostDate } from "@/lib/posts";

interface PostMetaProps {
  date: string;
  tags?: string[];
}

/** Byline for a post: published date and, optionally, its tags. */
export function PostMeta({ date, tags = [] }: PostMetaProps) {
  return (
    <p className="post-meta">
      <time dateTime={date}>{formatPostDate(date)}</time>
      {tags.length > 0 && (
        <>
          {" · "}
          {tags.map((tag, index) => (
            <span key={tag}>
              {index > 0 && ", "}
              <Link href={`/tags/${encodeURIComponent(tag)}`}>{tag}</Link>
            </span>
          ))}
        </>
      )}
    </p>
  );
}
