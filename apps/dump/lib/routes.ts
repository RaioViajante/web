import type { LocaleId } from "../../../site/locales";

export type RouteKey =
  "home" | "archive" | "tags" | "terms" | "privacy" | "search";

export type RoutePaths = Partial<Record<LocaleId, string>>;

/**
 * Dump's ordinary-page registry. Content and tag routes are derived from the
 * published content inventory; they never appear here by hand.
 */
export const routes: Record<RouteKey, RoutePaths> = {
  home: { en: "/", "pt-BR": "/pt" },
  archive: { en: "/archive", "pt-BR": "/pt/archive" },
  tags: { en: "/tags", "pt-BR": "/pt/tags" },
  terms: { en: "/terms", "pt-BR": "/pt/terms" },
  privacy: { en: "/privacy", "pt-BR": "/pt/privacy" },
  search: { en: "/search", "pt-BR": "/pt/search" },
};

export const routeKeys = Object.keys(routes) as RouteKey[];

export function routeOfPath(
  path: string,
): { key: RouteKey; locale: LocaleId } | undefined {
  for (const key of routeKeys)
    for (const [locale, declared] of Object.entries(routes[key]))
      if (declared === path) return { key, locale: locale as LocaleId };
  return undefined;
}

export function counterpartsOf(key: RouteKey, locale: LocaleId) {
  return (Object.entries(routes[key]) as [LocaleId, string][])
    .filter(([other]) => other !== locale)
    .map(([other, path]) => ({ locale: other, path }));
}

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

export function publishedLocales(): LocaleId[] {
  return [...new Set(declaredPages().map(({ locale }) => locale))];
}
