import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { copyFor } from "../src/lib/copy.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

// CI and Vercel always build with an empty content store, which renders every
// Markdown file through Astro's Vite module runner. A warm local store skips
// that path, so remove it and build for real into a throwaway directory.
test("a cold-cache production build keeps semantic headings in the search index", () => {
  rmSync(join(root, "node_modules/.astro/data-store.json"), { force: true });
  const outDir = mkdtempSync(join(tmpdir(), "docs-build-"));
  try {
    const build = spawnSync(
      join(root, "node_modules/.bin/astro"),
      ["build", "--outDir", outDir],
      { cwd: root, encoding: "utf8" },
    );
    const output = `${build.stdout}\n${build.stderr}`;
    assert.equal(build.status, 0, output);
    assert.doesNotMatch(output, /module runner has been closed/i);

    const entries = JSON.parse(readFileSync(join(outDir, "search-index.json"), "utf8"));
    const section = entries.find(
      ({ href, description }) => description === "Sweep" && href.endsWith("/projects/sweep/#classification"),
    );
    assert.equal(section?.title, "Classification");
    assert.ok(entries.every(({ title }) => !/^\d{2}\./.test(title)), "no numbered titles");
    assert.ok(entries.length > 0);
    assert.ok(entries.every(({ locale }) => locale === "en"), "every entry states the English locale id");
	const ptEntries = JSON.parse(readFileSync(join(outDir, "pt/search-index.json"), "utf8"));
	assert.ok(ptEntries.length > 1);
	const ptHome = "https://docs.raioviajante.com/pt/";
	assert.ok(ptEntries.every(({ locale, href }) => locale === "pt-BR" && href.startsWith(ptHome)));
	assert.deepEqual(
		[...new Set(ptEntries.map(({ contentId }) => contentId))].sort(),
		["projects/sweep", "projects/sweep/cli", "raioviajante/design-language", "raioviajante/repository-conventions"],
		"every English document is searchable in Portuguese",
	);
	assert.ok(entries.some(({ href }) => href.endsWith("/projects/sweep/cli/")));
	assert.ok(ptEntries.some(({ href }) => href.endsWith("/pt/projetos/sweep/cli/")));
	const pageFiles = (directory, prefix = "") => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const relative = prefix + entry.name;
		return entry.isDirectory() ? pageFiles(join(directory, entry.name), `${relative}/`) : entry.name === "index.html" ? [relative] : [];
	});
	const read = (path) => readFileSync(join(outDir, path), "utf8");
	const en = read("projects/sweep/index.html");
	const enHome = read("index.html");
	const pt = read("pt/projetos/sweep/index.html");
	const home = read("pt/index.html");
	const missing = read("404.html");
	assert.match(en, /<html lang="en">/);
	assert.doesNotMatch(enHome, /<a href="\/pt\/projetos\/sweep\/"/);
	assert.match(pt, /<html lang="pt-BR">/);
	assert.match(pt, /<link rel="canonical" href="https:\/\/docs\.raioviajante\.com\/pt\/projetos\/sweep\/">/);
	assert.match(pt, /hreflang="en" href="https:\/\/docs\.raioviajante\.com\/projects\/sweep\/"/);
	assert.match(en, /hreflang="pt-BR" href="https:\/\/docs\.raioviajante\.com\/pt\/projetos\/sweep\/"/);
	assert.match(pt, /"inLanguage":"pt-BR"/);
	assert.match(pt, /"@type":"BreadcrumbList"/);
	assert.match(pt, /"name":"docs","item":"https:\/\/docs\.raioviajante\.com\/pt\/"/);
	assert.doesNotMatch(pt, /"dateModified"|"datePublished"/);
	assert.match(home, /data-lang-state="link"/);
	assert.match(home, /<span class="rv-utility__label">LANG<\/span>(?:<!-- -->)? <span class="rv-utility__value" lang="pt-BR">PT<\/span>/);
	// The accessible name begins with the visible text (WCAG 2.5.3).
	assert.match(home, /<a href="\/" hrefLang="en" aria-label="LANG PT — Idioma: Português \(Brasil\)\. Mudar para inglês\."/);
	assert.match(enHome, /<a href="\/pt\/" hrefLang="pt-BR" aria-label="LANG EN — Language: English\. Switch to Portuguese\."/);
	assert.match(en, /<a href="\/pt\/projetos\/sweep\/" hrefLang="pt-BR"/);
	assert.match(missing, /<html lang="en">/);
	assert.match(missing, /name="robots" content="noindex, follow"/);
	assert.doesNotMatch(missing, /rel="canonical"|rel="alternate"/);

	// Every English document has a Portuguese counterpart at its declared path,
	// and each pair links to the other through hreflang and LANG.
	const pairs = [
		["projects/sweep", "pt/projetos/sweep"],
		["projects/sweep/cli", "pt/projetos/sweep/cli"],
		["raioviajante/design-language", "pt/raioviajante/linguagem-de-design"],
		["raioviajante/repository-conventions", "pt/raioviajante/convencoes-de-repositorio"],
		["terms", "pt/terms"],
		["privacy", "pt/privacy"],
		["", "pt"],
		["search", "pt/search"],
	];
	for (const [enPath, ptPath] of pairs) {
		const enHtml = read(join(enPath, "index.html"));
		const ptHtml = read(join(ptPath, "index.html"));
		const enUrl = `https://docs.raioviajante.com/${enPath ? `${enPath}/` : ""}`;
		const ptUrl = `https://docs.raioviajante.com/${ptPath}/`;
		assert.match(enHtml, /<html lang="en">/, enPath);
		assert.match(ptHtml, /<html lang="pt-BR">/, ptPath);
		for (const html of [enHtml, ptHtml]) {
			assert.ok(html.includes(`<link rel="alternate" hreflang="en" href="${enUrl}">`), `${ptPath} hreflang en`);
			assert.ok(html.includes(`<link rel="alternate" hreflang="pt-BR" href="${ptUrl}">`), `${ptPath} hreflang pt-BR`);
			assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${enUrl}">`), `${ptPath} x-default`);
		}
		assert.ok(ptHtml.includes(`<link rel="canonical" href="${ptUrl}">`), `${ptPath} canonical`);
		assert.match(ptHtml, /data-lang-state="link"/, ptPath);
		assert.match(enHtml, /data-lang-state="link"/, enPath);
		assert.match(ptHtml, /property="og:locale" content="pt_BR"/, ptPath);
		assert.ok(existsSync(join(outDir, "og", `${ptPath}.png`)), `${ptPath} social card was built`);
		assert.ok(ptHtml.includes(`<meta property="og:image" content="https://docs.raioviajante.com/og/${ptPath}.png">`), `${ptPath} og:image is its own card`);
	}

	// No English control, label or footer qualifier on a Portuguese page.
	const ptPages = pairs.map(([, ptPath]) => [ptPath, read(join(ptPath, "index.html"))]);
	for (const [path, html] of ptPages) {
		assert.doesNotMatch(html, />copy<|>copy commands<|aria-label="Files"|show all \d+ lines|aria-label="Footnotes"|>(?:Note|Important|Warning|Deprecated|Careful)</, `${path}: English block UI`);
		assert.doesNotMatch(html, /\(em inglês\)|\(in English\)/, `${path}: legal links need no qualifier`);
		assert.match(html, /href="\/pt\/terms\/"[^>]*>Termos de Uso</, `${path}: Portuguese Terms in the footer`);
		assert.match(html, /href="\/pt\/privacy\/"[^>]*>Política de Privacidade</, `${path}: Portuguese Privacy in the footer`);
	}
	for (const path of ["pt/projetos/sweep", "pt/projetos/sweep/cli", "pt/raioviajante/linguagem-de-design"]) {
		const html = read(join(path, "index.html"));
		assert.match(html, /<button type="button" class="block__copy">copiar<\/button>/, path);
	}
	// A Portuguese page that sends the reader to English content says so in
	// words and carries hreflang (docs/i18n.md, "Cross-language related links").
	const siblingAnchor = /<a\b([^>]*?)href="https:\/\/(?:dump|lab)\.raioviajante\.com(\/[^"]*)"([^>]*)>/g;
	for (const [path, html] of ptPages)
		for (const match of html.matchAll(siblingAnchor)) {
			const [, before, target, after] = match;
			if (/^\/pt(\/|$)/.test(target)) continue;
			assert.match(`${before}${after}`, /hreflang="en"/i, `${path}: ${target} is English and needs hreflang`);
			// The words "em inglês" sit in the link or in the row/item note that follows it.
			const item = html.slice(match.index).split(/<\/(?:div|li)>/)[0];
			assert.match(item, /em inglês/, `${path}: ${target} says it is in English`);
		}
	// The Dump posts a Portuguese page links are the Portuguese versions: the
	// home note for yanawa.
	const ptDumpPosts = ["comecei-a-projetar-uma-linguagem-antes-de-conseguir-compilar-uma"];
	const linkedDump = ptPages.flatMap(([, html]) => [...html.matchAll(/href="https:\/\/dump\.raioviajante\.com(\/[^"]*)"/g)].map(([, path]) => path));
	for (const slug of ptDumpPosts) assert.ok(linkedDump.includes(`/pt/posts/${slug}`), `a Portuguese page links /pt/posts/${slug}`);
	assert.ok(!linkedDump.some((path) => path.startsWith("/posts/")), "no Portuguese page links an English Dump post");
	assert.doesNotMatch(read("pt/index.html"), /dump, em inglês/);
	// Four retired Dump articles are linked from no page, in either language.
	const retiredDump = /building-orbit|cansei-de-crud|apparently-moving-a-file|aparentemente-mover|an-execution-is-more-than|uma-execucao-e-mais|a-toml-file-changed|um-arquivo-toml/;
	for (const [path, html] of [...ptPages, ...pairs.map(([enPath]) => [enPath, read(join(enPath, "index.html"))])]) assert.doesNotMatch(html, retiredDump, `${path} links no retired Dump article`);
	// Privacy, Search: the site's own host may receive `q` through the LANG link, so
	// the sentence says only that nothing is sent to the other sites.
	assert.match(read("privacy/index.html"), /what you type is not sent to those sites/);
	assert.match(read("pt/privacy/index.html"), /o que você digita não é enviado a esses sites/);
	for (const path of ["privacy/index.html", "pt/privacy/index.html"])
		assert.doesNotMatch(read(path), /sent anywhere|lugar nenhum/, path);
	assert.match(read("pt/terms/index.html"), /é a fonte de referência/);
	// English blocks keep their English words.
	assert.match(en, /<button type="button" class="block__copy">copy<\/button>/);

	// Portuguese navigation omits nothing that exists: the home lists every
	// document and every project, the sidebar numbers them like English.
	for (const href of ["/pt/projetos/sweep/", "/pt/raioviajante/linguagem-de-design/", "/pt/raioviajante/convencoes-de-repositorio/"]) {
		assert.ok(home.includes(`href="${href}"`), `Portuguese home lists ${href}`);
	}
	assert.match(home, /guia · referência da cli/);
	for (const row of ["hum", "orbit", "yanawa"]) assert.match(home, new RegExp(`<span>${row}</span>`), row);
	assert.equal((home.match(/ainda não documentado/g) ?? []).length, 2);
	assert.ok(home.includes('<h2><span class="rv-num" aria-hidden="true">01.</span>projetos/</h2>'), "projects section is 01.");
	assert.ok(home.includes('<h2><span class="rv-num" aria-hidden="true">02.</span>raioviajante/</h2>'), "raioviajante section is 02.");
	const homeEn = enHome;
	assert.equal(
		(home.match(/class="docs-entry"/g) ?? []).length,
		(homeEn.match(/class="docs-entry"/g) ?? []).length,
		"the Portuguese home lists as many entries as the English one",
	);
	const sidebar = (html) => [...html.matchAll(/<a href="([^"]+)"[^>]*><span class="rv-nav__num">([^<]+)<\/span>/g)].map(([, href, number]) => [href, number]);
	assert.deepEqual(sidebar(home).map(([, number]) => number), ["00.", "01.", "01.1", "02.", "03."]);
	assert.deepEqual(sidebar(home).map(([, number]) => number), sidebar(homeEn).map(([, number]) => number));
	assert.ok(home.includes('<span class="rv-search__num">04.</span><span>busca</span>'), "search follows the last page");
	const cli = read("pt/projetos/sweep/cli/index.html");
	assert.match(cli, /<span aria-current="page">referência da cli<\/span>/);
	assert.match(cli, /<a href="\/pt\/projetos\/sweep\/">sweep<\/a>/);
	assert.match(cli, /rel="prev"[^>]*>(?:<span class="rv-label">← Anterior<\/span>)<span>sweep<\/span>/);
	assert.match(cli, /rel="next"[^>]*>(?:<span class="rv-label">Próximo →<\/span>)<span>linguagem de design<\/span>/);

	// Dates are formatted in the page's locale, never printed raw.
	assert.doesNotMatch(read("pt/projetos/sweep/index.html"), /\d{4}-\d{2}-\d{2}(?!T)/);

	const sitemap = read("sitemap.xml");
	for (const path of [
		"/",
		"/projects/sweep/",
		"/projects/sweep/cli/",
		"/raioviajante/design-language/",
		"/raioviajante/repository-conventions/",
		"/terms/",
		"/privacy/",
		"/pt/",
		"/pt/projetos/sweep/",
		"/pt/projetos/sweep/cli/",
		"/pt/raioviajante/linguagem-de-design/",
		"/pt/raioviajante/convencoes-de-repositorio/",
		"/pt/terms/",
		"/pt/privacy/",
	]) {
		assert.ok(sitemap.includes(`<loc>https://docs.raioviajante.com${path}</loc>`), path);
	}
	assert.doesNotMatch(sitemap, /<lastmod>|\/search\/|\/404\/|\/pt\/projects\//);
	assert.deepEqual(
		pageFiles(join(outDir, "pt")).sort(),
		[
			"index.html",
			"privacy/index.html",
			"projetos/sweep/cli/index.html",
			"projetos/sweep/index.html",
			"raioviajante/convencoes-de-repositorio/index.html",
			"raioviajante/linguagem-de-design/index.html",
			"search/index.html",
			"terms/index.html",
		],
	);
	for (const path of ["index.html", "search/index.html", "search-index.json"]) {
		assert.ok(existsSync(join(outDir, "pt", path)), `declared Portuguese route ${path} was built`);
	}
	assert.ok(!existsSync(join(outDir, "pt", "projects")), "no English-structured path under /pt");

	// Every search suggestion must lead somewhere: it finds at least one entry
	// of the built index of its own locale (the shared engine's matching rule:
	// lower-cased with the locale, accents folded, every word present).
	const normalize = (text, intl) => text.toLocaleLowerCase(intl).normalize("NFD").replace(/\p{M}/gu, "");
	const finds = (index, term, intl) => {
		const words = normalize(term.trim(), intl).split(/\s+/).filter(Boolean);
		return index.filter((entry) => {
			const text = normalize(`${entry.title} ${entry.description} ${entry.body ?? ""}`, intl);
			return words.every((word) => text.includes(word));
		});
	};
	for (const [locale, index, intl] of [["en", entries, "en-US"], ["pt-BR", ptEntries, "pt-BR"]]) {
		const { site, everywhere } = copyFor(locale).search.suggestions;
		assert.ok(site.length >= 3 && new Set(site).size === site.length, `${locale}: distinct site suggestions`);
		for (const term of site)
			assert.ok(finds(index, term, intl).length > 0, `${locale}: site suggestion "${term}" has no hit in its built index`);
		// "Everywhere" also searches the other hosts, so only the Portuguese list is
		// expected to be answerable from this host alone; it is kept that way.
		if (locale === "pt-BR")
			for (const term of everywhere)
				assert.ok(finds(index, term, intl).length > 0, `${locale}: everywhere suggestion "${term}" has no hit in the Docs index`);
	}
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
