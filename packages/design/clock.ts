import { ownerLocation } from "../../site/owner-location";

const clockFormatter = (timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

/** Formats a clock value without ever falling back to the visitor's timezone. */
export function formatLocationTime(date: Date, timeZone: string): string {
  return clockFormatter(timeZone).format(date);
}

/** Paints every shared clock, including one introduced by client navigation. */
export function updateOwnerClocks(date = new Date()): void {
  const value = formatLocationTime(date, ownerLocation.timeZone);
  document
    .querySelectorAll<HTMLTimeElement>("[data-owner-clock]")
    .forEach((clock) => {
      if (clock.textContent !== value) clock.textContent = value;
      if (clock.dateTime !== value) clock.dateTime = value;
    });
}

/** Keeps the clock aligned to minute boundaries and resyncs after tab sleep. */
export function initOwnerClock(): () => void {
  let timer = 0;

  const schedule = () => {
    window.clearTimeout(timer);
    const now = new Date();
    updateOwnerClocks(now);
    timer = window.setTimeout(schedule, 60_000 - (now.getTime() % 60_000) + 20);
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") schedule();
  };

  schedule();
  document.addEventListener("visibilitychange", onVisibilityChange);
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}
