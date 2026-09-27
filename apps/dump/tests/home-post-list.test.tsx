import { render, screen, within } from "@testing-library/react";

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

  it("renders canonical post and tag links", () => {
    render(<HomePostList posts={posts} />);

    expect(screen.getByRole("link", { name: "Newer day" })).toHaveAttribute(
      "href",
      "/posts/newer-day",
    );
    expect(screen.getByRole("link", { name: "testing" })).toHaveAttribute(
      "href",
      "/tags/testing",
    );
    expect(screen.getByRole("link", { name: "x86" })).toHaveAttribute(
      "href",
      "/tags/x86",
    );
  });

  it("presents UTC-safe month labels and machine-readable days", () => {
    render(<HomePostList posts={posts} />);

    expect(
      screen.getByRole("heading", { name: "2026.01 January" }),
    ).toBeInTheDocument();
    const newest = screen.getAllByRole("listitem")[0]!;
    expect(within(newest).getByText("15")).toHaveAttribute(
      "datetime",
      "2026-01-15",
    );
  });

  it("renders an honest empty state", () => {
    render(<HomePostList posts={[]} />);

    expect(screen.getByText("No posts yet.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
