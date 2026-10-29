import type { ReactNode } from "react";
import { Shell } from "@raioviajante/design/shell";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type LocaleId,
} from "../../../../site/locales";
import { SearchNavItem } from "@raioviajante/design/search";
import { experimentsFor, experimentPath } from "../data/experiments";
import { textFor } from "../lib/copy";
import { routePath } from "../lib/routes";

export function LabFrame({
  current,
  locale = DEFAULT_LOCALE,
  counterpart,
  children,
}: {
  current?: string;
  locale?: LocaleId;
  counterpart?: string;
  children?: ReactNode;
}) {
  const text = textFor(locale);
  const home = routePath("home", locale);
  const onSearch = current === routePath("search", locale);
  const onExperiment = current?.startsWith(
    `${LOCALES[locale].urlPrefix}/experiments/`,
  );
  return (
    <Shell
      site="lab"
      locale={locale}
      language={{ search: onSearch, counterpart }}
      termsHref={routePath("terms", locale)}
      privacyHref={routePath("privacy", locale)}
      pages={[
        { label: text.nav.experiments, href: home },
        { label: text.nav.notebook, href: `${home}#notebook` },
      ]}
      currentPage={onSearch ? undefined : onExperiment ? home : current}
      pagesExtra={
        <SearchNavItem
          number="02."
          site="lab"
          locale={locale}
          current={onSearch}
        />
      }
      experiments={[...experimentsFor(locale)].reverse().map((e) => ({
        number: e.id,
        label: e.title,
        href: experimentPath(e),
      }))}
      currentExperiment={current}
    >
      {children}
    </Shell>
  );
}
