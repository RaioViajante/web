import { PageHeader } from "@raioviajante/design/parts";
import type { Crumb } from "../lib/nav";
import type { LocaleId } from "../../../../site/locales";
import { localizedPath } from "../../../../site/locales";
import { copyFor } from "../lib/copy";

/** The header of a documentation page: breadcrumb, title, one line, meta row. */
export function DocHeader({
	crumbs,
	title,
	line,
	status,
	meta,
	source,
    locale = "en",
}: {
	/** Breadcrumb after "docs"; the last one is the current page. */
	crumbs: Crumb[];
	title: string;
	line: string;
	status: string;
	meta: string[];
	source?: string;
    locale?: LocaleId;
}) {
	return (
		<PageHeader
			label={
				<>
					<a data-testid="content-link" href={localizedPath("docs", locale, "/")}>docs</a>
					{crumbs.map((crumb, index) => (
						<span key={`${index}-${crumb.label}`}>
							{" / "}
							{index === crumbs.length - 1 ? (
								<span aria-current="page">{crumb.label}</span>
							) : crumb.href ? (
								<a data-testid="content-link" href={crumb.href}>{crumb.label}</a>
							) : (
								crumb.label
							)}
						</span>
					))}
				</>
			}
			title={title}
			line={line}
			meta={[
				status,
				...meta,
				...(source ? [<a data-testid="content-link" key="source" href={source}>{copyFor(locale).source} ↗</a>] : []),
			]}
		/>
	);
}
