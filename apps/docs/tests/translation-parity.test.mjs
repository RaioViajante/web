import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { copyFor } from "../src/lib/copy.ts";
import { formatDocDate } from "../src/lib/date.ts";

const content = fileURLToPath(new URL("../src/content/docs/", import.meta.url));

const files = (directory) =>
	readdirSync(directory).flatMap((name) => {
		const path = join(directory, name);
		return statSync(path).isDirectory() ? files(path) : name.endsWith(".md") ? [path] : [];
	});

function document(path) {
	const source = readFileSync(path, "utf8");
	const [, front, body] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source);
	const data = Object.fromEntries(
		[...front.matchAll(/^([A-Za-z]+): ?(.*)$/gm)].map(([, key, value]) => [key, value.trim()]),
	);
	return { path: relative(content, path), data, body };
}

const documents = files(content).map(document);
const byLocale = (locale) => documents.filter(({ data }) => data.locale === locale);

/** The structure a faithful translation keeps: it can read differently but not contain less. */
function shape(body) {
	const fences = [...body.matchAll(/^([ \t]*)```(\S*)([^\n]*)\n([\s\S]*?)\n\1```/gm)].map(([, , lang, info, code]) => ({
		lang,
		lines: code.split("\n").length,
		code,
		titled: /title="/.test(info),
	}));
	const prose = body.replace(/^([ \t]*)```[\s\S]*?\n\1```/gm, "");
	return {
		headings: [...prose.matchAll(/^(#{2,6}) /gm)].map(([, marks]) => marks.length),
		fences,
		callouts: [...prose.matchAll(/^:::(\w+)/gm)].map(([, kind]) => kind),
		tableRows: (prose.match(/^\|.*\|$/gm) ?? []).length,
		listItems: (prose.match(/^\s*(?:[-*]|\d+\.) /gm) ?? []).length,
		paragraphs: prose
			.split(/\n{2,}/)
			.filter((block) => block.trim() && !/^(#|\||:::|\s*(?:[-*]|\d+\.) )/.test(block.trim())).length,
		links: [...prose.matchAll(/\]\((https?:[^)\s]+)\)|href="(https?:[^"\s]+)"/g)].map(([, md, html]) => md ?? html),
	};
}

/** Links that deliberately point at the other language's own page. */
const localizedLinks = new Map([
	["https://lab.raioviajante.com/experiments/filename-classifier/", "https://lab.raioviajante.com/pt/experiments/classificador-de-arquivos/"],
]);

test("every English document has a Portuguese translation sharing its identity", () => {
	const english = byLocale("en");
	const portuguese = byLocale("pt-BR");
	assert.ok(english.length >= 4);
	assert.deepEqual(portuguese.map(({ data }) => data.contentId).sort(), english.map(({ data }) => data.contentId).sort());
	for (const translation of portuguese) {
		const original = english.find(({ data }) => data.contentId === translation.data.contentId);
		assert.ok(original, translation.path);
		assert.equal(translation.data.originalLocale, "en", translation.path);
		for (const key of ["order", "group", "sub", "source"])
			assert.equal(translation.data[key], original.data[key], `${translation.path}: ${key} follows the original`);
		assert.match(translation.data.path, /^\/pt\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/$/, translation.path);
		assert.equal(translation.data.lastUpdated, undefined, "no invented update date");
		assert.notEqual(translation.data.title === original.data.title && translation.data.description === original.data.description, true, `${translation.path}: description is translated`);
	}
});

test("a Portuguese document contains everything its original does", () => {
	for (const translation of byLocale("pt-BR")) {
		const original = byLocale("en").find(({ data }) => data.contentId === translation.data.contentId);
		const [a, b] = [shape(original.body), shape(translation.body)];
		const at = translation.path;
		assert.deepEqual(b.headings, a.headings, `${at}: headings`);
		assert.deepEqual(b.callouts, a.callouts, `${at}: callouts`);
		assert.equal(b.tableRows, a.tableRows, `${at}: table rows`);
		assert.equal(b.listItems, a.listItems, `${at}: list items`);
		assert.equal(b.paragraphs, a.paragraphs, `${at}: paragraphs`);
		assert.deepEqual(
			b.fences.map(({ lang, lines, titled }) => [lang, lines, titled]),
			a.fences.map(({ lang, lines, titled }) => [lang, lines, titled]),
			`${at}: code blocks`,
		);
		// Commands and configuration are code: they stay verbatim.
		a.fences.forEach((fence, index) => {
			if (["bash", "shell", "css"].includes(fence.lang)) assert.equal(b.fences[index].code, fence.code, `${at}: code block ${index + 1}`);
		});
		assert.deepEqual(
			b.links,
			a.links.map((url) => localizedLinks.get(url) ?? url),
			`${at}: links`,
		);
	}
});

test("Portuguese is not English left in place", () => {
	for (const translation of byLocale("pt-BR")) {
		const prose = translation.body.replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, "");
		assert.doesNotMatch(prose, /\b(?:the|and|which|when|that|is|are|with)\b/, `${translation.path}: stray English words`);
	}
});

test("the Docs catalog is complete in both locales", () => {
	const [en, pt] = [copyFor("en"), copyFor("pt-BR")];
	const keys = (value, prefix = "") =>
		Object.entries(value).flatMap(([key, child]) =>
			child && typeof child === "object" && !Array.isArray(child) ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`],
		);
	assert.deepEqual(keys(pt).sort(), keys(en).sort());
	for (const id of ["hum", "orbit", "yanawa"]) assert.ok(pt.home.external[id].summary && pt.home.external[id].status, id);
	assert.notEqual(pt.home.external.orbit.status, en.home.external.orbit.status);
});

test("dates read in the page's locale, in the same calendar day everywhere", () => {
	assert.equal(formatDocDate("2026-09-27", "en"), "September 27, 2026");
	assert.equal(formatDocDate("2026-09-27", "pt-BR"), "27 de setembro de 2026");
	assert.equal(formatDocDate("2026-01-01", "pt-BR"), "1 de janeiro de 2026");
	assert.throws(() => formatDocDate("27/09/2026", "pt-BR"), /ISO calendar date/);
	assert.throws(() => formatDocDate("2026-02-31", "en"), /Invalid calendar date|ISO/);
});
