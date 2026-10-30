import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCALE_IDS } from "../../../site/locales.ts";
import { counted, pluralCategory, zeroReadsAsOne } from "../src/lib/plural.ts";
import {
  experimentCount,
  experimentForms,
} from "../src/lib/experiment-count.ts";
import { classifierCopy } from "../src/lib/bench-copy.ts";
import {
  classifierCategories,
  emptyCounts,
  summaryParts,
  categoryParts,
} from "../src/lib/classifier-view.ts";
import { fill, placeholders } from "../src/lib/template.ts";

const counts = [0, 1, 2, 3, 5, 11, 21, 100, 101, 1000];

test("the grammatical category follows CLDR for the registry's Intl locale", () => {
  // en: 1 is "one"; pt-BR: 0 and 1 are "one" (so zero needs its own wording).
  assert.deepEqual(
    counts.map((count) => pluralCategory("en", count)),
    [
      "other",
      "one",
      "other",
      "other",
      "other",
      "other",
      "other",
      "other",
      "other",
      "other",
    ],
  );
  assert.deepEqual(
    counts.map((count) => pluralCategory("pt-BR", count)),
    [
      "one",
      "one",
      "other",
      "other",
      "other",
      "other",
      "other",
      "other",
      "other",
      "other",
    ],
  );
  assert.equal(zeroReadsAsOne("en"), false);
  assert.equal(zeroReadsAsOne("pt-BR"), true);
});

test("counted phrases agree with the number: 0, 1, 2, 5, 11, 21, 100 in both locales", () => {
  const expected = {
    en: {
      experiments: [
        "0 experiments",
        "1 experiment",
        "2 experiments",
        "5 experiments",
        "11 experiments",
        "21 experiments",
        "100 experiments",
      ],
      summary: [
        "0 files classified",
        "1 file classified",
        "2 files classified",
        "5 files classified",
        "11 files classified",
        "21 files classified",
        "100 files classified",
      ],
    },
    "pt-BR": {
      experiments: [
        "nenhum experimento",
        "1 experimento",
        "2 experimentos",
        "5 experimentos",
        "11 experimentos",
        "21 experimentos",
        "100 experimentos",
      ],
      summary: [
        "nenhum arquivo classificado",
        "1 arquivo classificado",
        "2 arquivos classificados",
        "5 arquivos classificados",
        "11 arquivos classificados",
        "21 arquivos classificados",
        "100 arquivos classificados",
      ],
    },
  };
  for (const locale of LOCALE_IDS) {
    const values = [0, 1, 2, 5, 11, 21, 100];
    assert.deepEqual(
      values.map((count) => experimentCount(locale, count)),
      expected[locale].experiments,
    );
    assert.deepEqual(
      values.map((count) =>
        counted(locale, count, classifierCopy[locale].summary),
      ),
      expected[locale].summary,
    );
  }
});

test("every counted phrase gives zero its own wording where CLDR files zero under one", () => {
  for (const locale of LOCALE_IDS) {
    for (const forms of [
      classifierCopy[locale].summary,
      experimentForms(locale),
    ]) {
      assert.match(forms.one, /\{count\}/);
      assert.match(forms.other, /\{count\}/);
      if (zeroReadsAsOne(locale)) {
        assert.ok(
          Reflect.get(forms, "none"),
          `${locale} needs a zero sentence for ${forms.one}`,
        );
        // Said in words, never a number followed by the singular noun.
        assert.doesNotMatch(counted(locale, 0, forms), /\b0 /);
      }
    }
  }
});

test("counts must be whole, non-negative numbers", () => {
  for (const bad of [-1, 1.5, 0.5, Number.NaN])
    assert.throws(
      () => counted("en", bad, { one: "{count} a", other: "{count} b" }),
      RangeError,
    );
  assert.equal(
    counted("pt-BR", 1, { one: "{count} a", other: "{count} b" }),
    "1 a",
  );
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
    "nenhum arquivo classificado · Images 0 · Documents 0 · Archives 0 · Other 0",
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
