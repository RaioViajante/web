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
  url: "https://raioviajante.com/",
  id: "https://raioviajante.com/#person",
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
  options: { author?: boolean } = {},
) {
  return {
    "@type": "WebSite" as const,
    "@id": websiteId(origin),
    name,
    description,
    url: new URL("/", origin).href,
    inLanguage: "en",
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
