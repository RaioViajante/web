import assert from "node:assert/strict";
import { test } from "node:test";
import { documentRoutes, updatedAt } from "../src/lib/identity.ts";

const english = { id: "projects/tool", contentId: "tool", locale: "en", originalLocale: "en", path: "/projects/tool/" };
const portuguese = { id: "pt/projects/tool", contentId: "tool", locale: "pt-BR", originalLocale: "en", path: "/pt/projetos/ferramenta/" };
const onlyEnglish = { id: "projects/other", contentId: "other", locale: "en", originalLocale: "en", path: "/projects/other/" };
const onlyPortuguese = { id: "pt/projects/new", contentId: "new", locale: "pt-BR", originalLocale: "pt-BR", path: "/pt/projetos/novo/" };

test("counterparts use identity, not matching paths or filenames", () => {
	const routes = documentRoutes([english, portuguese, onlyEnglish, onlyPortuguese]);
	assert.deepEqual(routes.map((route) => route.counterparts), [
		[{ locale: "pt-BR", path: portuguese.path }], [{ locale: "en", path: english.path }], [], [],
	]);
});

test("a withdrawn original retains nonpublic provenance without an invented counterpart", () => {
	assert.deepEqual(documentRoutes([portuguese], [english]), [{ locale: "pt-BR", path: portuguese.path, counterparts: [] }]);
});

test("optional updatedAt belongs to each version; no Git or publication date is inferred", () => {
	assert.equal(updatedAt(english), undefined);
	assert.equal(updatedAt({ ...english, lastUpdated: "2026-08-01" }), "2026-08-01");
	assert.equal(updatedAt({ ...portuguese, lastUpdated: "2026-10-01" }), "2026-10-01");
});

test("invalid identities and reserved or misplaced paths fail the build", () => {
	assert.throws(() => documentRoutes([english, english]), /Duplicate document identity/);
	assert.throws(() => documentRoutes([portuguese]), /Missing original/);
	assert.throws(() => documentRoutes([english, { ...portuguese, originalLocale: "pt-BR" }]), /Conflicting original locale/);
	assert.throws(() => documentRoutes([english, { ...onlyEnglish, path: english.path }]), /Duplicate or reserved/);
	assert.throws(() => documentRoutes([{ ...english, path: "/pt/" }]), /Locale\/path mismatch/);
	assert.throws(() => documentRoutes([{ ...english, path: "/search/" }]), /Duplicate or reserved/);
	assert.throws(() => documentRoutes([{ ...english, id: "pt/tool" }]), /Reserved English entry ID/);
	assert.throws(() => documentRoutes([{ ...portuguese, locale: "en", originalLocale: "en" }]), /Locale\/path mismatch/);
	assert.throws(() => documentRoutes([{ ...english, path: "/projects/tool" }]), /Invalid document path/);
});
