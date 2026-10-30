import assert from "node:assert/strict";
import { test } from "node:test";
import {
  experiments,
  portugueseExperiments,
  publishedExperiments,
  experimentsFor,
  counterpartsOf,
  experimentPath,
  validateExperiments,
} from "../src/data/experiments.ts";
import { fidelityRows, relatedRows } from "../src/data/experiment-content.ts";
import { classifierCopy } from "../src/lib/bench-copy.ts";
import { displayDate, textFor } from "../src/lib/copy.ts";
import { formatDate } from "../src/lib/date.ts";

const byId = (list, id) => list.find((experiment) => experiment.id === id);

test("stable identities, shared provenance and real reciprocal counterparts", () => {
  assert.deepEqual(
    experiments.map(({ id }) => id),
    ["007", "003", "002", "001"],
  );
  assert.deepEqual(
    portugueseExperiments.map(({ contentId }) => contentId),
    ["007", "003", "002", "001"],
  );
  assert.deepEqual(
    portugueseExperiments.map((experiment) => experimentPath(experiment)),
    [
      "/pt/experiments/compressao-de-imagens/",
      "/pt/experiments/setor-de-boot/",
      "/pt/experiments/estados-de-execucao/",
      "/pt/experiments/classificador-de-arquivos/",
    ],
  );
  for (const english of experiments) {
    const portuguese = byId(portugueseExperiments, english.id);
    assert.deepEqual(counterpartsOf(english), [
      { locale: "pt-BR", path: experimentPath(portuguese) },
    ]);
    assert.deepEqual(counterpartsOf(portuguese), [
      { locale: "en", path: experimentPath(english) },
    ]);
    // Stable facts are inherited, never retyped.
    for (const key of [
      "id",
      "project",
      "revision",
      "created",
      "source",
      "status",
      "fidelity",
      "surface",
      "originalLocale",
    ])
      assert.equal(portuguese[key], english[key], `${english.id} ${key}`);
  }
  assert.deepEqual(experimentsFor("en").length, 4);
  assert.deepEqual(experimentsFor("pt-BR").length, 4);
  assert.deepEqual(publishedExperiments.length, 8);
});

test("every experiment is fully authored in Portuguese, not copied from English", () => {
  for (const english of experiments) {
    const portuguese = byId(portugueseExperiments, english.id);
    for (const key of ["slug", "title", "description", "what", "notes"]) {
      assert.ok(portuguese[key], `${english.id} ${key} exists`);
      assert.notEqual(portuguese[key], english[key], `${english.id} ${key}`);
    }
    assert.equal(
      english.notes === undefined,
      portuguese.notes === undefined,
      `${english.id} notes`,
    );
  }
  const titles = new Set(publishedExperiments.map(({ title }) => title));
  assert.equal(titles.size, publishedExperiments.length);
});

test("revisions and technical names survive translation verbatim", () => {
  for (const english of experiments) {
    const portuguese = byId(portugueseExperiments, english.id);
    assert.ok(
      portuguese.notes.includes(english.revision),
      `${english.id} notes keep revision ${english.revision}`,
    );
    assert.ok(
      portuguese.notes.toLowerCase().includes(english.project.toLowerCase()),
      `${english.id} notes keep project ${english.project}`,
    );
  }
  assert.match(byId(portugueseExperiments, "003").notes, /Hello, World!/);
  assert.match(byId(portugueseExperiments, "002").description, /Orbit/);
  assert.match(byId(portugueseExperiments, "001").what, /Sweep/);
});

test("fidelity rows and related rows exist for every surface in both locales", () => {
  for (const experiment of experiments) {
    assert.ok(fidelityRows[experiment.surface].en.length >= 3);
    assert.ok(fidelityRows[experiment.surface]["pt-BR"].length >= 3);
    assert.ok(relatedRows[experiment.surface].en.length >= 1);
  }
});

test("reject duplicate versions, missing originals and altered stable facts", () => {
  const sweep = byId(portugueseExperiments, "001");
  assert.throws(
    () => validateExperiments([...publishedExperiments, sweep]),
    /Duplicate/,
  );
  assert.throws(() => validateExperiments([sweep]), /provenance/);
  assert.throws(
    () =>
      validateExperiments([
        byId(experiments, "001"),
        { ...sweep, revision: "unknown" },
      ]),
    /provenance/,
  );
});

test("dates use the page locale in UTC, with the ISO value kept for machines", () => {
  assert.equal(formatDate("en", "2026-09-13"), "September 13, 2026");
  assert.equal(formatDate("pt-BR", "2026-09-13"), "13 de setembro de 2026");
  assert.equal(formatDate("en", "2026-01-01"), "January 1, 2026");
  assert.equal(formatDate("pt-BR", "2026-12-31"), "31 de dezembro de 2026");
  for (const experiment of experiments)
    assert.match(experiment.created, /^\d{4}-\d\d-\d\d$/);
  assert.equal(displayDate(byId(experiments, "001")), "September 13, 2026");
  assert.equal(
    displayDate(byId(portugueseExperiments, "001")),
    "13 de setembro de 2026",
  );
  assert.throws(() => formatDate("en", "13/09/2026"), RangeError);
});

