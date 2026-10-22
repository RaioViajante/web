import { DEFAULT_LOCALE, LOCALE_IDS, isLocaleId, isReservedPath, localeOfPath, localizedPath, type LocaleId } from "../../../../site/locales.ts";
import { checkLocaleInventory, type LocalizedRoute } from "../../../../seo/locale.ts";

export interface DocumentRecord {
	id: string;
	contentId: string;
	locale: LocaleId;
	originalLocale: LocaleId;
	path: string;
}

/** A version's editorial update date is independent of its counterpart's. */
export function updatedAt(record: { lastUpdated?: string }) {
	return record.lastUpdated;
}

/** Static app routes cannot be occupied by a content entry. */
const staticPaths = new Set([
	...LOCALE_IDS.flatMap((locale) => ["/", "/search/", "/404/"].map((path) => localizedPath("docs", locale, path))),
	"/privacy/", "/terms/",
]);

/** Validate the declared public collection, including nonpublic original provenance. */
export function documentRoutes(
	records: readonly DocumentRecord[],
	withdrawnOriginals: readonly DocumentRecord[] = [],
): LocalizedRoute[] {
	const versions = new Map<string, DocumentRecord>();
	const paths = new Set<string>(staticPaths);
	const originals = new Map<string, LocaleId>();
	for (const record of [...records, ...withdrawnOriginals]) {
		if (!record.contentId || !isLocaleId(record.locale) || !isLocaleId(record.originalLocale))
			throw new Error(`Invalid document identity: ${record.id}`);
		const key = `${record.contentId}\0${record.locale}`;
		if (versions.has(key)) throw new Error(`Duplicate document identity: ${key}`);
		versions.set(key, record);
		const original = originals.get(record.contentId);
		if (original && original !== record.originalLocale)
			throw new Error(`Conflicting original locale: ${record.contentId}`);
		originals.set(record.contentId, record.originalLocale);
	}
	for (const [id, original] of originals) {
		if (!versions.has(`${id}\0${original}`)) throw new Error(`Missing original: ${id}`);
	}
	for (const record of withdrawnOriginals) {
		if (record.locale !== record.originalLocale) throw new Error(`Non-original provenance: ${record.id}`);
	}
	for (const record of records) {
		if (!/^\/(?:[a-z0-9-]+\/)+$/.test(record.path)) throw new Error(`Invalid document path: ${record.path}`);
		if (localeOfPath(record.path) !== record.locale) throw new Error(`Locale/path mismatch: ${record.path}`);
		if (paths.has(record.path)) throw new Error(`Duplicate or reserved document path: ${record.path}`);
		paths.add(record.path);
		if (record.locale === DEFAULT_LOCALE && isReservedPath(`/${record.id}/`))
			throw new Error(`Reserved English entry ID: ${record.id}`);
	}
	const routes = records.map((record) => ({
		locale: record.locale,
		path: record.path,
		counterparts: records
			.filter((other) => other.contentId === record.contentId && other.locale !== record.locale)
			.map(({ locale, path }) => ({ locale, path })),
	}));
	const problems = checkLocaleInventory("docs", routes);
	if (problems.length) throw new Error(problems.join("\n"));
	return routes;
}
