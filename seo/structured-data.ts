import { DEFAULT_LOCALE, LOCALES, type LocaleId } from "../site/locales.ts";
import { siteOrigins } from "../site/sites.ts";

// Shared public identity and JSON-LD builders for the four sites. Plain
// TypeScript with no dependencies, imported by relative path like
// `security/headers.ts`; it is not part of the design system.

/**
 * The one public identity of the person behind the sites. Only facts the
 * sites already publish: the handle used as the author name everywhere, the
 * home page, and the GitHub profile linked from the home pages.
 */
export const identity = {
  name: "RaioViajante",
  url: `${siteOrigins.root}/`,
  id: `${siteOrigins.root}/#person`,
  github: "https://github.com/RaioViajante",
} as const;

/** A reference every page can embed; Google does not follow `@id` across documents. */
export function personRef() {
  return {
    "@type": "Person" as const,
    "@id": identity.id,
    name: identity.name,
    url: identity.url,
  };
}

/** The full Person node, published once on the root home page. */
export function personJsonLd() {
  return { ...personRef(), sameAs: [identity.github] };
}

/**
 * `inLanguage` of a content node (`WebPage`, `BlogPosting`, `TechArticle`) is
 * the rendered locale. Identity nodes (`Person`) and `BreadcrumbList` carry none.
 */
export function inLanguageOf(locale: LocaleId) {
  return LOCALES[locale].inLanguage;
}

/**
 * The `inLanguage` of a host-level node (`WebSite`, `Blog`): the locales the
 * host has actually shipped, English until it ships another. One value or a list.
 */
export function shippedLanguages(
  locales: readonly LocaleId[] = [DEFAULT_LOCALE],
) {
  const languages = locales.map(inLanguageOf);
  return languages.length === 1 ? languages[0]! : languages;
}

/** The `WebPage` a content node is the main entity of: the rendered locale's language. */
export function webPageRef(url: string, locale: LocaleId = DEFAULT_LOCALE) {
  return {
    "@type": "WebPage" as const,
    "@id": url,
    inLanguage: inLanguageOf(locale),
  };
}

export function websiteId(origin: string) {
  return new URL("/#website", origin).href;
}

/**
 * `author` is opt-in: set it only where the site itself states who writes it.
 */
export function websiteJsonLd(
  origin: string,
  name: string,
  description: string,
  options: {
    author?: boolean;
    /**
     * The locales the host has actually shipped. The same set must be stated
     * by every page that emits this node; it is English until a host ships
     * another locale.
     */
    languages?: readonly LocaleId[];
  } = {},
) {
  return {
    "@type": "WebSite" as const,
    "@id": websiteId(origin),
    name,
    description,
    url: new URL("/", origin).href,
    inLanguage: shippedLanguages(options.languages),
    ...(options.author ? { author: personRef() } : {}),
  };
}

/** Breadcrumb items are real pages, in navigation order, as `[name, path]`. */
export function breadcrumbJsonLd(
  origin: string,
  items: Array<[string, string]>,
) {
  return {
    "@type": "BreadcrumbList" as const,
    itemListElement: items.map(([name, path], index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name,
      item: new URL(path, origin).href,
    })),
  };
}

/** One `<script type="application/ld+json">` body for the given nodes. */
export function jsonLdScript(...nodes: object[]) {
  // `<` is escaped so a value can never close the surrounding script element.
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  }).replace(/</g, "\\u003c");
}
