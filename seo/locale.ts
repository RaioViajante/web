import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_IDS,
  isLocaleId,
  localeOfPath,
  trailingSlash,
  type LocaleId,
} from "../site/locales.ts";
import type { SiteId as Site } from "../site/sites.ts";
import type { Problems } from "./metadata-policy.ts";

// Locale-aware serialization and validation of facts that apps supply. An app
// states which real, public localized pages exist and which of them are
// counterparts of each other. Nothing here derives a counterpart from a path,
// slug, title or filename, and nothing here knows an app's routes
// (docs/i18n.md, "SEO" and "Ownership boundaries").

/** A real, public page in another locale, by its path in the host's own form. */
export interface Counterpart {
  locale: LocaleId;
  path: string;
}

/** One localized page: its locale, its own path, and its declared counterparts. */
export interface LocalizedRoute {
  locale: LocaleId;
  path: string;
  counterparts?: readonly Counterpart[];
}

export interface AlternateLink {
  /** A registry `hreflang`, or `x-default`. */
  hreflang: string;
  href: string;
}

export interface AlternateCluster {
  /** Every member (the page itself and its counterparts), then `x-default` if any. */
  links: AlternateLink[];
  /** Open Graph locales of the counterparts only, for `og:locale:alternate`. */
  ogAlternates: string[];
}

/** The registry Open Graph locale (`en_US`, `pt_BR`). */
export const ogLocale = (locale: LocaleId) => LOCALES[locale].openGraphLocale;

function assertPlacement(route: LocalizedRoute) {
  if (!isLocaleId(route.locale))
    throw new RangeError(`Unsupported locale ${JSON.stringify(route.locale)}`);
  if (localeOfPath(route.path) !== route.locale)
    throw new RangeError(
      `${route.path} is not a ${route.locale} path (it belongs to ${localeOfPath(route.path)})`,
    );
}

/**
 * The `hreflang` cluster of a page, or undefined when it has no declared
 * counterpart: a page alone in its cluster emits nothing, not even a
 * self-reference. Throws when the supplied facts contradict themselves, since
 * serializing them would publish a wrong cluster.
 *
 * `x-default` is the English member. With the two supported locales every
 * cluster has one; a future locale mix without an English member gets none
 * until an explicit default is defined for it.
 */
export function alternateCluster(
  origin: string,
  page: LocalizedRoute,
): AlternateCluster | undefined {
  const counterparts = page.counterparts ?? [];
  if (counterparts.length === 0) return undefined;
  assertPlacement(page);
  const members = [{ locale: page.locale, path: page.path }];
  for (const counterpart of counterparts) {
    assertPlacement(counterpart);
    if (members.some((member) => member.locale === counterpart.locale))
      throw new RangeError(
        `Duplicate ${counterpart.locale} member in the cluster of ${page.path}`,
      );
    members.push(counterpart);
  }
  members.sort(
    (a, b) => LOCALE_IDS.indexOf(a.locale) - LOCALE_IDS.indexOf(b.locale),
  );
  const href = (path: string) => new URL(path, origin).href;
  const links: AlternateLink[] = members.map((member) => ({
    hreflang: LOCALES[member.locale].hreflang,
    href: href(member.path),
  }));
  const fallback = members.find((member) => member.locale === DEFAULT_LOCALE);
  if (fallback)
    links.push({ hreflang: "x-default", href: href(fallback.path) });
  return {
    links,
    ogAlternates: counterparts
      .map((counterpart) => ogLocale(counterpart.locale))
      .sort(),
  };
}

const isFile = (path: string) => /\.[A-Za-z0-9]+$/.test(path.split("/").pop()!);

/** Whether a page path is in the host's trailing-slash form. */
function hostForm(site: Site, path: string) {
  if (path === "/" || isFile(path)) return true;
  return trailingSlash[site] === "always"
    ? path.endsWith("/")
    : !path.endsWith("/");
}

/**
 * Checks an app's inventory of its real public localized pages. Every
 * counterpart must itself be in the inventory (a page that is not public is not
 * an alternate), in the locale and place it is declared at, and must declare
 * the same cluster back. This validates what the app says; it never adds to it.
 */
export function checkLocaleInventory(
  site: Site,
  routes: readonly LocalizedRoute[],
): Problems {
  const p: Problems = [];
  const at = (route: LocalizedRoute) => `app ${site} route ${route.path}`;
  const byPath = new Map<string, LocalizedRoute>();
  for (const route of routes) {
    if (byPath.has(route.path)) p.push(`${at(route)}: declared twice`);
    byPath.set(route.path, route);
  }
  const key = (route: LocalizedRoute) =>
    [
      `${route.locale} ${route.path}`,
      ...(route.counterparts ?? []).map((c) => `${c.locale} ${c.path}`),
    ]
      .sort()
      .join(" | ");
  for (const route of routes) {
    try {
      assertPlacement(route);
    } catch (error) {
      p.push(`${at(route)}: ${(error as Error).message}`);
      continue;
    }
    if (!hostForm(site, route.path))
      p.push(`${at(route)}: not in ${site}'s trailing-slash form`);
    const seen = new Set<string>([route.locale]);
    for (const counterpart of route.counterparts ?? []) {
      const to = `${at(route)}: counterpart ${counterpart.locale} ${counterpart.path}`;
      if (!isLocaleId(counterpart.locale)) {
        p.push(`${to} has an unsupported locale`);
        continue;
      }
      if (seen.has(counterpart.locale))
        p.push(`${to} repeats the locale ${counterpart.locale} in the cluster`);
      seen.add(counterpart.locale);
      if (!hostForm(site, counterpart.path))
        p.push(`${to} is not in ${site}'s trailing-slash form`);
      const target = byPath.get(counterpart.path);
      if (!target) {
        p.push(`${to} is not a declared public route`);
        continue;
      }
      if (target.locale !== counterpart.locale)
        p.push(`${to} is declared as ${target.locale}`);
      else if (
        !(target.counterparts ?? []).some(
          (c) => c.path === route.path && c.locale === route.locale,
        )
      )
        p.push(`${to} does not list ${route.path} back`);
      else if (key(target) !== key(route))
        p.push(`${to} belongs to a different cluster than ${route.path}`);
    }
  }
  return p;
}
