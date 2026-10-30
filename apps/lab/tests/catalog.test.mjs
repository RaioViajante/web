import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCALE_IDS } from "../../../site/locales.ts";
import { copy } from "../src/lib/copy.ts";
import {
  bootCopy,
  classifierCopy,
  executionCopy,
} from "../src/lib/bench-copy.ts";
import { bootText, sectionCode } from "../src/data/boot-sector.ts";
import { fidelityRows, relatedRows } from "../src/data/experiment-content.ts";
import { placeholders } from "../src/lib/template.ts";

const catalogs = { copy, classifierCopy, executionCopy, bootCopy, bootText };

/**
 * `none` is the optional zero wording of a counted phrase: Portuguese needs it
 * (CLDR files zero under "one"), English does not. plural.test.mjs enforces
 * exactly when it is required, so key parity skips it.
 */
const optionalZero = /(^|\.)summary\.none$/;

/** Every leaf of a catalog as `[path, value]`; functions and strings are leaves. */
function leaves(value, path = "") {
  if (typeof value === "string" || typeof value === "function")
    return [[path, value]];
  if (value === null || value === undefined) return [[path, value]];
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, path ? `${path}.${key}` : key),
  );
}

test("every catalog declares every locale with exactly the same keys", () => {
  for (const [name, catalog] of Object.entries(catalogs)) {
    assert.deepEqual(Object.keys(catalog).sort(), [...LOCALE_IDS].sort(), name);
    const [first, ...rest] = LOCALE_IDS.map((id) =>
      leaves(catalog[id])
        .map(([path]) => path)
        .filter((path) => !optionalZero.test(path)),
    );
    for (const other of rest) assert.deepEqual(other, first, name);
  }
  for (const table of [fidelityRows, relatedRows])
    for (const [surface, byLocale] of Object.entries(table)) {
      assert.deepEqual(Object.keys(byLocale).sort(), [...LOCALE_IDS].sort());
      // The published Portuguese 001 keeps the two Related rows it has always
      // had (the English page lists the two Dump posts as well).
      if (table === relatedRows && surface === "filename-classifier") continue;
      assert.equal(
        byLocale.en.length,
        byLocale["pt-BR"].length,
        `${surface} has the same number of rows in both locales`,
      );
    }
});

test("templates keep the same placeholders in every locale", () => {
  for (const name of ["executionCopy", "bootCopy", "classifierCopy"]) {
    const [en, pt] = LOCALE_IDS.map((id) =>
      leaves(catalogs[name][id]).filter(([path]) => !optionalZero.test(path)),
    );
    en.forEach(([path, value], index) => {
      if (typeof value !== "string") return;
      assert.deepEqual(
        placeholders(pt[index][1] ?? ""),
        placeholders(value),
        `${name}.${path}`,
      );
    });
  }
});

// Identical on purpose: the loanword link text and the pure-number template.
const sameInBothLanguages = ["bootCopy.assemblyLink", "bootCopy.progress"];

test("Portuguese strings are translated, not copied from English", () => {
  const identical = [];
  for (const [name, catalog] of Object.entries(catalogs)) {
    const [en, pt] = LOCALE_IDS.map((id) =>
      leaves(catalog[id]).filter(([path]) => !optionalZero.test(path)),
    );
    en.forEach(([path, value], index) => {
      // `{ code }` spans quote identifiers and are shared by design.
      if (typeof value !== "string" || path.endsWith(".code")) return;
      if (value === pt[index][1]) identical.push(`${name}.${path}`);
    });
  }
  assert.deepEqual(
    identical.filter((path) => !sameInBothLanguages.includes(path)),
    [],
  );
});

test("boot sections share one source and keep their technical tokens exact", () => {
  assert.equal(sectionCode.length, 5);
  for (const id of LOCALE_IDS) assert.equal(bootText[id].length, 5);
  const tokens = [
    "0x7C00",
    "0x10",
    "0x0E",
    "0xAA55",
    "55 AA",
    "NASM",
    "BIOS",
    "DS",
    "ES",
    "SS",
    "SP",
    "SI",
    "AX",
    "AH",
    "ENDL",
    "main",
    "org",
    "puts",
    "hlt",
    "lodsb",
  ];
  let checked = 0;
  bootText.en.forEach((section, index) => {
    for (const token of tokens) {
      if (!section.explanation.includes(token)) continue;
      checked++;
      assert.ok(
        bootText["pt-BR"][index].explanation.includes(token),
        `section ${index + 1} keeps ${token}`,
      );
    }
  });
  assert.ok(checked >= 20);
});

test("related rows point to the same destinations in both locales, except the localized docs page and the Portuguese printf post", () => {
  for (const [surface, byLocale] of Object.entries(relatedRows)) {
    if (surface === "filename-classifier") continue; // pinned in localization.test.mjs
    const hosts = (rows) => rows.map((row) => new URL(row.href).hostname);
    assert.deepEqual(hosts(byLocale["pt-BR"]), hosts(byLocale.en), surface);
    byLocale.en.forEach((row, index) => {
      const pt = byLocale["pt-BR"][index];
      if (new URL(row.href).hostname === "docs.raioviajante.com")
        assert.ok(pt.href.includes("/pt/"));
      else if (row.href.endsWith("/posts/there-is-no-printf-down-here"))
        assert.equal(
          pt.href,
          "https://dump.raioviajante.com/pt/posts/nao-existe-printf-aqui-embaixo",
        );
      else assert.equal(pt.href, row.href);
    });
  }
});
