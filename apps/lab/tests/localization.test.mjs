import assert from "node:assert/strict";
import { test } from "node:test";
import {
  experiments,
  portugueseExperiments,
  publishedExperiments,
  counterpartsOf,
  experimentPath,
  validateExperiments,
} from "../src/data/experiments.ts";
import { classifierCopy, displayDate, textFor } from "../src/lib/copy.ts";

test("stable identities, shared provenance and real reciprocal counterparts", () => {
  assert.deepEqual(
    experiments.map(({ id }) => id),
    ["003", "002", "001"],
  );
  assert.deepEqual(
    portugueseExperiments.map(({ contentId }) => contentId),
    ["001"],
  );
  assert.equal(
    experimentPath(portugueseExperiments[0]),
    "/pt/experiments/classificador-de-arquivos/",
  );
  assert.deepEqual(counterpartsOf(experiments[2]), [
    { locale: "pt-BR", path: experimentPath(portugueseExperiments[0]) },
  ]);
  assert.deepEqual(counterpartsOf(portugueseExperiments[0]), [
    { locale: "en", path: experimentPath(experiments[2]) },
  ]);
  assert.deepEqual(counterpartsOf(experiments[0]), []);
  assert.deepEqual(counterpartsOf(experiments[1]), []);
  assert.equal(displayDate(portugueseExperiments[0]), "13 de setembro de 2026");
  assert.equal(displayDate(experiments[2]), "2026-09-13");
  assert.deepEqual(publishedExperiments.length, 4);
});

test("reject duplicate versions, missing originals and altered stable facts", () => {
  assert.throws(
    () =>
      validateExperiments([...publishedExperiments, portugueseExperiments[0]]),
    /Duplicate/,
  );
  assert.throws(
    () => validateExperiments([portugueseExperiments[0]]),
    /provenance/,
  );
  assert.throws(
    () =>
      validateExperiments([
        experiments[2],
        { ...portugueseExperiments[0], revision: "unknown" },
      ]),
    /provenance/,
  );
});

test("Portuguese labels are localized while classification keys remain stable", () => {
  assert.equal(textFor("pt-BR").status.active, "ativo");
  assert.equal(textFor("pt-BR").fidelityLabel["runs here"], "executa aqui");
  assert.equal(classifierCopy["pt-BR"].categories.Other, "Outros");
  assert.equal(classifierCopy.en.categories.Other, "Other");
});

test("fixture: Portuguese-only work and withdrawn English original retain truthful provenance", () => {
  const portugueseOriginal = {
    ...portugueseExperiments[0],
    contentId: "fixture-pt",
    id: "fixture-pt",
    originalLocale: "pt-BR",
  };
  assert.doesNotThrow(() => validateExperiments([portugueseOriginal]));
  assert.doesNotThrow(() =>
    validateExperiments(
      [portugueseExperiments[0]],
      [{ contentId: "001", originalLocale: "en" }],
    ),
  );
  assert.throws(
    () =>
      validateExperiments(
        [experiments[2], portugueseExperiments[0]],
        [{ contentId: "001", originalLocale: "en" }],
      ),
    /provenance/,
  );
  assert.throws(
    () =>
      validateExperiments(
        [portugueseExperiments[0]],
        [{ contentId: "001", originalLocale: "pt-BR" }],
      ),
    /provenance/,
  );
});
