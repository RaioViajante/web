import type { ReactNode } from "react";
import { Shell } from "@raioviajante/design/shell";
import { DEFAULT_LOCALE, type LocaleId } from "../../../../site/locales";
import { SearchNavItem } from "@raioviajante/design/search";
import { experimentsFor, experimentPath } from "../data/experiments";
import { textFor } from "../lib/copy";

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
  return (
    <Shell
      site="lab"
      locale={locale}
      language={{
        search: current === (locale === "en" ? "/search/" : "/pt/search/"),
        counterpart,
      }}
      termsHref="/terms/"
      privacyHref="/privacy/"
      termsLocale="en"
      privacyLocale="en"
      pages={[
        {
          label: textFor(locale).experiments.toLowerCase(),
          href: locale === "en" ? "/" : "/pt/",
        },
        {
          label: textFor(locale).notebook.toLowerCase(),
          href: `${locale === "en" ? "/" : "/pt/"}#notebook`,
        },
      ]}
      currentPage={
        current === (locale === "en" ? "/search/" : "/pt/search/")
          ? undefined
          : current?.startsWith(`${locale === "en" ? "" : "/pt"}/experiments/`)
            ? locale === "en"
              ? "/"
              : "/pt/"
            : current
      }
      pagesExtra={
        <SearchNavItem
          number="02."
          site="lab"
          locale={locale}
          current={current === (locale === "en" ? "/search/" : "/pt/search/")}
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
