import Link from "next/link";
import type { ReactNode } from "react";
import { Shell, type NavItem } from "@raioviajante/design/shell";
import { DEFAULT_LOCALE, type LocaleId } from "../../../site/locales";
import { SearchNavItem } from "@raioviajante/design/search";
import { dumpCopy } from "@/lib/copy";
import { counterpartsOf, routeOfPath, routes } from "@/lib/routes";

function navigation(locale: LocaleId): NavItem[] {
  const { shell } = dumpCopy(locale);
  return [
    { label: shell.posts, href: routes.home[locale]! },
    { label: shell.archive, href: routes.archive[locale]! },
    { label: shell.tags, href: routes.tags[locale]! },
  ];
}

/**
 * The shared shell with dump's pages. `current` selects the navigation item;
 * `languagePath` is the actual content path when it differs from that item.
 * Only an ordinary route can infer a counterpart from the route registry.
 */
export function DumpShell({
  current,
  languagePath,
  locale = DEFAULT_LOCALE,
  counterpart,
  toc,
  children,
}: {
  current?: string;
  languagePath?: string;
  locale?: LocaleId;
  counterpart?: string;
  toc?: NavItem[];
  children: ReactNode;
}) {
  const pages = navigation(locale);
  const route = routeOfPath(languagePath ?? current ?? "");
  const staticCounterpart = route
    ? counterpartsOf(route.key, locale)[0]?.path
    : undefined;
  const searchHref = routes.search[locale]!;
  return (
    <Shell
      site="dump"
      locale={locale}
      language={{
        search: current === searchHref,
        ...((counterpart ?? staticCounterpart)
          ? { counterpart: counterpart ?? staticCounterpart }
          : {}),
      }}
      termsHref={routes.terms[locale] ?? routes.terms[DEFAULT_LOCALE]}
      privacyHref={routes.privacy[locale] ?? routes.privacy[DEFAULT_LOCALE]}
      termsLocale={routes.terms[locale] ? locale : DEFAULT_LOCALE}
      privacyLocale={routes.privacy[locale] ? locale : DEFAULT_LOCALE}
      linkComponent={Link}
      pages={pages}
      currentPage={current}
      toc={toc}
      pagesExtra={
        <SearchNavItem
          number={`${String(pages.length).padStart(2, "0")}.`}
          site="dump"
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
