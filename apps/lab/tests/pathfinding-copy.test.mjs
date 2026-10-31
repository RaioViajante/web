import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCALE_IDS, LOCALES } from "../../../site/locales.ts";
import { pathfindingCopy } from "../src/lib/pathfinding-copy.ts";
import { oneCountsFor } from "../src/lib/pathfinding-count.ts";
import {
  kindOf,
  labelOf,
  markOf,
  pickForm,
} from "../src/lib/pathfinding-view.ts";
import { countedFor } from "../src/lib/plural-core.ts";
import { placeholders } from "../src/lib/template.ts";
import { WALL, MUD, createGrid, paint } from "../src/lib/pathfinding.ts";

const leaves = (value, path = "") =>
  typeof value === "string"
    ? [[path, value]]
    : Object.entries(value).flatMap(([key, child]) =>
        leaves(child, path ? `${path}.${key}` : key),
      );
const withoutZero = ([path]) => !/\.none$/.test(path);

test("the catalog has the same keys and placeholders in both locales", () => {
  assert.deepEqual(Object.keys(pathfindingCopy).sort(), [...LOCALE_IDS].sort());
  const en = leaves(pathfindingCopy.en).filter(withoutZero);
  const pt = leaves(pathfindingCopy["pt-BR"]).filter(withoutZero);
  assert.deepEqual(
    pt.map(([path]) => path),
    en.map(([path]) => path),
  );
  en.forEach(([path, value], i) =>
    assert.deepEqual(placeholders(pt[i][1]), placeholders(value), path),
  );
});

// Algorithm names, grid sizes, symbols and punctuation read the same in Portuguese.
const sameInBothLanguages = [
  "algorithmNames.astar",
  "algorithmNames.bfs",
  "algorithmNames.dfs",
  "algorithmNames.dijkstra",
  "compareNa",
  "concepts.1.term",
  "concepts.2.term",
  "concepts.4.term",
  "concepts.5.term",
  "marks.expanded",
  "marks.frontier",
  "marks.ground",
  "marks.mud",
  "marks.path",
  "marks.wall",
  "none",
  "sizes.large",
  "sizes.medium",
  "sizes.small",
];

test("Portuguese strings are translated except names and symbols", () => {
  const pt = new Map(leaves(pathfindingCopy["pt-BR"]));
  const same = leaves(pathfindingCopy.en)
    .filter(([path, value]) => pt.get(path) === value)
    .map(([path]) => path);
  assert.deepEqual(same.sort(), [...new Set(sameInBothLanguages)].sort());
});

test("counted phrases supply a zero form in Portuguese", () => {
  const pt = pathfindingCopy["pt-BR"];
  for (const name of ["cellsExplored", "movesOnPath"])
    assert.ok(pt[name].none, name);
});

test("pickForm gives the same wording as the plural rules for every count", () => {
  for (const locale of LOCALE_IDS) {
    const intl = LOCALES[locale].intlLocale;
    const one = oneCountsFor(intl, 480);
    const copy = pathfindingCopy[locale];
    for (const forms of [copy.cellsExplored, copy.movesOnPath, copy.speedValue])
      for (let n = 0; n <= 480; n += 1)
        assert.equal(
          pickForm(forms, n, one),
          countedFor(intl, n, forms),
          `${locale} ${n}`,
        );
  }
  assert.throws(
    () => pickForm({ one: "{count}", other: "{count}" }, -1, []),
    RangeError,
  );
  assert.throws(
    () => pickForm({ one: "{count}", other: "{count}" }, 1.5, []),
    RangeError,
  );
});

test("plural examples read correctly", () => {
  const en = oneCountsFor("en-US", 5);
  const pt = oneCountsFor("pt-BR", 5);
  assert.equal(
    pickForm(pathfindingCopy.en.cellsExplored, 1, en),
    "1 cell explored",
  );
  assert.equal(
    pickForm(pathfindingCopy.en.cellsExplored, 0, en),
    "0 cells explored",
  );
  assert.equal(
    pickForm(pathfindingCopy["pt-BR"].cellsExplored, 0, pt),
    "nenhuma célula explorada",
  );
  assert.equal(
    pickForm(pathfindingCopy["pt-BR"].cellsExplored, 1, pt),
    "1 célula explorada",
  );
  assert.equal(
    pickForm(pathfindingCopy["pt-BR"].movesOnPath, 3, pt),
    "3 passos",
  );
});

test("cell marks and labels never depend on color and are localized", () => {
  for (const locale of LOCALE_IDS) {
    const copy = pathfindingCopy[locale];
    let grid = paint(paint(createGrid("small"), 3, WALL), 4, MUD);
    assert.equal(markOf(copy, kindOf(grid, 3), "none"), "#");
    assert.equal(markOf(copy, kindOf(grid, 4), "none"), "~");
    assert.equal(markOf(copy, "ground", "frontier"), "f");
    assert.equal(markOf(copy, "ground", "path"), "*");
    assert.equal(markOf(copy, "start", "path"), copy.marks.start);
    assert.notEqual(copy.marks.start, copy.marks.goal);
    assert.doesNotMatch(labelOf(copy, grid, 3, "none"), /[{}]/);
    assert.doesNotMatch(labelOf(copy, grid, 0, "frontier"), /[{}]/);
  }
  const grid = createGrid("small");
  assert.equal(
    labelOf(pathfindingCopy.en, grid, 0, "none"),
    "row 1, column 1: open",
  );
  assert.equal(
    labelOf(pathfindingCopy["pt-BR"], grid, 0, "path"),
    "linha 1, coluna 1: livre, no caminho",
  );
});
