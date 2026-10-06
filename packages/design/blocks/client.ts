/**
 * Behavior for the soft blocks: copy, file tabs, collapse. No dependencies
 * beyond the shared sound player. Attach once per page.
 */
import { playSound } from "../sound/player";

const COPIED_MS = 1500;

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
    const label = copy.dataset.label ?? copy.textContent ?? "copy";
    copy.dataset.label = label;
    copy.textContent = "copied";
    copy.classList.add("is-copied");
    window.setTimeout(() => {
      copy.textContent = label;
      copy.classList.remove("is-copied");
    }, COPIED_MS);
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
    const total = Math.max(
      ...[...block.querySelectorAll("pre")].map(
        (pre) => pre.querySelectorAll(".line").length,
      ),
    );
    more.textContent = collapsed ? `show all ${total} lines` : "show less";
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
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeydown);
  return () => {
    document.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKeydown);
  };
}
