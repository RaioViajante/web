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
      slug: "comecei-a-escrever-as-falhas-antes-das-funcionalidades",
      contentId: "started-writing-down-the-failures-before-the-features",
      locale: "pt-BR",
      originalLocale: "en",
      title: "Comecei a escrever as falhas antes das funcionalidades",
    };
    render(<HomePostList posts={[portuguesePart]} locale="pt-BR" />);

    expect(
      screen.getByRole("link", { name: /jobs-mcp.*1 parte/i }),
    ).toHaveAttribute(
      "href",
      "/pt/posts/comecei-a-escrever-as-falhas-antes-das-funcionalidades",
    );
    expect(screen.queryByText(/1 part$/)).not.toBeInTheDocument();
  });

  it("omits the series section in a locale with no series part and numbers the rest without a gap", () => {
    const standalone: Post = {
      ...posts[0]!,
      slug: "texto-solto",
      contentId: "texto-solto",
      locale: "pt-BR",
      originalLocale: "pt-BR",
      title: "Texto solto",
    };
    const { container } = render(
      <HomePostList posts={[standalone]} locale="pt-BR" />,
    );

    expect(screen.queryByRole("heading", { name: "Séries" })).toBeNull();
    expect(container.querySelector("#series-heading")).toBeNull();
    // Latest 00., no older months, so "Acompanhe" is 00.1.
    const numbers = [...container.querySelectorAll("h2 .rv-num")].map(
      (node) => node.textContent,
    );
    expect(numbers).toEqual(["00.", "00.1"]);
  });

  it("links the localized feed from the Follow section in each locale", () => {
    const { container, unmount } = render(<HomePostList posts={posts} />);
    expect(
      container.querySelector("a[href='/rss.xml']")?.textContent,
    ).toContain("RSS");
    unmount();

    const portuguese: Post = {
      ...posts[0]!,
      locale: "pt-BR",
      originalLocale: "pt-BR",
    };
    const view = render(<HomePostList posts={[portuguese]} locale="pt-BR" />);
    const link = view.container.querySelector("a[href='/pt/rss.xml']");
    expect(link).not.toBeNull();
    expect(link!.textContent).toContain("feed");
    expect(view.container.querySelector("a[href='/rss.xml']")).toBeNull();
  });

  it("renders long dates in each locale with ISO datetime values", () => {
    const { container, unmount } = render(
      <HomePostList posts={posts} latestMinutes={1} />,
    );
    expect(screen.getByText("January 15, 2026")).toHaveAttribute(
      "datetime",
      "2026-01-15",
    );
    expect(screen.getByText(/^1 min read/)).toBeInTheDocument();
    expect(
      container.querySelector("time[datetime='2026-01-03']"),
    ).toHaveTextContent("January 3, 2026");
    unmount();

    const portuguese = posts.map((post) => ({
      ...post,
      locale: "pt-BR" as const,
    }));
    render(
      <HomePostList posts={portuguese} locale="pt-BR" latestMinutes={3} />,
    );
    expect(screen.getByText("15 de janeiro de 2026")).toHaveAttribute(
      "datetime",
      "2026-01-15",
    );
    expect(screen.getByText(/^3 min de leitura/)).toBeInTheDocument();
  });
});

describe("home avatar", () => {
  it("names the flipping avatar in the page's language, and the empty home too", () => {
    const { unmount } = render(<HomePostList posts={posts} />);
    expect(
      screen.getByRole("button", { name: "Flip RaioViajante avatar" }),
    ).toBeInTheDocument();
    unmount();
    const pt = render(<HomePostList posts={posts} locale="pt-BR" />);
    const button = pt.container.querySelector("[data-avatar-coin]");
    expect(button?.getAttribute("aria-label")).toBe(
      "Virar o avatar do RaioViajante",
    );
    expect(button?.getAttribute("data-avatar-reduced-label")).toBe(
      "Personagem ilustrado do RaioViajante",
    );
    pt.unmount();
    const empty = render(<HomePostList posts={[]} locale="pt-BR" />);
    expect(
      empty.container
        .querySelector("[data-avatar-coin]")
        ?.getAttribute("aria-label"),
    ).toBe("Virar o avatar do RaioViajante");
  });
});
