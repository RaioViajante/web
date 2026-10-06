import { SITES, type SiteId } from "../components/sites";
import type { SearchEntry } from "../components/search";

const indexPath = "/search-index.json";

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      !!target.closest("input, textarea, select, [contenteditable]"))
  );
}

function indexHref(site: SiteId) {
  return SITES.find((item) => item.id === site)!.href + indexPath;
}

async function readIndex(site: SiteId): Promise<SearchEntry[]> {
  const url =
    location.hostname === new URL(indexHref(site)).hostname
      ? indexPath
      : indexHref(site);
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error(`Search index unavailable: ${site}`);
  return response.json() as Promise<SearchEntry[]>;
}

function matches(entry: SearchEntry, words: string[]) {
  const text =
    `${entry.title} ${entry.description} ${entry.body ?? ""}`.toLocaleLowerCase();
  return words.every((word) => text.includes(word));
}

function resultRow(entry: SearchEntry, index: number) {
  const row = document.createElement("a");
  row.className = "rv-result";
  row.href = entry.href;
  row.dataset.searchResult = "";
  row.dataset.sound = "nav";
  row.setAttribute("aria-selected", index === 0 ? "true" : "false");
  const number = document.createElement("span");
  number.className = "rv-result__number";
  number.textContent = entry.number ?? String(index + 1).padStart(2, "0") + ".";
  const label = document.createElement("span");
  label.textContent = entry.title;
  const dots = document.createElement("span");
  dots.className = "rv-result__dots";
  dots.setAttribute("aria-hidden", "true");
  const note = document.createElement("span");
  note.className = "rv-result__note";
  note.textContent = entry.date ?? entry.site;
  row.append(number, label, dots, note);
  return row;
}

function mountPage(page: HTMLElement) {
  const site = page.dataset.searchSite as SiteId;
  const input = page.querySelector<HTMLInputElement>("[data-search-input]")!;
  const bubble = page.querySelector<HTMLElement>("[data-search-bubble]")!;
  const results = page.querySelector<HTMLElement>("[data-search-results]")!;
  const empty = page.querySelector<HTMLElement>("[data-search-empty]")!;
  const buttons = [
    ...page.querySelectorAll<HTMLButtonElement>("[data-search-scope]"),
  ];
  const initialPrompt = bubble.textContent ?? "";
  let scope: "site" | "everywhere" = "site";
  let selected = 0;
  let own: SearchEntry[] = [];
  let all: SearchEntry[] = [];

  function setSelected(next: number) {
    const rows = [
      ...results.querySelectorAll<HTMLAnchorElement>("[data-search-result]"),
    ];
    if (!rows.length) return;
    selected = (next + rows.length) % rows.length;
    rows.forEach((row, index) =>
      row.setAttribute("aria-selected", String(index === selected)),
    );
    rows[selected]?.scrollIntoView({ block: "nearest" });
  }

  function render() {
    const query = input.value.trim();
    results.replaceChildren();
    empty.hidden = true;
    selected = 0;
    if (!query) {
      bubble.textContent = initialPrompt;
      return;
    }
    const words = query.toLocaleLowerCase().split(/\s+/);
    const found = (scope === "site" ? own : all)
      .filter((entry) => matches(entry, words))
      .slice(0, 40);
    bubble.textContent = found.length
      ? `found ${found.length} ${found.length === 1 ? "thing" : "things"} about “${query}”!`
      : "hmm… nothing yet.";
    empty.hidden = found.length > 0;
    let rowIndex = 0;
    for (const groupSite of SITES) {
      const group = found.filter((entry) => entry.site === groupSite.id);
      if (!group.length) continue;
      const section = document.createElement("section");
      section.className = "rv-search-group";
      const heading = document.createElement("h2");
      heading.className = "rv-label";
      heading.textContent = groupSite.label;
      section.append(
        heading,
        ...group.map((entry) => resultRow(entry, rowIndex++)),
      );
      results.append(section);
    }
  }

  async function loadEverywhere() {
    const indexes = await Promise.allSettled(
      SITES.map((item) =>
        item.id === site ? Promise.resolve(own) : readIndex(item.id),
      ),
    );
    all = indexes.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    );
    render();
  }

  void readIndex(site)
    .then((entries) => {
      own = entries;
      all = entries;
      if (scope === "everywhere") void loadEverywhere();
      else render();
    })
    .catch(() => {
      bubble.textContent = "search is unavailable right now.";
    });

  input.addEventListener("input", render);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setSelected(selected + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Enter") {
      const row = [
        ...results.querySelectorAll<HTMLAnchorElement>("[data-search-result]"),
      ][selected];
      if (row) location.href = row.href;
    } else if (event.key === "Escape") {
      if (input.value) {
        input.value = "";
        render();
      } else input.blur();
    }
  });
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      scope = button.dataset.searchScope as typeof scope;
      buttons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      if (scope === "everywhere") void loadEverywhere();
      else render();
    }),
  );
  page
    .querySelectorAll<HTMLButtonElement>("[data-search-suggestion]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        input.value = button.dataset.searchSuggestion ?? "";
        render();
        input.focus();
      }),
    );
  const urlQuery = new URLSearchParams(location.search).get("q");
  if (urlQuery) input.value = urlQuery;
  render();
  requestAnimationFrame(() => input.focus());
}

export function attachSearch() {
  document
    .querySelectorAll<HTMLElement>("[data-search-key]")
    .forEach((node) => {
      node.textContent = /Mac|iPhone|iPad/.test(navigator.platform)
        ? "⌘K"
        : "ctrl K";
    });
  const page = document.querySelector<HTMLElement>("[data-search-page]");
  if (page) mountPage(page);
  const onKey = (event: KeyboardEvent) => {
    const command =
      (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    const slash =
      event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
    if ((!command && !slash) || isTyping(event.target)) return;
    event.preventDefault();
    if (page)
      page.querySelector<HTMLInputElement>("[data-search-input]")?.focus();
    else location.href = "/search";
  };
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}
