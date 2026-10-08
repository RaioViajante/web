import assert from "node:assert/strict";
import { test } from "node:test";
import { experimentCount } from "../src/lib/experiment-count.ts";

test("the filter result counts experiments in words, singular and plural", () => {
  assert.equal(experimentCount(0), "0 experiments");
  assert.equal(experimentCount(1), "1 experiment");
  assert.equal(experimentCount(2), "2 experiments");
});
