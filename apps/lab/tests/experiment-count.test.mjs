import assert from "node:assert/strict";
import { test } from "node:test";
import { experimentCount } from "../src/lib/experiment-count.ts";
import { textFor } from "../src/lib/copy.ts";

test("the filter result counts experiments in words, singular and plural, in both locales", () => {
  assert.equal(experimentCount("en", 0), "0 experiments");
  assert.equal(experimentCount("en", 1), "1 experiment");
  assert.equal(experimentCount("en", 2), "2 experiments");
  assert.equal(experimentCount("pt-BR", 0), "nenhum experimento");
  assert.equal(experimentCount("pt-BR", 1), "1 experimento");
  assert.equal(experimentCount("pt-BR", 2), "2 experimentos");
  assert.equal(textFor("pt-BR").count(3), "3 experimentos");
  assert.equal(textFor("en").count(3), "3 experiments");
});
