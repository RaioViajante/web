import { PageHeader } from "@raioviajante/design/parts";

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
	crumbs: string[];
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
						<span key={crumb}>
							{" / "}
							{index === crumbs.length - 1 ? <span aria-current="page">{crumb}</span> : crumb}
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
