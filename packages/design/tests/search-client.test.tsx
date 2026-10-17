// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { SearchPage, type SearchEntry } from "../components/search";
import { attachSearch } from "../search/client";

let stop: (() => void) | undefined;
afterEach(() => {
  stop?.();
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

it.each([
  ["root", "setup", "06."],
  ["lab", "boot sector", "003"],
] as const)(
  "preserves the supplied %s number after filtering",
  async (site, title, number) => {
    await mount(
      [
        {
          site,
          locale: "en",
          title: "Other",
          href: "/other",
          description: "",
          number: "99",
        },
        { site, locale: "en", title, href: "/target", description: "", number },
      ],
      title,
    );
    expect(document.querySelectorAll("[data-search-result]")).toHaveLength(1);
    expect(document.querySelector(".rv-result__number")?.textContent).toBe(
      number,
    );
  },
);

it("falls back to the filtered result position without supplied numbers", async () => {
  await mount(
    [
      {
        site: "docs",
        locale: "en",
        title: "Other",
        href: "/other",
        description: "",
      },
      {
        site: "docs",
        locale: "en",
        title: "Classification",
        href: "/sweep/#classification",
        description: "Sweep",
      },
      {
        site: "docs",
        locale: "en",
        title: "Classification rules",
        href: "/rules",
        description: "Sweep",
      },
    ],
    "sweep classification",
  );
  expect(
    [...document.querySelectorAll(".rv-result__number")].map(
      (node) => node.textContent,
    ),
  ).toEqual(["01.", "02."]);
});

async function mount(entries: SearchEntry[], query: string) {
  document.body.innerHTML = renderToStaticMarkup(
    <SearchPage site={entries[0]!.site} locale="en" />,
  );
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => entries }),
  );
  stop = attachSearch();
  await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
  const input = document.querySelector<HTMLInputElement>(
    "[data-search-input]",
  )!;
  input.value = query;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await vi.waitFor(() =>
    expect(document.querySelector("[data-search-result]")).not.toBeNull(),
  );
}

it("fetches only the English index of its own site and shows dates in the page locale", async () => {
  await mount(
    [
      {
        site: "dump",
        locale: "en",
        title: "Post",
        href: "/p",
        description: "",
        date: "2026-09-03",
      },
    ],
    "post",
  );
  expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual([
    "/search-index.json",
  ]);
  expect(document.querySelector(".rv-result__note")?.textContent).toBe(
    "September 3, 2026",
  );
  expect(
    document
      .querySelector("[data-search-page]")
      ?.getAttribute("data-search-locale"),
  ).toBe("en");
});

it.each([
  ["no locale", { site: "docs" }],
  ["another locale", { site: "docs", locale: "pt-BR" }],
  ["another site", { site: "lab", locale: "en" }],
])("rejects an index whose entry has %s", async (_name, extra) => {
  document.body.innerHTML = renderToStaticMarkup(
    <SearchPage site="docs" locale="en" />,
  );
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { title: "Sweep", href: "/s", description: "", ...extra },
      ],
    }),
  );
  stop = attachSearch();
  await vi.waitFor(() =>
    expect(document.querySelector("[data-search-bubble]")?.textContent).toBe(
      "search is unavailable right now.",
    ),
  );
  expect(document.querySelector("[data-search-result]")).toBeNull();
});

it.each(["root", "dump", "docs", "lab"] as const)(
  "never fetches an index for %s in a locale it does not participate in",
  async (site) => {
    document.body.innerHTML = renderToStaticMarkup(
      <SearchPage site={site} locale="pt-BR" />,
    );
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    stop = attachSearch();
    const page = document.querySelector<HTMLElement>("[data-search-page]")!;
    await vi.waitFor(() => expect(page.dataset.searchState).toBe("skipped"));
    // Everywhere must not probe either: no host participates in pt-BR.
    document
      .querySelector<HTMLButtonElement>('[data-search-scope="everywhere"]')!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(page.dataset.searchState).toBe("skipped");
    expect(
      document.querySelector("[data-search-bubble]")?.textContent,
    ).not.toBe("search is unavailable right now.");
  },
);

it("states ready for an active empty index and unavailable for a failed one", async () => {
  document.body.innerHTML = renderToStaticMarkup(
    <SearchPage site="docs" locale="en" />,
  );
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => [] }),
  );
  stop = attachSearch();
  const page = document.querySelector<HTMLElement>("[data-search-page]")!;
  await vi.waitFor(() => expect(page.dataset.searchState).toBe("ready"));
  stop();
  document.body.innerHTML = renderToStaticMarkup(
    <SearchPage site="docs" locale="en" />,
  );
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
  stop = attachSearch();
  const failed = document.querySelector<HTMLElement>("[data-search-page]")!;
  await vi.waitFor(() =>
    expect(failed.dataset.searchState).toBe("unavailable"),
  );
});
