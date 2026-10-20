import { render, screen } from "@testing-library/react";

import { PostArticle } from "@/components/PostArticle";
import type { Post } from "@/lib/posts";

jest.mock("../lib/post-details", () => ({
  getPostDetails: () => ({
    headings: [],
    minutes: 2,
    related: [],
    previous: null,
    next: null,
    currentSeries: null,
    lab: null,
  }),
}));

const post: Post = {
  slug: "article",
  contentId: "article",
  locale: "en",
  originalLocale: "en",
  title: "Article title",
  description: "Article description.",
  publishedAt: "2026-09-03",
  updatedAt: "2026-10-05",
  tags: ["meta"],
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
    expect(screen.getAllByText("2026-09-03")).toHaveLength(2);
    expect(screen.getByText("2026-10-05")).toBeInTheDocument();
    expect(screen.getByText("Article description.")).toBeInTheDocument();
    expect(screen.getByText("Article body.")).toBeInTheDocument();
  });

  it("renders Portuguese navigation without comments or English tag paths", () => {
    render(
      <PostArticle
        post={{
          ...post,
          slug: "artigo",
          locale: "pt-BR",
          originalLocale: "pt-BR",
          title: "Título do artigo",
          tags: ["personal", "meta"],
        }}
      >
        <p>Corpo do artigo.</p>
      </PostArticle>,
    );

    expect(screen.getAllByText("3 de setembro de 2026")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "pessoal" })[0]).toHaveAttribute(
      "href",
      "/pt/tags/pessoal",
    );
    expect(
      screen.queryByRole("heading", { name: "Comments" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Comentários" }),
    ).toBeInTheDocument();
    expect(document.querySelector(".comments")).not.toBeNull();
    expect(screen.queryByText("RSS")).not.toBeInTheDocument();
  });
});
