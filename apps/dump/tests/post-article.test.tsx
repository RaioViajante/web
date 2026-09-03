import { render, screen } from "@testing-library/react";

import { PostArticle } from "@/components/PostArticle";
import type { Post } from "@/lib/posts";

const post: Post = {
  slug: "article",
  title: "Article title",
  description: "Article description.",
  date: "2026-09-03",
  tags: ["testing"],
  draft: false,
};

describe("<PostArticle />", () => {
  it("renders the article hierarchy from existing post metadata", () => {
    render(
      <PostArticle post={post}>
        <p>Article body.</p>
      </PostArticle>,
    );

    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Article title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("September 3, 2026")).toBeInTheDocument();
    expect(screen.getByText("Article description.")).toBeInTheDocument();
    expect(screen.getByText("Article body.")).toBeInTheDocument();
  });
});
