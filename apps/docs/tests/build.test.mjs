import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

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
	assert.ok(ptEntries.every(({ locale, href, contentId }) => locale === "pt-BR" && href.startsWith("https://docs.raioviajante.com/pt/projetos/sweep/") && contentId === "projects/sweep"));
	assert.ok(entries.some(({ href }) => href.endsWith("/projects/sweep/cli/")));
	assert.ok(!ptEntries.some(({ href }) => href.includes("/cli/")));
	const en = readFileSync(join(outDir, "projects/sweep/index.html"), "utf8");
	const enHome = readFileSync(join(outDir, "index.html"), "utf8");
	const untranslated = readFileSync(join(outDir, "projects/sweep/cli/index.html"), "utf8");
	const pt = readFileSync(join(outDir, "pt/projetos/sweep/index.html"), "utf8");
	const home = readFileSync(join(outDir, "pt/index.html"), "utf8");
	const missing = readFileSync(join(outDir, "404.html"), "utf8");
	assert.match(en, /<html lang="en">/);
	assert.doesNotMatch(enHome, /<a[^>]*href="\/pt\/projetos\/sweep\/"/);
	assert.match(pt, /<html lang="pt-BR">/);
	assert.match(pt, /<link rel="canonical" href="https:\/\/docs\.raioviajante\.com\/pt\/projetos\/sweep\/">/);
	assert.match(pt, /hreflang="en" href="https:\/\/docs\.raioviajante\.com\/projects\/sweep\/"/);
	assert.match(en, /hreflang="pt-BR" href="https:\/\/docs\.raioviajante\.com\/pt\/projetos\/sweep\/"/);
	assert.match(pt, /"inLanguage":"pt-BR"/);
	assert.match(pt, /"@type":"BreadcrumbList"/);
	assert.match(pt, /"name":"docs","item":"https:\/\/docs\.raioviajante\.com\/pt\/"/);
	assert.doesNotMatch(pt, /"dateModified"|"datePublished"|href="\/projects\/sweep\/cli\/"/);
	assert.doesNotMatch(pt, /<a[^>]*href="\/pt\/projects\/sweep\/cli\/"/);
	assert.match(home, /href="\/pt\/projetos\/sweep\/"/);
	assert.doesNotMatch(home, /href="\/projects\/sweep\/cli\/"/);
	assert.match(home, /data-lang-state="link"/);
	assert.match(home, /LANG<!-- --> <span lang="pt-BR">PT<\/span>/);
	assert.match(home, /<a data-testid="language-counterpart" href="\/" lang="en" hrefLang="en"[^>]*>English<\/a>/);
	assert.match(enHome, /<a data-testid="language-counterpart" href="\/pt\/" lang="pt-BR" hrefLang="pt-BR"[^>]*>Português \(Brasil\)<\/a>/);
	assert.match(en, /<a data-testid="language-counterpart" href="\/pt\/projetos\/sweep\/" lang="pt-BR"/);
	assert.match(untranslated, /data-lang-state="disclosure"/);
	assert.match(untranslated, /href="\/pt\/" hrefLang="pt-BR"/);
	assert.doesNotMatch(untranslated, /href="\/pt\/projects\/sweep\/cli\/"|hreflang="pt-BR"/);
	assert.match(missing, /<html lang="en">/);
	assert.match(missing, /name="robots" content="noindex, follow"/);
	assert.doesNotMatch(missing, /rel="canonical"|rel="alternate"/);
	const sitemap = readFileSync(join(outDir, "sitemap.xml"), "utf8");
	for (const path of ["/", "/projects/sweep/", "/projects/sweep/cli/", "/raioviajante/design-language/", "/raioviajante/repository-conventions/", "/pt/", "/pt/projetos/sweep/"]) {
		assert.ok(sitemap.includes(`<loc>https://docs.raioviajante.com${path}</loc>`), path);
	}
	assert.doesNotMatch(sitemap, /<lastmod>|\/search\/|\/404\/|\/pt\/projects\/sweep\/cli\//);
	for (const path of ["index.html", "search/index.html", "search-index.json", "projetos/sweep/index.html"]) {
		assert.ok(existsSync(join(outDir, "pt", path)), `declared Portuguese route ${path} was built`);
	}
	for (const path of ["projects/sweep/cli/index.html", "raioviajante/design-language/index.html"]) {
		assert.ok(!existsSync(join(outDir, "pt", path)), `untranslated English route ${path} was not built`);
	}
	const pageFiles = (directory, prefix = "") => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const relative = prefix + entry.name;
		return entry.isDirectory() ? pageFiles(join(directory, entry.name), `${relative}/`) : entry.name === "index.html" ? [relative] : [];
	});
	assert.deepEqual(pageFiles(join(outDir, "pt")).sort(), ["index.html", "projetos/sweep/index.html", "search/index.html"]);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
