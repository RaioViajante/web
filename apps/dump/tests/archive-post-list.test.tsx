import { render, screen, within } from "@testing-library/react";

import {
  ArchivePostList,
  formatArchiveDate,
  groupPostsByYear,
} from "@/components/ArchivePostList";
import type { Post } from "@/lib/posts";

const posts: Post[] = [
  {
    slug: "oldest",
    title: "Oldest post",
    description: "Synthetic test data.",
    date: "2025-12-18",
    tags: [],
    draft: false,
  },
  {
    slug: "newest",
    title: "Newest post",
    description: "Synthetic test data.",
    date: "2026-09-03",
    tags: [],
    draft: false,
  },
  {
    slug: "middle",
    title: "Middle post",
    description: "Synthetic test data.",
    date: "2026-07-07",
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

    expect(screen.getByRole("link", { name: "Newest post" })).toHaveAttribute(
      "href",
      "/posts/newest",
    );
  });

  it("renders UTC-safe abbreviated dates with semantic full dates", () => {
    render(<ArchivePostList posts={posts} />);

    expect(formatArchiveDate("2026-01-01")).toBe("Jan 01");
    const newest = screen.getAllByRole("listitem")[0]!;
    expect(within(newest).getByText("Sep 03")).toHaveAttribute(
      "datetime",
      "2026-09-03",
    );
    expect(within(newest).getByText("Sep 03")).toHaveAccessibleName(
      "September 3, 2026",
    );
  });

  it("renders an honest zero-post state", () => {
    render(<ArchivePostList posts={[]} />);

    expect(screen.getByText("No posts yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