test("Portuguese labels are localized while classification keys remain stable", () => {
  const pt = textFor("pt-BR");
  assert.equal(pt.status.active, "ativo");
  assert.equal(pt.fidelityLabel["runs here"], "executa aqui");
  // Category names are translated for display; Sweep's folder names are not.
  assert.equal(classifierCopy["pt-BR"].categoryLabel.Other, "Outros");
  assert.equal(classifierCopy.en.categoryLabel.Other, "Other");
});

test("no Portuguese page renders a raw status or fidelity key", () => {
  const pt = textFor("pt-BR");
  for (const experiment of portugueseExperiments) {
    assert.notEqual(pt.status[experiment.status], experiment.status);
    assert.notEqual(pt.fidelityLabel[experiment.fidelity], experiment.fidelity);
  }
  for (const key of Object.keys(pt.fidelityHelp))
    assert.ok(pt.fidelityLabel[key]);
});

test("fixture: Portuguese-only work and withdrawn English original retain truthful provenance", () => {
  const sweep = byId(portugueseExperiments, "001");
  const portugueseOriginal = {
    ...sweep,
    contentId: "fixture-pt",
    id: "fixture-pt",
    originalLocale: "pt-BR",
  };
  assert.doesNotThrow(() => validateExperiments([portugueseOriginal]));
  assert.doesNotThrow(() =>
    validateExperiments([sweep], [{ contentId: "001", originalLocale: "en" }]),
  );
  assert.throws(
    () =>
      validateExperiments(
        [byId(experiments, "001"), sweep],
        [{ contentId: "001", originalLocale: "en" }],
      ),
    /provenance/,
  );
  assert.throws(
    () =>
      validateExperiments(
        [sweep],
        [{ contentId: "001", originalLocale: "pt-BR" }],
      ),
    /provenance/,
  );
});

test("the already-published Portuguese experiment 001 keeps its original public text", () => {
  // These strings were live before the full localization (main at fe68b49).
  // Changing one is an editorial decision for the owner, not a side effect.
  const sweep = byId(portugueseExperiments, "001");
  assert.equal(sweep.slug, "classificador-de-arquivos");
  assert.equal(sweep.title, "classificador de arquivos");
  assert.equal(
    sweep.description,
    "descubra como o Sweep classifica um nome de arquivo",
  );
  assert.equal(
    sweep.what,
    "Com apenas um nome de arquivo, qual categoria o Sweep escolhe e qual seria o destino? O Sweep classifica pela última extensão antes de decidir onde o arquivo pertence. Esta página reproduz essa pequena parte do comportamento no navegador; o Sweep não está em execução aqui.",
  );
  assert.equal(
    sweep.notes,
    "Baseado na revisão 3544d36 do Sweep. Apenas as extensões dos nomes são consideradas. Nenhum arquivo é enviado, inspecionado ou movido.",
  );
  const pt = textFor("pt-BR");
  assert.equal(pt.headings.whatRuns, "O que funciona aqui");
  assert.equal(
    pt.notebookIntro,
    "Registros dos experimentos e de seus limites.",
  );
  assert.equal(pt.search.title, "busca");
  assert.deepEqual(classifierCopy["pt-BR"].headers, [
    "arquivo",
    "extensão",
    "categoria",
    "destino",
  ]);
  assert.equal(classifierCopy["pt-BR"].why, 'Por que .hidden é "Outros"');
  assert.deepEqual(
    relatedRows["filename-classifier"]["pt-BR"].map((row) => [
      row.label,
      row.value,
      row.href,
    ]),
    [
      [
        "Sweep · classificação",
        "docs ↗",
        "https://docs.raioviajante.com/pt/projetos/sweep/#classificação",
      ],
      [
        "código-fonte do Sweep",
        "github ↗",
        "https://github.com/RaioViajante/sweep",
      ],
    ],
  );
  assert.equal(pt.published(false), "registrado");
  assert.equal(pt.tagline, "experimentos podem falhar.");
  assert.deepEqual(
    fidelityRows["filename-classifier"]["pt-BR"].map((row) => row.label),
    [
      "regras de classificação",
      "comportamento da extensão",
      "acesso ao sistema de arquivos",
      "verificação de conflitos e tamanho",
    ],
  );
});

test("a notebook entry's participle agrees with its title's number", () => {
  const pt = textFor("pt-BR");
  for (const experiment of portugueseExperiments) {
    const entry = `${experiment.title} ${pt.published(experiment.titlePlural === true)}`;
    assert.equal(
      entry.endsWith("registrados"),
      experiment.title === "estados de execução",
      entry,
    );
  }
  assert.equal(textFor("en").published(true), "published");
  // Only a plural title declares it, and only translations carry the flag.
  assert.deepEqual(
    experiments.filter((experiment) => experiment.titlePlural),
    [],
  );
  assert.deepEqual(
    portugueseExperiments
      .filter((experiment) => experiment.titlePlural)
      .map(({ id }) => id),
    ["002"],
  );
});

test("every experiment in every locale carries its notes, which both layouts render", () => {
  for (const experiment of publishedExperiments)
    assert.ok(experiment.notes, `${experiment.locale} ${experiment.id} notes`);
});
