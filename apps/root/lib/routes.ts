import type { LocaleId } from "../../../site/locales.ts";

// Root's route registry (docs/i18n.md, "Route and counterpart model"): every
// ordinary page has a route key and, per locale where it exists, its path.
// Counterparts, navigation, metadata, the sitemap, the search index and social
// cards all derive from here, so a page exists in a locale only if it is
// declared. The Portuguese tree is deliberately partial: This site and Setup
// have Portuguese counterparts; Gallery, Terms and Privacy remain
// English-only. Portuguese
// paths mirror the English ones. This file imports types only, so a plain
// Node test can load it.

export type RouteKey =
  | "home"
  | "about"
  | "projects"
  | "contact"
  | "gallery"
  | "this-site"
  | "setup"
  | "terms"
  | "privacy"
  | "search";

export type RoutePaths = Partial<Record<LocaleId, string>>;

export const routes: Record<RouteKey, RoutePaths> = {
  home: { en: "/", "pt-BR": "/pt" },
  about: { en: "/about", "pt-BR": "/pt/about" },
  projects: { en: "/projects", "pt-BR": "/pt/projects" },
  contact: { en: "/contact", "pt-BR": "/pt/contact" },
  gallery: { en: "/gallery" },
  "this-site": { en: "/this-site", "pt-BR": "/pt/this-site" },
  setup: { en: "/setup", "pt-BR": "/pt/setup" },
  terms: { en: "/terms" },
  privacy: { en: "/privacy" },
  search: { en: "/search", "pt-BR": "/pt/search" },
};

export const routeKeys = Object.keys(routes) as RouteKey[];

/** The route and locale a path is declared as, or undefined for an undeclared path. */
export function routeOfPath(
  path: string,
): { key: RouteKey; locale: LocaleId } | undefined {
  for (const key of routeKeys)
    for (const [locale, declared] of Object.entries(routes[key]))
      if (declared === path) return { key, locale: locale as LocaleId };
  return undefined;
}

/** The real counterparts of a page: its other declared locales. Never inferred from a path. */
export function counterpartsOf(key: RouteKey, locale: LocaleId) {
  return (Object.entries(routes[key]) as [LocaleId, string][])
    .filter(([other]) => other !== locale)
    .map(([other, path]) => ({ locale: other, path }));
}

/** Every declared page as `{ key, locale, path, counterparts }`, for validation and serialization. */
export function declaredPages() {
  return routeKeys.flatMap((key) =>
    (Object.entries(routes[key]) as [LocaleId, string][]).map(
      ([locale, path]) => ({
        key,
        locale,
        path,
        counterparts: counterpartsOf(key, locale),
      }),
    ),
  );
}

/** Locales with at least one published Root page, derived from the registry. */
export function publishedLocales(): LocaleId[] {
  return [...new Set(declaredPages().map(({ locale }) => locale))];
}
