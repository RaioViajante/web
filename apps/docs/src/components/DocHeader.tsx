import { PageHeader } from "@raioviajante/design/parts";
import type { Crumb } from "../lib/nav";

/** The header of a documentation page: breadcrumb, title, one line, meta row. */
export function DocHeader({
	crumbs,
	title,
	line,
	status,
	meta,
	source,
}: {
	/** Breadcrumb after "docs"; the last one is the current page. */
	crumbs: Crumb[];
	title: string;
	line: string;
	status: string;
	meta: string[];
	source?: string;
}) {
	return (
		<PageHeader
			label={
				<>
					<a href="/">docs</a>
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
				...(source ? [<a key="source" href={source}>source ↗</a>] : []),
			]}
		/>
	);
}
