import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCALE_IDS, LOCALES } from "../../../site/locales.ts";
import { countedFor } from "../src/lib/plural-core.ts";
import { oneCountsFor } from "../src/lib/plural-lookup-build.ts";
import { pickForm } from "../src/lib/plural-lookup.ts";
import { placeholders } from "../src/lib/template.ts";
import { analyze, execute } from "../src/lib/tiny-language.ts";
import { examples } from "../src/lib/tiny-language-examples.ts";
import { tinyLanguageCopy } from "../src/lib/tiny-language-copy.ts";
import { formatDiagnostic } from "../src/lib/tiny-language-view.ts";

const leaves = (value, path = "") =>
  typeof value === "string"
    ? [[path, value]]
    : Object.entries(value).flatMap(([key, child]) =>
        leaves(child, path ? `${path}.${key}` : key),
      );
const withoutZero = ([path]) => !/\.none$/.test(path);

test("the catalog has the same keys and placeholders in both locales", () => {
  assert.deepEqual(
    Object.keys(tinyLanguageCopy).sort(),
    [...LOCALE_IDS].sort(),
  );
  const en = leaves(tinyLanguageCopy.en).filter(withoutZero);
  const pt = leaves(tinyLanguageCopy["pt-BR"]).filter(withoutZero);
  assert.deepEqual(
    pt.map(([path]) => path),
    en.map(([path]) => path),
  );
  en.forEach(([path, value], i) =>
    assert.deepEqual(placeholders(pt[i][1]), placeholders(value), path),
  );
});

// Technical terms and language tags that read the same in Portuguese.
const sameInBothLanguages = [
  "concepts.0.term",
  "panels.tokens",
  "stageNames.parse",
  "tokenCount.one",
  "tokenCount.other",
  "tokenTypeLang",
];

test("Portuguese strings are translated except technical vocabulary", () => {
  const pt = new Map(leaves(tinyLanguageCopy["pt-BR"]));
  const same = leaves(tinyLanguageCopy.en)
    .filter(([path, value]) => pt.get(path) === value)
    .map(([path]) => path);
  assert.deepEqual(same.sort(), sameInBothLanguages);
});

test("every diagnostic code reads fully in both locales", () => {
  const args = {
    chars: 4000,
    lines: 200,
    char: "@",
    max: 12,
    expected: ":",
    found: "~newline",
    context: "parameter-name",
    what: "variable",
    name: "x",
    op: "+",
    left: "int",
    right: "str",
    type: "float",
    word: "if",
  };
  for (const locale of LOCALE_IDS) {
    const copy = tinyLanguageCopy[locale];
    for (const code of Object.keys(copy.diagnostics)) {
      const message = formatDiagnostic(copy, {
        stage: "parse",
        code,
        line: 1,
        column: 1,
        length: 1,
        args,
      });
      assert.doesNotMatch(message, /\{\w+\}/, `${locale} ${code}`);
      assert.ok(message.length > 8);
    }
  }
});

test("syntax errors read well in both languages", () => {
  const analysis = analyze("fn greet(name str):\n    print(name)\n");
  const [d] = analysis.diagnostics;
  assert.equal(
    formatDiagnostic(tinyLanguageCopy.en, d),
    "Expected `:` after the parameter name, found `str`.",
  );
  assert.equal(
    formatDiagnostic(tinyLanguageCopy["pt-BR"], d),
    "Esperava `:` depois do nome do parâmetro, mas encontrou `str`.",
  );
  const eol = analyze("print(1\n").diagnostics[0];
  assert.match(
    formatDiagnostic(tinyLanguageCopy.en, eol),
    /found the end of the line\./,
  );
  assert.match(
    formatDiagnostic(tinyLanguageCopy["pt-BR"], eol),
    /encontrou o fim da linha\./,
  );
  const name = analyze("let = 1\n").diagnostics[0];
  assert.equal(
    formatDiagnostic(tinyLanguageCopy.en, name),
    "Expected a name for a variable, found `=`.",
  );
});

test("runtime errors read well in both languages", () => {
  const run = (source) => execute(analyze(source).program).diagnostics[0];
  assert.equal(
    formatDiagnostic(tinyLanguageCopy.en, run("print(1 / 0)\n")),
    "Division by zero.",
  );
  assert.equal(
    formatDiagnostic(tinyLanguageCopy["pt-BR"], run("print(1 / 0)\n")),
    "Divisão por zero.",
  );
  assert.equal(
    formatDiagnostic(tinyLanguageCopy.en, run('print(1 + "a")\n')),
    "`+` cannot be used with int and str.",
  );
  assert.match(
    formatDiagnostic(
      tinyLanguageCopy["pt-BR"],
      run("while true:\n    let a = 1\n"),
    ),
    /Parou após 20000 passos/,
  );
});

test("the examples behave as their hints say", () => {
  const by = Object.fromEntries(examples.map((e) => [e.id, analyze(e.source)]));
  for (const id of [
    "hello",
    "arithmetic",
    "functions",
    "control",
    "divide-by-zero",
    "forever",
    "deep-recursion",
  ])
    assert.deepEqual(by[id].diagnostics, [], id);
  assert.equal(by["missing-colon"].diagnostics.length, 2);
  assert.ok(
    by["missing-colon"].program.body.some((s) => s.kind === "expr"),
    "the last line still parses",
  );
  assert.ok(by["bad-indent"].diagnostics.length >= 1);
  const out = (id) => execute(by[id].program);
  assert.deepEqual(out("hello").output, [
    "Hello, Morgan",
    "Morgan is 27 years old",
  ]);
  assert.deepEqual(out("arithmetic").output, ["40 10 0", "true"]);
  assert.deepEqual(out("functions").output, [
    "1! = 1",
    "2! = 2",
    "3! = 6",
    "4! = 24",
    "5! = 120",
  ]);
  assert.deepEqual(out("control").output, [
    "1 is odd",
    "2 is even",
    "3 is odd",
    "4 is even",
    "last one",
  ]);
  assert.deepEqual(out("divide-by-zero").output, ["before"]);
  assert.equal(out("divide-by-zero").diagnostics[0].code, "division-by-zero");
  assert.equal(out("forever").diagnostics[0].code, "step-limit");
  assert.equal(out("deep-recursion").diagnostics[0].code, "depth-limit");
  for (const e of examples) assert.ok(e.source.length < 400);
});

test("pickForm gives the same wording as the plural rules", () => {
  for (const locale of LOCALE_IDS) {
    const intl = LOCALES[locale].intlLocale;
    const one = oneCountsFor(intl, 4000);
    const copy = tinyLanguageCopy[locale];
    for (const forms of [
      copy.problems,
      copy.tokenCount,
      copy.steps,
      copy.outputLines,
    ])
      for (const n of [0, 1, 2, 3, 5, 11, 21, 100, 999, 4000])
        assert.equal(
          pickForm(forms, n, one),
          countedFor(intl, n, forms),
          `${locale} ${n}`,
        );
  }
  const pt = tinyLanguageCopy["pt-BR"];
  assert.equal(
    pickForm(pt.problems, 0, oneCountsFor("pt-BR", 5)),
    "nenhum problema",
  );
  assert.equal(
    pickForm(pt.problems, 1, oneCountsFor("pt-BR", 5)),
    "1 problema",
  );
  assert.equal(
    pickForm(pt.problems, 2, oneCountsFor("pt-BR", 5)),
    "2 problemas",
  );
});

test("numbers are formatted by the locale", () => {
  assert.equal(new Intl.NumberFormat("en-US").format(4000), "4,000");
  assert.equal(new Intl.NumberFormat("pt-BR").format(4000), "4.000");
});
