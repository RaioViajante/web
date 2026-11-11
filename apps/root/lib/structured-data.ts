import { inLanguageOf, websiteId } from "../../../seo/structured-data";
import type { LocaleId } from "../../../site/locales";
import { routes } from "./routes";
import { origin } from "./seo";

/**
 * The `WebPage` of Root's localized home: its language is the rendered
 * locale, and it belongs to Root's one WebSite by `@id` (the full WebSite node
 * stays on the English home). Other Root pages publish no JSON-LD
 * (docs/seo.md, "Structured data").
 */
export function localizedHomeJsonLd(locale: Exclude<LocaleId, "en">) {
  const path = routes.home[locale]!;
  return {
    "@type": "WebPage" as const,
    "@id": new URL(path, origin).href,
    url: new URL(path, origin).href,
    inLanguage: inLanguageOf(locale),
    isPartOf: { "@id": websiteId(origin) },
  };
}
