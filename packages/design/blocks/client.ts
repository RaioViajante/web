/**
 * Behavior for the soft blocks: copy, file tabs, collapse. No dependencies
 * beyond the shared sound player. Attach once per page.
 */
import { catalogFor } from "../catalog";
import { clientLocale, documentLocale } from "../document-locale";
import { DEFAULT_LOCALE } from "../../../site/locales";
import { playSound } from "../sound/player";

const COPIED_MS = 1500;

/** The words of the block controls in the language the document states. */
const words = () => catalogFor(clientLocale()).blocks;

/**
 * The one polite status for assistive technology; a button's text change alone
 * is not announced. A live region only announces changes made after it is in
 * the document, so it is created empty up front (see `attachBlocks`), never
 * at the moment of the first announcement.
 */
function statusRegion() {
  let region = document.querySelector<HTMLElement>("[data-block-status]");
  if (!region) {
    region = document.createElement("div");
    region.className = "rv-sr-only";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    region.setAttribute("data-block-status", "");
    document.body.append(region);
  }
  return region;
}

/** Creates the region as soon as the page has something to copy. */
function prepareStatusRegion() {
  if (document.querySelector(".block__copy")) statusRegion();
}

function announce(message: string) {
  const live = statusRegion();
  live.textContent = "";
  // A change after the region exists is what gets announced.
  window.setTimeout(() => {
    live.textContent = message;
  }, 50);
  window.setTimeout(() => {
    if (live.textContent === message) live.textContent = "";
  }, COPIED_MS);
}

const restoreTimers = new WeakMap<Element, number>();

const copyLabel = (block: Element) =>
  block.classList.contains("block--terminal")
    ? words().copyCommands
    : words().copy;

/**
 * Pages built without a locale (a pipeline that states none) carry the English
 * controls. Reconciles them with the catalog of the language the document
 * states (`<html lang>`), so a localized page is right even when its markup
 * came from an older pipeline. Only the default locale's own words are
 * rewritten, and only when they still stand exactly as built, so author text
 * and already-localized markup are never touched. Idempotent.
 */
export function localizeBlocks(root: ParentNode = document) {
  const locale = documentLocale();
  if (!locale || locale === DEFAULT_LOCALE) return;
  const stale = catalogFor(DEFAULT_LOCALE).blocks;
  const own = catalogFor(locale).blocks;
  const write = (node: Element, text: string) => {
    if (node.textContent !== text) node.textContent = text;
  };
  const label = (node: Element, from: string, to: string) => {
    if (node.getAttribute("aria-label") === from)
      node.setAttribute("aria-label", to);
  };

  root.querySelectorAll(".block__copy:not(.is-copied)").forEach((button) => {
    const text = button.textContent;
    if (text === stale.copy) write(button, own.copy);
    else if (text === stale.copyCommands) write(button, own.copyCommands);
  });
  root
    .querySelectorAll('.block__tabs[role="tablist"]')
    .forEach((list) => label(list, stale.files, own.files));
  root.querySelectorAll(".block__tabs .block__tab").forEach((tab, index) => {
    const siblings = [
      ...(tab.parentElement?.querySelectorAll(".block__tab") ?? []),
    ];
    const at = siblings.indexOf(tab) + 1 || index + 1;
    if (tab.textContent === stale.fileNumber(at))
      write(tab, own.fileNumber(at));
  });
  root.querySelectorAll(".block__more button").forEach((button) => {
    const block = button.closest(".block");
    const total = block ? lineTotal(block) : 0;
    const text = button.textContent;
    if (text === stale.showAll(total)) write(button, own.showAll(total));
    else if (text === stale.showLess) write(button, own.showLess);
  });
  root.querySelectorAll(".block__meta > span:last-child").forEach((meta) => {
    const parts = (meta.textContent ?? "").split(" · ");
    const last = parts[parts.length - 1] ?? "";
    const range = /^(?:lines? )(\d+)(?:–(\d+))?$/.exec(last);
    if (!range) return;
    const from = Number(range[1]);
    const to = range[2] === undefined ? undefined : Number(range[2]);
    const english = to === undefined ? stale.line(from) : stale.lines(from, to);
    if (last !== english) return;
    parts[parts.length - 1] =
      to === undefined ? own.line(from) : own.lines(from, to);
    write(meta, parts.join(" · "));
  });
  root.querySelectorAll(".callout > .callout__label").forEach((node) => {
    const callout = node.parentElement!;
    const kind =
      (Object.keys(stale.callouts) as (keyof typeof stale.callouts)[]).find(
        (name) => callout.classList.contains(`callout--${name}`),
      ) ?? "note";
    if (node.textContent === stale.callouts[kind])
      write(node, own.callouts[kind]);
  });
  root
    .querySelectorAll("ol.footnotes")
    .forEach((list) => label(list, stale.footnotes, own.footnotes));
  root.querySelectorAll("a[data-footnote-backref]").forEach((link) => {
    const name = link.getAttribute("aria-label") ?? "";
    const match = /^Back to reference (\S+)$/.exec(name);
    if (match && name === stale.footnoteBack(match[1]!))
      link.setAttribute("aria-label", own.footnoteBack(match[1]!));
  });
}

