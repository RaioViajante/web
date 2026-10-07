/**
 * Pure navigation rules for documentation pages, kept free of `astro:content`
 * so Node tests can import them. Pages arrive in sidebar order (`order`); a
 * `sub` page is listed under the nearest top-level page before it.
 */
export interface NavPage {
	path: string;
	label: string;
	sub: boolean;
}

export interface Crumb {
	label: string;
	/** Absent for a folder without a page and for the current page. */
	href?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The index of the page a sub page is listed under, or `undefined`. */
export function parentIndex(pages: readonly NavPage[], index: number) {
	if (!pages[index]?.sub) return undefined;
	for (let i = index - 1; i >= 0; i -= 1) if (!pages[i]!.sub) return i;
	return undefined;
}

/** The sub pages listed under a top-level page, in order. */
export function childIndexes(pages: readonly NavPage[], index: number) {
	const children: number[] = [];
	if (pages[index]?.sub) return children;
	for (let i = index + 1; i < pages.length && pages[i]!.sub; i += 1) children.push(i);
	return children;
}

/**
 * Sidebar numbers after `00. index`: top-level pages `01.`, `02.`, … and the
 * sub pages under each `01.1`, `01.2`, … A sub page needs a page before it.
 */
export function navNumbers(pages: readonly NavPage[]) {
	let top = 0;
	let sub = 0;
	return pages.map((page) => {
		if (!page.sub) {
			top += 1;
			sub = 0;
			return `${pad(top)}.`;
		}
		if (top === 0) throw new Error(`Sub page ${page.path} has no page before it to be listed under`);
		sub += 1;
		return `${pad(top)}.${sub}`;
	});
}

/**
 * The visible breadcrumb after "docs": the page's folder (`projects`,
 * `raioviajante`; folders have no page of their own), the page it is listed
 * under as a link, then the page itself. Labels are the sidebar labels.
 */
export function breadcrumb(pages: readonly NavPage[], index: number, group: string): Crumb[] {
	const page = pages[index]!;
	const parent = parentIndex(pages, index);
	return [
		{ label: group },
		...(parent === undefined ? [] : [{ label: pages[parent]!.label, href: pages[parent]!.path }]),
		{ label: page.label },
	];
}
