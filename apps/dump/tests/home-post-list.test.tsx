import { render, screen } from "@testing-library/react";

import { groupPostsByMonth, HomePostList } from "@/components/HomePostList";
import type { Post } from "@/lib/posts";

const posts: Post[] = [
  {
    slug: "older-month",
    contentId: "older-month",
    locale: "en",
    originalLocale: "en",
    title: "Older month",
    description: "An older synthetic post.",
    publishedAt: "2025-12-20",
    tags: [],
    draft: false,
  },
  {
    slug: "newer-day",
    contentId: "newer-day",
    locale: "en",
    originalLocale: "en",
    title: "Newer day",
    description: "The newest synthetic post.",
    publishedAt: "2026-01-15",
    tags: ["meta", "x86"],
    draft: false,
  },
  {
    slug: "older-day",
    contentId: "older-day",
    locale: "en",
    originalLocale: "en",
    title: "Older day",
    description: "An earlier synthetic post in the same month.",
    publishedAt: "2026-01-03",
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

  it("localizes Portuguese series counts without changing their identity", () => {
    const portuguesePart: Post = {
      ...posts[0]!,
      slug: "construindo-orbit",
      contentId: "building-orbit",
      locale: "pt-BR",
      originalLocale: "en",
      title: "Construindo Orbit",
    };
    render(<HomePostList posts={[portuguesePart]} locale="pt-BR" />);

    expect(
      screen.getByRole("link", { name: /orbit.*1 parte/i }),
    ).toHaveAttribute("href", "/pt/posts/construindo-orbit");
    expect(screen.queryByText(/1 part$/)).not.toBeInTheDocument();
  });
});