/** The most lines any panel of a block has: the number its expand control states. */
function lineTotal(block: Element) {
  return Math.max(
    ...[...block.querySelectorAll("pre")].map(
      (pre) => pre.querySelectorAll(".line").length,
    ),
  );
}

function textOf(block: Element) {
  if (block.classList.contains("block--terminal"))
    return [...block.querySelectorAll(".term-cmd")]
      .map((node) => node.textContent ?? "")
      .join("\n");
  const panel = block.querySelector('[role="tabpanel"]:not([hidden])') ?? block;
  const lines = [...panel.querySelectorAll(".line")];
  return lines.length
    ? lines.map((node) => node.textContent ?? "").join("\n")
    : (panel.querySelector("code")?.textContent ?? "");
}

function selectTab(tab: HTMLElement, focus = false) {
  const block = tab.closest(".block");
  if (!block) return;
  block.querySelectorAll<HTMLElement>(".block__tab").forEach((other) => {
    other.setAttribute("aria-selected", String(other === tab));
    other.tabIndex = other === tab ? 0 : -1;
  });
  block.querySelectorAll<HTMLElement>('[role="tabpanel"]').forEach((panel) => {
    panel.hidden = panel.id !== tab.getAttribute("aria-controls");
  });
  if (focus) tab.focus();
}

async function onClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const copy = target.closest<HTMLElement>(".block__copy");
  if (copy) {
    const block = copy.closest(".block");
    if (!block) return;
    try {
      await navigator.clipboard.writeText(textOf(block));
    } catch {
      return; // clipboard unavailable: leave the label alone
    }
    playSound("copy");
    copy.textContent = words().copied;
    copy.classList.add("is-copied");
    announce(words().copied);
    window.clearTimeout(restoreTimers.get(copy));
    restoreTimers.set(
      copy,
      window.setTimeout(() => {
        // Restored from the catalog, never from remembered text, so the label
        // stays in the page's language however the page was built.
        copy.textContent = copyLabel(block);
        copy.classList.remove("is-copied");
      }, COPIED_MS),
    );
    return;
  }

  const tab = target.closest<HTMLElement>(".block__tab");
  if (tab) {
    selectTab(tab);
    playSound("click");
    return;
  }

  const more = target.closest<HTMLElement>(".block__more button");
  if (more) {
    const block = more.closest(".block");
    if (!block) return;
    const collapsed = block.classList.toggle("is-collapsed");
    const total = lineTotal(block);
    more.textContent = collapsed ? words().showAll(total) : words().showLess;
    more.setAttribute("aria-expanded", String(!collapsed));
    playSound("click");
  }
}

function onKeydown(event: KeyboardEvent) {
  const tab = (event.target as Element | null)?.closest?.<HTMLElement>(
    ".block__tab",
  );
  if (!tab) return;
  const tabs = [
    ...(tab
      .closest(".block__tabs")
      ?.querySelectorAll<HTMLElement>(".block__tab") ?? []),
  ];
  const at = tabs.indexOf(tab);
  const next =
    event.key === "ArrowRight"
      ? tabs[(at + 1) % tabs.length]
      : event.key === "ArrowLeft"
        ? tabs[(at - 1 + tabs.length) % tabs.length]
        : event.key === "Home"
          ? tabs[0]
          : event.key === "End"
            ? tabs[tabs.length - 1]
            : null;
  if (!next) return;
  event.preventDefault();
  selectTab(next, true);
  playSound("click");
}

/** Attaches delegated block behavior to the document. Returns a detach function. */
export function attachBlocks() {
  document.querySelectorAll<HTMLElement>(".block__tab").forEach((tab) => {
    tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
  });
  localizeBlocks();
  prepareStatusRegion();
  // Client-side navigation swaps the page; reconcile whatever arrives.
  const observer = new MutationObserver(() => {
    localizeBlocks();
    prepareStatusRegion();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeydown);
  return () => {
    observer.disconnect();
    document.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKeydown);
  };
}
