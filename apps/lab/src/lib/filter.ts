/** Enhance the statically rendered experiment list without changing its locale. */
export function startExperimentFilter() {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-filter]");
  const list = document.querySelector<HTMLElement>("[data-experiment-list]")!;
  const words = JSON.parse(list.dataset.countCopy!) as {
    one: string;
    many: string;
  };
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
      document.querySelector("[data-filter-result]")!.textContent =
        count === 1 ? words.one : `${count} ${words.many}`;
    }),
  );
}
