import { render, screen, within } from "@testing-library/react";

import TagPage, { generateStaticParams } from "@/app/tags/[tag]/page";
import {
  formatTagPostDate,
  TagIndex,
  TagPostList,
  tagHref,
} from "@/components/TagViews";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import type { Post, TagCount } from "@/lib/posts";

// `app/tags/[tag]/page.tsx` reads real published posts by default (as it
// must, in production). The "tag routes" tests below stub just the two
// lookups it calls, so route behavior stays deterministic regardless of
// whatever posts currently exist in content/posts. Every other export
// (formatPostDate, sortPostsNewestFirst, ...) stays real, since the
// presentational tests further down render against it.
// jest.mock() takes a literal specifier, not one resolved through the "@/"
// alias (that's rewritten only for static import/require specifiers by
// Next's SWC transform), so this uses the real relative path.
jest.mock("../lib/posts", () => ({
  ...jest.requireActual("../lib/posts"),
  getAllTags: jest.fn(),
  getPostsByTag: jest.fn(),
}));

const mockGetAllTags = jest.mocked(getAllTags);
const mockGetPostsByTag = jest.mocked(getPostsByTag);

const posts: Post[] = [
  {
    slug: "older",
    title: "Older post",
    description: "Synthetic test data.",
    date: "2025-12-18",
    tags: ["osdev"],
    draft: false,
  },
  {
    slug: "newer",
    title: "Newer post",
    description: "Synthetic test data.",
    date: "2026-09-03",
    tags: ["osdev"],
    draft: false,
  },
];

describe("<TagIndex />", () => {
  it("renders canonical links and published counts in utility order", () => {
    render(
      <TagIndex
        tags={[
          { tag: "osdev", count: 4 },
          { tag: "x86", count: 3 },
        ]}
      />,
    );

    const entries = screen.getAllByRole("listitem");
    expect(within(entries[0]!).getByRole("link")).toHaveAttribute(
      "href",
      "/tags/osdev",
    );
    expect(entries[0]).toHaveTextContent("osdev4");
    expect(entries[1]).toHaveTextContent("x863");
  });

  it("URL-encodes tag links consistently", () => {
    expect(tagHref("systems-notes")).toBe("/tags/systems-notes");
  });

  it("renders an honest zero-tag state", () => {
    render(<TagIndex tags={[]} />);

    expect(screen.getByText("No tags yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

describe("<TagPostList />", () => {
  it("orders matching posts newest first and links canonical post URLs", () => {
    render(<TagPostList posts={posts} />);

    const entries = screen.getAllByRole("listitem");
    expect(within(entries[0]!).getByRole("link")).toHaveAttribute(
      "href",
      "/posts/newer",
    );
    expect(within(entries[1]!).getByRole("link")).toHaveAttribute(
      "href",
      "/posts/older",
    );
  });

  it("renders UTC-safe compact dates with semantic full dates", () => {
    render(<TagPostList posts={posts} />);

    expect(formatTagPostDate("2026-01-01")).toBe("Jan 01 '26");
    const newest = screen.getAllByRole("listitem")[0]!;
    expect(within(newest).getByText("Sep 03 '26")).toHaveAttribute(
      "datetime",
      "2026-09-03",
    );
    expect(within(newest).getByText("Sep 03 '26")).toHaveAccessibleName(
      "September 3, 2026",
    );
  });
});

describe("tag routes", () => {
  afterEach(() => {
    mockGetAllTags.mockReset();
    mockGetPostsByTag.mockReset();
  });

  it("does not generate tag routes when there are no published posts", () => {
    mockGetAllTags.mockReturnValue([]);

    expect(generateStaticParams()).toEqual([]);
  });

  it("generates one static param per known tag", () => {
    const tags: TagCount[] = [
      { tag: "osdev", count: 2 },
      { tag: "x86", count: 1 },
    ];
    mockGetAllTags.mockReturnValue(tags);

    expect(generateStaticParams()).toEqual([{ tag: "osdev" }, { tag: "x86" }]);
  });

  it("returns a real 404 for a tag with no published posts", async () => {
    mockGetPostsByTag.mockReturnValue([]);

    await expect(
      TagPage({ params: Promise.resolve({ tag: "does-not-exist" }) }),
    ).rejects.toThrow(/404/);
  });
});
