import { LOCALES, type LocaleId } from "../../../../site/locales.ts";

/**
 * A page's explicit `lastUpdated` (`YYYY-MM-DD`) as a long date in the page's
 * locale: "September 27, 2026", "27 de setembro de 2026". Always the same
 * calendar day in every timezone; the ISO value stays in `<time datetime>`.
 */
export function formatDocDate(iso: string, locale: LocaleId) {
	if (!/^\d{4}-\d\d-\d\d$/.test(iso)) throw new RangeError(`Expected an ISO calendar date, received ${iso}`);
	const date = new Date(`${iso}T00:00:00Z`);
	if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) throw new RangeError(`Invalid calendar date ${iso}`);
	return new Intl.DateTimeFormat(LOCALES[locale].intlLocale, {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	}).format(date);
}
