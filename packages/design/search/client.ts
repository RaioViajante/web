import { catalogFor } from "../catalog";
import { isLocaleId, type LocaleId } from "../../../site/locales";
import { SITES, type SiteId } from "../../../site/sites";
import type { SearchEntry } from "../components/search";
import {
  loadEverywhere,
  loadCurrentSiteIndex,
  searchEntries,
  skippedNote,
  unavailableNote,
} from "./engine";
import { formatSearchDate, searchIndexPath, validateIndex } from "./locale";

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

function indexHref(site: SiteId, locale: LocaleId) {
  return (
    SITES.find((item) => item.id === site)!.href + searchIndexPath(site, locale)
  );
}

function localHost() {
  return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

async function fetchIndex(
  url: string,
  site: SiteId,
  locale: LocaleId,
  localOrigin?: string,
) {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error(`Search index unavailable: ${site}`);
  const entries = validateIndex(await response.json(), site, locale);
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
  locale: LocaleId,
): Promise<SearchEntry[]> {
  const path = searchIndexPath(site, locale);
  if (site === currentSite) {
    return fetchIndex(
      path,
      site,
      locale,
      localHost() ? location.origin : undefined,
    );
  }
  if (localHost()) {
    for (const port of localPorts[site]) {
      const origin = `${location.protocol}//${location.hostname}:${port}`;
      try {
        return await fetchIndex(origin + path, site, locale, origin);
      } catch {
        // Try another local port before the deployed index.
      }
    }
  }
  return fetchIndex(indexHref(site, locale), site, locale);
}

function resultRow(entry: SearchEntry, index: number, locale: LocaleId) {
  const row = document.createElement("a");
  row.className = "rv-result";
  row.href = entry.href;
  row.dataset.searchResult = "";
  row.dataset.testid = "search-result";
  row.dataset.sound = "nav";
  // Links cannot be "selected"; the row Enter would open is the current one.
  if (index === 0) row.setAttribute("aria-current", "true");
  const number = document.createElement("span");
  number.className = "rv-result__number";
  number.dataset.testid = "search-result-number";
  number.textContent = entry.number ?? String(index + 1).padStart(2, "0") + ".";
  const label = document.createElement("span");
  label.dataset.testid = "search-result-title";
  label.textContent = entry.title;
  const dots = document.createElement("span");
  dots.className = "rv-result__dots";
  dots.setAttribute("aria-hidden", "true");
  const note = document.createElement("span");
  note.className = "rv-result__note";
  note.dataset.testid = "search-result-note";
  note.textContent = entry.date
    ? formatSearchDate(entry.date, locale)
    : entry.site;
  row.append(number, label, dots, note);
  return row;
}

function mountPage(page: HTMLElement) {
  const site = page.dataset.searchSite as SiteId;
  const stated = page.dataset.searchLocale;
  if (!isLocaleId(stated)) throw new Error("Search page states no locale");
  const locale: LocaleId = stated;
  const text = catalogFor(locale).search;
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
  let skipped: SiteId[] = [];

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
    const found = searchEntries(scope === "site" ? own : all, query, locale);
    if (scope === "everywhere") {
      const notes = [
        unavailableNote(unavailable, locale),
        skippedNote(skipped, locale),
      ].filter(Boolean);
      if (notes.length) {
        note.textContent = notes.join(" ");
        note.hidden = false;
      }
    }
    bubble.textContent = found.length
      ? text.found(found.length, query)
      : text.nothing;
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
        ...group.map((entry) => resultRow(entry, rowIndex++, locale)),
      );
      results.append(section);
    }
  }

  async function loadAll() {
    const loaded = await loadEverywhere(site, locale, own, (other) =>
      readIndex(other, site, locale),
    );
    all = loaded.entries;
    unavailable = loaded.unavailable;
    skipped = loaded.skipped;
    render();
  }

  // The current route's own published index is available independently of
  // cross-host participation. `loadAll` applies participation to peers only.
  void loadCurrentSiteIndex(site, locale, () =>
    readIndex(site, site, locale),
  ).then((index) => {
    page.dataset.searchState = index.state;
    if (index.state === "ready") {
      own = index.entries;
      all = index.entries;
      if (scope === "everywhere") void loadAll();
      else render();
    } else bubble.textContent = text.unavailable;
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

/**
 * Progressive enhancement for `LANG` on a search page: the server renders a
 * real link to the other locale's search page; this adds `q`, and only `q`,
 * from the live input (or the URL). Without it the link still navigates.
 */
function carryQuery() {
  const input = document.querySelector<HTMLInputElement>("[data-search-input]");
  const q = (
    input?.value ??
    new URLSearchParams(location.search).get("q") ??
    ""
  ).trim();
  document
    .querySelectorAll<HTMLAnchorElement>("a[data-lang-search]")
    .forEach((link) => {
      link.dataset.langSearchBase ??= link.getAttribute("href") ?? "";
      const base = link.dataset.langSearchBase;
      link.setAttribute(
        "href",
        q ? `${base}?${new URLSearchParams({ q })}` : base,
      );
    });
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
    carryQuery();
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
  document.addEventListener("input", carryQuery);
  return () => {
    observer.disconnect();
    document.removeEventListener("input", carryQuery);
    document.removeEventListener("keydown", onKey);
  };
}
