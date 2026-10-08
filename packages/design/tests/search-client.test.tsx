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
        { site, title: "Other", href: "/other", description: "", number: "99" },
        { site, title, href: "/target", description: "", number },
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
      { site: "docs", title: "Other", href: "/other", description: "" },
      {
        site: "docs",
        title: "Classification",
        href: "/sweep/#classification",
        description: "Sweep",
      },
      {
        site: "docs",
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
    <SearchPage site={entries[0]!.site} />,
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
