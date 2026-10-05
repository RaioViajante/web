import { render, screen } from "@testing-library/react";

import { groupPostsByMonth, HomePostList } from "@/components/HomePostList";
import type { Post } from "@/lib/posts";

const posts: Post[] = [
  {
    slug: "older-month",
    title: "Older month",
    description: "An older synthetic post.",
    date: "2025-12-20",
    tags: [],
    draft: false,
  },
  {
    slug: "newer-day",
    title: "Newer day",
    description: "The newest synthetic post.",
    date: "2026-01-15",
    tags: ["testing", "x86"],
    draft: false,
  },
  {
    slug: "older-day",
    title: "Older day",
    description: "An earlier synthetic post in the same month.",
    date: "2026-01-03",
    tags: [],
    draft: false,
  },
];

describe("<HomePostList />", () => {
  it("groups and orders posts by month, newest first", () => {
    const groups = groupPostsByMonth(posts);

    expect(groups.map(({ key }) => key)).toEqual(["2026-01", "2025-12"]);
    expect(groups[0]!.posts.map(({ slug }) => slug)).toEqual([
      "newer-day",
      "older-day",
    ]);
  });

  it("features the newest post and links older posts", () => {
    render(<HomePostList posts={posts} />);
    expect(screen.getByRole("link", { name: /Newer day/ })).toHaveAttribute(
      "href",
      "/posts/newer-day",
    );
    expect(screen.getByRole("link", { name: /Older day/ })).toHaveAttribute(
      "href",
      "/posts/older-day",
    );
    expect(screen.getByText("January 2026")).toBeInTheDocument();
  });

  it("renders an honest empty state", () => {
    render(<HomePostList posts={[]} />);

    expect(screen.getByText("No posts yet.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
