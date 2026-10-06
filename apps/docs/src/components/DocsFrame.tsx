import type { ReactNode } from "react";
import { Shell, type NavItem } from "@raioviajante/design/shell";
import { SearchNavItem } from "@raioviajante/design/search";

/** The shared shell with docs' pages. Rendered statically; nothing hydrates. */
export function DocsFrame({
	pages,
	current,
	toc,
	searchNumber,
	children,
}: {
	pages: NavItem[];
	current?: string;
	toc?: NavItem[];
	searchNumber: string;
	children?: ReactNode;
}) {
	return (
		<Shell
			site="docs"
			pages={pages}
			currentPage={current}
			toc={toc}
			pagesExtra={<SearchNavItem number={searchNumber} href="/search/" current={current === "/search/"} />}
		>
			{children}
		</Shell>
	);
}
