import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCALE_IDS, LOCALES } from "../../../site/locales.ts";
import { countedFor } from "../src/lib/plural-core.ts";
import { oneCountsFor } from "../src/lib/plural-lookup-build.ts";
import { pickForm } from "../src/lib/plural-lookup.ts";
import { placeholders } from "../src/lib/template.ts";
import { imageCompressionCopy } from "../src/lib/image-compression-copy.ts";
import {
  formatBytes,
  formatNumber,
  presets,
} from "../src/lib/image-compression.ts";

const leaves = (value, path = "") =>
  typeof value === "string"
    ? [[path, value]]
    : Object.entries(value).flatMap(([key, child]) =>
        leaves(child, path ? `${path}.${key}` : key),
      );
const withoutZero = ([path]) => !/\.none$/.test(path);

test("the catalog has the same keys and placeholders in both locales", () => {
  assert.deepEqual(
    Object.keys(imageCompressionCopy).sort(),
    [...LOCALE_IDS].sort(),
  );
  const en = leaves(imageCompressionCopy.en).filter(withoutZero);
  const pt = leaves(imageCompressionCopy["pt-BR"]).filter(withoutZero);
  assert.deepEqual(
    pt.map(([path]) => path),
    en.map(([path]) => path),
  );
  en.forEach(([path, value], i) =>
    assert.deepEqual(placeholders(pt[i][1]), placeholders(value), path),
  );
});

// Cognates, symbols and templates made only of values that read the same in Portuguese.
const sameInBothLanguages = [
  "dimensionsValue",
  "exactBytes.one",
  "exactBytes.other",
  "messages.loaded",
  "original",
  "resultHeaders.0",
  "resultHeaders.1",
  "zoom",
];

test("Portuguese strings are translated except tokens", () => {
  const pt = new Map(leaves(imageCompressionCopy["pt-BR"]));
  const same = leaves(imageCompressionCopy.en)
    .filter(([path, value]) => pt.get(path) === value)
    .map(([path]) => path);
  assert.deepEqual(same.sort(), sameInBothLanguages);
});

test("every load problem and preset has wording in both locales", () => {
  for (const locale of LOCALE_IDS) {
    const copy = imageCompressionCopy[locale];
    for (const reason of [
      "empty",
      "too-large",
      "not-an-image",
      "unsupported-type",
      "decode-failed",
      "too-many-pixels",
      "stale",
    ])
      assert.ok(
        copy.messages.problems[reason].length > 8,
        `${locale} ${reason}`,
      );
    for (const preset of presets)
      assert.ok(copy.presets[preset.id].hint.length > 8);
  }
});

test("exact byte counts agree with the plural rules and the locale's number format", () => {
  for (const locale of LOCALE_IDS) {
    const intl = LOCALES[locale].intlLocale;
    const one = oneCountsFor(intl, 10);
    const forms = imageCompressionCopy[locale].exactBytes;
    for (const n of [0, 1, 2, 5, 1000, 1234567]) {
      const display = formatNumber(n, intl);
      assert.equal(
        pickForm(forms, n, one, display),
        countedFor(intl, n, forms).replace(String(n), display),
        `${locale} ${n}`,
      );
    }
  }
  const en = imageCompressionCopy.en.exactBytes;
  assert.equal(pickForm(en, 1, oneCountsFor("en-US", 10), "1"), "1 byte");
  assert.equal(
    pickForm(en, 1234, oneCountsFor("en-US", 10), "1,234"),
    "1,234 bytes",
  );
  const pt = imageCompressionCopy["pt-BR"].exactBytes;
  assert.equal(pickForm(pt, 0, oneCountsFor("pt-BR", 10), "0"), "nenhum byte");
  assert.equal(
    pickForm(pt, 1234567, oneCountsFor("pt-BR", 10), "1.234.567"),
    "1.234.567 bytes",
  );
});

test("sizes read the same quantity in both locales with each locale's separators", () => {
  assert.equal(formatBytes(1_234_567, "en-US"), "1.2 MB");
  assert.equal(formatBytes(1_234_567, "pt-BR"), "1,2 MB");
});
