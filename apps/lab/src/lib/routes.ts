import type { LocaleId } from "../../../../site/locales.ts";

// Lab's route registry for ordinary pages (docs/i18n.md, "Route and
// counterpart model"). Experiments are content records in
// `data/experiments.ts`; every other page has a route key and, per locale, its
// path. Counterparts, navigation, the sitemap and social cards derive from
// here, so a page exists in a locale only if it is declared. Paths keep Lab's
// trailing slash. This file imports types only so plain Node tests can load it.

export type RouteKey = "home" | "search" | "terms" | "privacy";

export const routes = {
  home: { en: "/", "pt-BR": "/pt/" },
  search: { en: "/search/", "pt-BR": "/pt/search/" },
  terms: { en: "/terms/", "pt-BR": "/pt/terms/" },
  privacy: { en: "/privacy/", "pt-BR": "/pt/privacy/" },
} as const satisfies Record<RouteKey, Record<LocaleId, string>>;

export const routeKeys = Object.keys(routes) as RouteKey[];

/** The path of a route in a locale. */
export function routePath(key: RouteKey, locale: LocaleId): string {
  return routes[key][locale];
}

/** The real counterparts of a route: its other declared locales. */
export function routeCounterparts(key: RouteKey, locale: LocaleId) {
  return (Object.entries(routes[key]) as [LocaleId, string][])
    .filter(([other]) => other !== locale)
    .map(([other, path]) => ({ locale: other, path }));
}

/** Every declared route page, for validation and serialization. */
export function declaredRoutes() {
  return routeKeys.flatMap((key) =>
    (Object.entries(routes[key]) as [LocaleId, string][]).map(
      ([locale, path]) => ({
        key,
        locale,
        path,
        counterparts: routeCounterparts(key, locale),
      }),
    ),
  );
}
