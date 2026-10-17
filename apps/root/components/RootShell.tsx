import Link from "next/link";
import type { ReactNode } from "react";
import { Shell, type NavItem } from "@raioviajante/design/components";
import { DEFAULT_LOCALE, type LocaleId } from "../../../site/locales";
import { SearchNavItem } from "@raioviajante/design/search";
import { ptNavigation } from "../lib/pt";
import { routeOfPath, routes, counterpartsOf } from "../lib/routes";

const englishPages: NavItem[] = [
  { label: "index", href: "/" },
  { label: "about", href: "/about" },
  { label: "projects", href: "/projects" },
  { label: "contact", href: "/contact" },
  { label: "gallery", href: "/gallery" },
  { label: "this site", href: "/this-site" },
];

/** Navigation of the pages that exist in a locale; its labels are Root's own. */
function navigation(locale: LocaleId): NavItem[] {
  if (locale === DEFAULT_LOCALE) return englishPages;
  return ptNavigation.map(({ key, label }) => ({
    label,
    href: routes[key][locale]!,
  }));
}

/**
 * The shared shell with root's pages in a locale. `current` is the page's own
 * path. The language control gets this page's real counterpart from the route
 * registry (it only uses it once both locales participate).
 */
export function RootShell({
  current,
  locale = DEFAULT_LOCALE,
  children,
}: {
  current?: string;
  locale?: LocaleId;
  children: ReactNode;
}) {
  const pages = navigation(locale);
  const route = current ? routeOfPath(current) : undefined;
  const searchHref = routes.search[locale]!;
  const counterpart = route
    ? counterpartsOf(route.key, locale)[0]?.path
    : undefined;
  return (
    <Shell
      site="root"
      locale={locale}
      language={{
        search: current === searchHref,
        ...(counterpart ? { counterpart } : {}),
      }}
      // Portuguese pages link the English legal text, which says so in words.
      {...(locale !== DEFAULT_LOCALE
        ? { termsLocale: DEFAULT_LOCALE, privacyLocale: DEFAULT_LOCALE }
        : {})}
      linkComponent={Link}
      pages={pages}
      currentPage={current}
      pagesExtra={
        <SearchNavItem
          number={`${String(pages.length).padStart(2, "0")}.`}
          site="root"
          locale={locale}
          current={current === searchHref}
          linkComponent={Link}
        />
      }
    >
      {children}
    </Shell>
  );
}
