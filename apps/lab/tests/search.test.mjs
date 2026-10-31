import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCALES, LOCALE_IDS } from "../../../site/locales.ts";
import { experimentsFor } from "../src/data/experiments.ts";
import { searchEntries, searchSuggestions } from "../src/lib/search.ts";

// The shared engine's one text rule (packages/design/search/locale.ts): lower
// case with the locale, decompose, drop combining marks. A result needs every
// word of the query in the title, description or body.
const normalize = (text, locale) =>
  text
    .toLocaleLowerCase(LOCALES[locale].intlLocale)
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
const hits = (entries, query, locale) => {
  const words = normalize(query.trim(), locale).split(/\s+/).filter(Boolean);
  return entries.filter((entry) => {
    const text = normalize(
      `${entry.title} ${entry.description} ${entry.body ?? ""}`,
      locale,
    );
    return words.every((word) => text.includes(word));
  });
};

test("each locale's index lists exactly its published experiments, in its own language", () => {
  for (const locale of LOCALE_IDS) {
    const entries = searchEntries(locale);
    assert.equal(entries.length, experimentsFor(locale).length);
    assert.deepEqual(
      entries.map((entry) => entry.contentId),
      ["006", "005", "004", "003", "002", "001"],
    );
    for (const entry of entries) {
      assert.equal(entry.locale, locale);
      assert.equal(entry.site, "lab");
      assert.ok(entry.href.startsWith("https://lab.raioviajante.com/"));
      assert.equal(entry.href.includes("/pt/"), locale === "pt-BR");
    }
  }
  const boot = searchEntries("pt-BR").find((e) => e.contentId === "003");
  assert.equal(boot.title, "setor de boot");
  assert.equal(boot.description, "x86-os-experiment · apenas código-fonte");
  // The English index keeps its original entry shape and raw fidelity key.
  assert.equal(
    searchEntries("en").find((e) => e.contentId === "003").description,
    "x86-os-experiment · source only",
  );
});

test("every Portuguese suggestion finds at least one published Portuguese experiment", () => {
  const suggestions = searchSuggestions["pt-BR"];
  const entries = searchEntries("pt-BR");
  for (const scope of ["site", "everywhere"]) {
    assert.ok(suggestions[scope].length >= 3, scope);
    assert.equal(new Set(suggestions[scope]).size, suggestions[scope].length);
    for (const term of suggestions[scope])
      assert.ok(
        hits(entries, term, "pt-BR").length >= 1,
        `"${term}" finds a Portuguese experiment (${scope})`,
      );
  }
  // Together they reach every experiment, so no published page is unreachable.
  const reached = new Set(
    suggestions.site.flatMap((term) =>
      hits(entries, term, "pt-BR").map((entry) => entry.contentId),
    ),
  );
  assert.deepEqual([...reached].sort(), [
    "001",
    "002",
    "003",
    "004",
    "005",
    "006",
  ]);
});

test("Portuguese search ignores accents and case like the shared engine", () => {
  const entries = searchEntries("pt-BR");
  assert.ok(
    hits(entries, "EXECUCAO", "pt-BR").some(
      (entry) => entry.contentId === "002",
    ),
  );
  assert.ok(
    hits(entries, "execução", "pt-BR").some(
      (entry) => entry.contentId === "002",
    ),
  );
  assert.equal(hits(entries, "bios", "pt-BR")[0].contentId, "003");
  assert.equal(hits(entries, "nothing-published", "pt-BR").length, 0);
});

test("the English suggestions are the shared defaults", () => {
  assert.equal(searchSuggestions.en, undefined);
});
