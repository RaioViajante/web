import type { ReactNode } from "react";
import { Shell, type NavItem } from "@raioviajante/design/shell";
import { DEFAULT_LOCALE, localizedPath, type LocaleId } from "../../../../site/locales";
import { SearchNavItem } from "@raioviajante/design/search";

/** The shared shell with docs' pages. Rendered statically; nothing hydrates. */
export function DocsFrame({
	pages,
	current,
	toc,
	searchNumber,
	children,
	locale = DEFAULT_LOCALE,
	counterpart,
}: {
	pages: NavItem[];
	current?: string;
	toc?: NavItem[];
	searchNumber: string;
	children?: ReactNode;
	locale?: LocaleId;
	counterpart?: string;
}) {
	return (
		<Shell
			termsHref={localizedPath("docs", locale, "/terms/")}
			privacyHref={localizedPath("docs", locale, "/privacy/")}
			termsLocale={locale}
			privacyLocale={locale}
			site="docs"
			locale={locale}
			language={{ search: current === localizedPath("docs", locale, "/search/"), counterpart }}
			pages={pages}
			currentPage={current}
			toc={toc}
			pagesExtra={<SearchNavItem number={searchNumber} site="docs" locale={locale} current={current === localizedPath("docs", locale, "/search/")} />}
		>
			{children}
		</Shell>
	);
}
