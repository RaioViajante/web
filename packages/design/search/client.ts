import { SITES, type SiteId } from "../../../site/sites";
import type { SearchEntry } from "../components/search";
import { loadEverywhere, searchEntries, unavailableNote } from "./engine";

const indexPath = "/search-index.json";
const localPorts: Record<SiteId, readonly number[]> = {
  root: [3000, 3002],
  dump: [3000, 3001],
  docs: [4321],
  lab: [4322],
};

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

function localHost() {
  return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

async function fetchIndex(url: string, site: SiteId, localOrigin?: string) {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error(`Search index unavailable: ${site}`);
  const entries = (await response.json()) as SearchEntry[];
  if (!Array.isArray(entries) || entries.some((entry) => entry.site !== site)) {
    throw new Error(`Unexpected search index: ${site}`);
  }
  const canonicalOrigin = SITES.find((item) => item.id === site)!.href;
  return localOrigin
    ? entries.map((entry) => ({
        ...entry,
        href: entry.href.replace(canonicalOrigin, localOrigin),
      }))
    : entries;
}

async function readIndex(
  site: SiteId,
  currentSite: SiteId,
): Promise<SearchEntry[]> {
  if (site === currentSite) {
    return fetchIndex(
      indexPath,
      site,
      localHost() ? location.origin : undefined,
    );
  }
  if (localHost()) {
    for (const port of localPorts[site]) {
      const origin = `${location.protocol}//${location.hostname}:${port}`;
      try {
        return await fetchIndex(origin + indexPath, site, origin);
      } catch {
        // Try another local port before the deployed index.
      }
    }
  }
  return fetchIndex(indexHref(site), site);
}

function resultRow(entry: SearchEntry, index: number) {
  const row = document.createElement("a");
  row.className = "rv-result";
  row.href = entry.href;
  row.dataset.searchResult = "";
  row.dataset.sound = "nav";
  // Links cannot be "selected"; the row Enter would open is the current one.
  if (index === 0) row.setAttribute("aria-current", "true");
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
  const note = page.querySelector<HTMLElement>("[data-search-note]")!;
  const buttons = [
    ...page.querySelectorAll<HTMLButtonElement>("[data-search-scope]"),
  ];
  const initialPrompt = bubble.textContent ?? "";
  let scope: "site" | "everywhere" = "site";
  let selected = 0;
  let own: SearchEntry[] = [];
  let all: SearchEntry[] = [];
  let unavailable: SiteId[] = [];

  function setSelected(next: number) {
    const rows = [
      ...results.querySelectorAll<HTMLAnchorElement>("[data-search-result]"),
    ];
    if (!rows.length) return;
    selected = (next + rows.length) % rows.length;
    rows.forEach((row, index) => {
      if (index === selected) row.setAttribute("aria-current", "true");
      else row.removeAttribute("aria-current");
    });
    rows[selected]?.scrollIntoView({ block: "nearest" });
  }

  function render() {
    const query = input.value.trim();
    results.replaceChildren();
    empty.hidden = true;
    note.textContent = "";
    note.hidden = true;
    selected = 0;
    page
      .querySelectorAll<HTMLElement>("[data-search-suggestions]")
      .forEach((line) => {
        line.hidden = line.dataset.searchSuggestions !== scope;
      });
    if (!query) {
      bubble.textContent = initialPrompt;
      return;
    }
    const found = searchEntries(scope === "site" ? own : all, query);
    if (scope === "everywhere" && unavailable.length) {
      note.textContent = unavailableNote(unavailable);
      note.hidden = false;
    }
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

  async function loadAll() {
    const loaded = await loadEverywhere(site, own, (other) =>
      readIndex(other, site),
    );
    all = loaded.entries;
    unavailable = loaded.unavailable;
    render();
  }

  void readIndex(site, site)
    .then((entries) => {
      own = entries;
      all = entries;
      if (scope === "everywhere") void loadAll();
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
      if (scope === "everywhere") void loadAll();
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
  let mountedPage: HTMLElement | null = null;
  const mountCurrentPage = () => {
    const page = document.querySelector<HTMLElement>("[data-search-page]");
    if (page && page !== mountedPage) {
      mountedPage = page;
      mountPage(page);
    }
  };
  mountCurrentPage();
  const observer = new MutationObserver(mountCurrentPage);
  observer.observe(document.body, { childList: true, subtree: true });
  const onKey = (event: KeyboardEvent) => {
    const command =
      (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    const slash =
      event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
    if ((!command && !slash) || isTyping(event.target)) return;
    event.preventDefault();
    const currentPage =
      document.querySelector<HTMLElement>("[data-search-page]");
    if (currentPage)
      currentPage
        .querySelector<HTMLInputElement>("[data-search-input]")
        ?.focus();
    else
      location.href =
        document.querySelector<HTMLAnchorElement>(".rv-search")?.href ??
        "/search";
  };
  document.addEventListener("keydown", onKey);
  return () => {
    observer.disconnect();
    document.removeEventListener("keydown", onKey);
  };
}
