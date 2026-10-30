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
	updated,
	source,
	locale,
}: {
	/** Breadcrumb after "docs"; the last one is the current page. */
	crumbs: Crumb[];
	title: string;
	line: string;
	status: string;
	meta: string[];
	/** The page's explicit update date, already formatted for the locale. */
	updated?: { iso: string; text: string };
	source?: string;
	locale: LocaleId;
}) {
	return (
		<PageHeader
			label={
				<>
					<a href={localizedPath("docs", locale, "/")}>docs</a>
					{crumbs.map((crumb, index) => (
						<span key={`${index}-${crumb.label}`}>
							{" / "}
							{index === crumbs.length - 1 ? (
								<span aria-current="page">{crumb.label}</span>
							) : crumb.href ? (
								<a href={crumb.href}>{crumb.label}</a>
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
				...(updated
					? [
							<span key="updated">
								{copyFor(locale).updated} <time dateTime={updated.iso}>{updated.text}</time>
							</span>,
						]
					: []),
				...(source ? [<a key="source" href={source}>{copyFor(locale).source} ↗</a>] : []),
			]}
		/>
	);
}
