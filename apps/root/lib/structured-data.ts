import { inLanguageOf, websiteId } from "../../../seo/structured-data";
import type { LocaleId } from "../../../site/locales";
import { origin } from "./seo";

/**
 * The `WebPage` of a localized Root page: its language is the rendered
 * locale, and it belongs to Root's one WebSite by `@id` (the full WebSite node
 * stays on the English home).
 */
export function webPageJsonLd(path: string, locale: LocaleId) {
  return {
    "@type": "WebPage" as const,
    "@id": new URL(path, origin).href,
    url: new URL(path, origin).href,
    inLanguage: inLanguageOf(locale),
    isPartOf: { "@id": websiteId(origin) },
  };
}
