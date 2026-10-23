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
    <SearchPage site={entries[0]!.site} locale={entries[0]!.locale} />,
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
  "loads %s's local Portuguese index and federates only to active peers",
  async (site) => {
    document.body.innerHTML = renderToStaticMarkup(
      <SearchPage site={site} locale="pt-BR" />,
    );
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);
    stop = attachSearch();
    const page = document.querySelector<HTMLElement>("[data-search-page]")!;
    await vi.waitFor(() => expect(page.dataset.searchState).toBe("ready"));
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/pt/search-index.json", {
      mode: "cors",
    });
    // Everywhere requests every other participating host.
    document
      .querySelector<HTMLButtonElement>('[data-search-scope="everywhere"]')!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).toHaveBeenCalledTimes(4);
    if (site === "docs" || site === "lab")
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:3000/pt/search-index.json",
        { mode: "cors" },
      );
    if (site !== "docs")
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:4321/pt/search-index.json",
        { mode: "cors" },
      );
    expect(page.dataset.searchState).toBe("ready");
    expect(
      document.querySelector("[data-search-bubble]")?.textContent,
    ).not.toBe("search is unavailable right now.");
  },
);

it("finds both reviewed Portuguese Dump posts from its local index", async () => {
  const translated: SearchEntry = {
    site: "dump",
    locale: "pt-BR",
    contentId: "maybe-this-can-be-something-someday",
    title: "Talvez isso vire alguma coisa um dia",
    href: "https://dump.raioviajante.com/pt/posts/talvez-isso-vire-alguma-coisa-um-dia",
    description: "Um diário complicado demais.",
    body: "Uma mensagem de erro por três horas.",
  };
  const original: SearchEntry = {
    site: "dump",
    locale: "pt-BR",
    contentId: "traduzir-o-site-sem-fingir-que-tudo-ja-existe",
    title: "Traduzir o site sem fingir que tudo já existe",
    href: "https://dump.raioviajante.com/pt/posts/traduzir-o-site-sem-fingir-que-tudo-ja-existe",
    description: "Identidade, idioma e publicação.",
  };

  await mount([translated, original], "Traduzir");
  let result = document.querySelector<HTMLAnchorElement>(
    "[data-search-result]",
  )!;
  expect(result.textContent).toContain(original.title);
  expect(new URL(result.href).pathname).toBe(
    "/pt/posts/traduzir-o-site-sem-fingir-que-tudo-ja-existe",
  );

  const input = document.querySelector<HTMLInputElement>(
    "[data-search-input]",
  )!;
  input.value = "mensagem de erro";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  result = document.querySelector<HTMLAnchorElement>("[data-search-result]")!;
  expect(result.textContent).toContain(translated.title);
  expect(new URL(result.href).pathname).toBe(
    "/pt/posts/talvez-isso-vire-alguma-coisa-um-dia",
  );
});

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
