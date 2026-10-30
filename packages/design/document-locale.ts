import {
  DEFAULT_LOCALE,
  LOCALE_IDS,
  LOCALES,
  type LocaleId,
} from "../../site/locales";

/**
 * The registry locale a document states through `<html lang>`, or undefined
 * when it states none the registry knows. The URL decides the rendered locale
 * on the server; shared client behavior only reads what was rendered
 * (docs/i18n.md, "Locale authority"). Nothing is read from the browser.
 */
export function documentLocale(
  doc: Pick<Document, "documentElement"> = document,
): LocaleId | undefined {
  const lang = doc.documentElement.lang.trim().toLowerCase();
  return LOCALE_IDS.find((id) => LOCALES[id].htmlLang.toLowerCase() === lang);
}

/**
 * The locale for client text. A document that states no registry language
 * (a bare test page) keeps the English default that every control had before
 * localization; a real page always states one.
 */
export function clientLocale(
  doc: Pick<Document, "documentElement"> = document,
): LocaleId {
  return documentLocale(doc) ?? DEFAULT_LOCALE;
}
