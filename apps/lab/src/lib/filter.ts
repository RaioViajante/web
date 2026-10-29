import type { LocaleId } from "../../../../site/locales.ts";
import { counted, type PluralForms } from "./plural.ts";

/** Enhance the statically rendered experiment list without changing its locale. */
export function startExperimentFilter() {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-filter]");
  const list = document.querySelector<HTMLElement>("[data-experiment-list]")!;
  // Rendered into the page at build time; never read from the browser.
  const locale = list.dataset.locale as LocaleId;
  const forms = JSON.parse(list.dataset.countCopy!) as PluralForms;
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      buttons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      let count = 0;
      list.querySelectorAll<HTMLElement>("[data-status]").forEach((item) => {
        item.hidden =
          button.dataset.filter !== "all" &&
          item.dataset.status !== button.dataset.filter;
        if (!item.hidden) count++;
      });
      document.querySelector("[data-filter-result]")!.textContent = counted(
        locale,
        count,
        forms,
      );
    }),
  );
}
