export const SITE_NAME = "lab";
export const SITE_TAGLINE = "things may break.";

/**
 * Ecosystem document-title convention, verified against the current sibling
 * sources (not the older raioviajante.com "%s · raioviajante" pattern):
 * dump's app/layout.tsx uses `title.default: \`${site.name} — ${site.tagline}\`
 * and `title.template: "%s — ${site.name}"`, and docs/astro.config.mjs sets
 * `titleDelimiter: '—'` specifically to match dump's convention (its own
 * comment cites dump's template string directly). Lab follows the same
 * lowercase-identity/em-dash grammar rather than inventing its own.
 *
 * - No page title (homepage): "lab — things may break."
 * - Page title given: "<page title> — lab"
 */
export function formatTitle(pageTitle?: string): string {
  return pageTitle
    ? `${pageTitle} — ${SITE_NAME}`
    : `${SITE_NAME} — ${SITE_TAGLINE}`;
}
