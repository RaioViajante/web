import { render, screen, within } from "@testing-library/react";

import {
  ArchivePostList,
  groupPostsByYear,
} from "@/components/ArchivePostList";
import type { Post } from "@/lib/posts";

const posts: Post[] = [
  {
    slug: "oldest",
    contentId: "oldest",
    locale: "en",
    originalLocale: "en",
    title: "Oldest post",
    description: "Synthetic test data.",
    publishedAt: "2025-12-18",
    tags: [],
    draft: false,
  },
  {
    slug: "newest",
    contentId: "newest",
    locale: "en",
    originalLocale: "en",
    title: "Newest post",
    description: "Synthetic test data.",
    publishedAt: "2026-09-03",
    tags: [],
    draft: false,
  },
  {
    slug: "middle",
    contentId: "middle",
    locale: "en",
    originalLocale: "en",
    title: "Middle post",
    description: "Synthetic test data.",
    publishedAt: "2026-07-07",
    tags: [],
    draft: false,
  },
];

describe("<ArchivePostList />", () => {
  it("groups posts by year and keeps years and posts newest first", () => {
    const groups = groupPostsByYear(posts);

    expect(groups.map(({ year }) => year)).toEqual(["2026", "2025"]);
    expect(groups[0]!.posts.map(({ slug }) => slug)).toEqual([
      "newest",
      "middle",
    ]);
  });

  it("renders canonical post links", () => {
    render(<ArchivePostList posts={posts} />);

    expect(screen.getByRole("link", { name: /Newest post/ })).toHaveAttribute(
      "href",
      "/posts/newest",
    );
  });

  it("renders UTC-safe long English dates with ISO datetime values", () => {
    render(<ArchivePostList posts={posts} />);

    const newest = screen.getAllByRole("listitem")[0]!;
    expect(within(newest).getByText("September 3, 2026")).toHaveAttribute(
      "datetime",
      "2026-09-03",
    );
  });

  it("renders Portuguese dates and month names in words, ISO in datetime", () => {
    const portuguese = posts.map((post) => ({
      ...post,
      locale: "pt-BR" as const,
    }));
    render(<ArchivePostList posts={portuguese} locale="pt-BR" />);

    expect(screen.getByText("setembro · 1")).toBeInTheDocument();
    const newest = screen.getAllByRole("listitem")[0]!;
    expect(within(newest).getByText("3 de setembro de 2026")).toHaveAttribute(
      "datetime",
      "2026-09-03",
    );
  });

  it("renders an honest zero-post state", () => {
    render(<ArchivePostList posts={[]} />);

    expect(screen.getByText("No posts yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders the Portuguese zero-post state in Portuguese", () => {
    render(<ArchivePostList posts={[]} locale="pt-BR" />);

    expect(
      screen.getByText("Ainda não há textos publicados em português."),
    ).toBeInTheDocument();
  });
});
