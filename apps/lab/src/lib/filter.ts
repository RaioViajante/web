/**
 * Enhance the statically rendered experiment list without changing its locale.
 * The result sentence for every filter is rendered into the page at build time
 * (`data-filter-results`, by filter name), so the script holds no wording and no
 * plural rule.
 */
export function startExperimentFilter() {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-filter]");
  const list = document.querySelector<HTMLElement>("[data-experiment-list]")!;
  const results = JSON.parse(list.dataset.filterResults!) as Record<
    string,
    string
  >;
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      const filter = button.dataset.filter!;
      buttons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      list.querySelectorAll<HTMLElement>("[data-status]").forEach((item) => {
        item.hidden = filter !== "all" && item.dataset.status !== filter;
      });
      document.querySelector("[data-filter-result]")!.textContent =
        results[filter]!;
    }),
  );
}
