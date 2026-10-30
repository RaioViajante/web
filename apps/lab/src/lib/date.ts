import { LOCALES, type LocaleId } from "../../../../site/locales.ts";

/** `2026-09-13` as the same calendar date in the locale's long format, in every timezone. */
export function formatDate(locale: LocaleId, iso: string): string {
  if (!/^\d{4}-\d\d-\d\d$/.test(iso))
    throw new RangeError(`Expected an ISO calendar date, received ${iso}`);
  return new Intl.DateTimeFormat(LOCALES[locale].intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
