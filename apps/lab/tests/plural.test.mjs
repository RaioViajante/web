import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCALE_IDS } from "../../../site/locales.ts";
import { counted, pluralCategory } from "../src/lib/plural.ts";
import { classifierCopy } from "../src/lib/bench-copy.ts";
import {
  classifierCategories,
  emptyCounts,
  summaryParts,
  categoryParts,
} from "../src/lib/classifier-view.ts";
import { fill, placeholders } from "../src/lib/template.ts";

test("zero takes the plural and exactly one takes the singular, in every locale", () => {
  for (const locale of LOCALE_IDS) {
    assert.equal(pluralCategory(locale, 0), "other");
    assert.equal(pluralCategory(locale, 1), "one");
    assert.equal(pluralCategory(locale, 2), "other");
    assert.equal(pluralCategory(locale, 21), "other");
  }
  assert.equal(counted("pt-BR", 1, { one: "a", other: "b" }), "1 a");
});

const sentence = (locale, total, counts = emptyCounts()) =>
  summaryParts(locale, total, counts, classifierCopy[locale].summary)
    .map(({ text }) => text)
    .join("");

test("the classifier summary agrees with the count in both locales", () => {
  assert.equal(
    sentence("en", 0),
    "0 files classified · Images 0 · Documents 0 · Archives 0 · Other 0",
  );
  assert.equal(
    sentence("en", 1, { ...emptyCounts(), Other: 1 }),
    "1 file classified · Images 0 · Documents 0 · Archives 0 · Other 1",
  );
  assert.equal(
    sentence("en", 2),
    "2 files classified · Images 0 · Documents 0 · Archives 0 · Other 0",
  );
  assert.equal(
    sentence("pt-BR", 0),
    "0 arquivos classificados · Images 0 · Documents 0 · Archives 0 · Other 0",
  );
  assert.equal(
    sentence("pt-BR", 1, { ...emptyCounts(), Images: 1 }),
    "1 arquivo classificado · Images 1 · Documents 0 · Archives 0 · Other 0",
  );
  assert.equal(
    sentence("pt-BR", 5, { Images: 1, Documents: 1, Archives: 1, Other: 2 }),
    "5 arquivos classificados · Images 1 · Documents 1 · Archives 1 · Other 2",
  );
});

test("the real category values stay visible, flagged as English in Portuguese only", () => {
  const pt = summaryParts(
    "pt-BR",
    2,
    emptyCounts(),
    classifierCopy["pt-BR"].summary,
    "en",
  );
  assert.deepEqual(
    pt.filter((part) => part.lang).map((part) => part.text),
    [...classifierCategories],
  );
  const plain = summaryParts("en", 2, emptyCounts(), classifierCopy.en.summary);
  assert.ok(plain.every((part) => part.lang === undefined));
  // The cell shows the program's value first; the gloss is clearly secondary.
  assert.deepEqual(
    categoryParts("Images", classifierCopy["pt-BR"].categoryGloss.Images, "en"),
    [{ text: "Images", lang: "en" }, { text: " (imagens)" }],
  );
  assert.deepEqual(categoryParts("Images", null), [
    { text: "Images", lang: undefined },
  ]);
});

test("templates fill every placeholder and refuse unknown ones", () => {
  assert.equal(fill("{a} → {b}", { a: 1, b: "x" }), "1 → x");
  assert.throws(() => fill("{a} {c}", { a: 1 }), /Missing value for \{c\}/);
  assert.deepEqual(placeholders("{b} and {a}"), ["a", "b"]);
});
