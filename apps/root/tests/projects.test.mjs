import assert from "node:assert/strict";
import test from "node:test";
import { ptProjectsCopy, ptQuadraCopy, ptStuccoCopy } from "../lib/pt.ts";
import {
  cases,
  countLabel,
  featuredProjects,
  projectCategories,
  projectLink,
  projects,
  projectsCopy,
} from "../lib/projects.ts";
import {
  formatSize,
  mochifileResult,
  mochifileTargets,
} from "../lib/sketch-demos.ts";
import { quadraCopy, quadraPartner } from "../lib/quadra.ts";
import { routes, routeKeys } from "../lib/routes.ts";
import { stuccoCopy } from "../lib/stucco.ts";
import { refrainFontText } from "../../../packages/design/scripts/refrain-art.mjs";

// The projects pages publish facts about real projects. These checks keep the
// data honest: the approved set and order, no private repository, no
// placeholder, and every word available in both languages.

test("the catalog has the eight approved projects, four of them featured in order", () => {
  assert.deepEqual(
    projects.map(({ id }) => id),
    [
      "mochifile",
      "ordelis",
      "refrain",
      "orbit",
      "yanawa",
      "sweep",
      "hum",
      "morrowferry",
    ],
  );
  assert.deepEqual(
    featuredProjects.map(({ id }) => id),
    ["mochifile", "ordelis", "refrain", "orbit"],
  );
});

test("every category has projects and every project has a category filter", () => {
  const counts = Object.fromEntries(
    projectCategories.map((category) => [
      category,
      projects.filter((project) => project.category === category).length,
    ]),
  );
  assert.deepEqual(counts, {
    tools: 3,
    music: 2,
    systems: 1,
    languages: 1,
    games: 1,
  });
});

test("private repositories are never linked, and links are public HTTPS", () => {
  for (const project of projects)
    for (const href of Object.values(project.link?.href ?? {})) {
      assert.match(href, /^https:\/\//, project.id);
      assert.doesNotMatch(href, /refrain|morrowferry/i, project.id);
    }
  assert.equal(
    projects.find(({ id }) => id === "morrowferry")?.link,
    undefined,
  );
});

test("Portuguese links use localized pages on participating hosts, else say English", () => {
  const link = (id, locale) =>
    projectLink(
      projects.find((project) => project.id === id),
      locale,
    );
  assert.deepEqual(link("ordelis", "pt-BR"), {
    href: "https://docs.raioviajante.com/pt/projetos/ordelis/",
    hrefLang: "pt-BR",
  });
  assert.deepEqual(link("refrain", "pt-BR"), {
    href: "https://dump.raioviajante.com/pt/posts/eu-queria-um-lugar-para-guardar-todas-essas-musicas",
    hrefLang: "pt-BR",
  });
  assert.deepEqual(link("orbit", "pt-BR"), {
    href: "https://lab.raioviajante.com/pt/experiments/estados-de-execucao/",
    hrefLang: "pt-BR",
  });
  assert.deepEqual(link("mochifile", "pt-BR"), {
    href: "https://mochifile.com/pt/",
    hrefLang: "pt-BR",
  });
  assert.deepEqual(link("hum", "pt-BR"), {
    href: "https://github.com/RaioViajante/hum",
    hrefLang: "en",
  });
  assert.deepEqual(link("orbit", "en"), {
    href: "https://lab.raioviajante.com/experiments/execution-states/",
    hrefLang: "en",
  });
  assert.equal(link("morrowferry", "en"), undefined);
});

test("each project's copy exists in both languages, translated", () => {
  for (const { id, link } of projects) {
    const en = projectsCopy.projects[id];
    const pt = ptProjectsCopy.projects[id];
    for (const field of ["description", "summary", "status"])
      assert.notEqual(pt[field], en[field], `${id}.${field}`);
    // Labels are only needed, and only present, where there is a link.
    for (const copy of [en, pt]) {
      assert.equal(Boolean(copy.action), Boolean(link), id);
      assert.equal(Boolean(copy.actionShort), Boolean(link), id);
    }
  }
  for (const category of projectCategories)
    assert.ok(ptProjectsCopy.categories[category]);
});

test("the sketch copy is fully translated, including the words inside the art", () => {
  const strings = (value, path = []) =>
    typeof value === "string"
      ? [[path.join("."), value]]
      : Object.entries(value).flatMap(([key, item]) =>
          strings(item, [...path, key]),
        );
  const english = new Map(strings(projectsCopy.art));
  const portuguese = new Map(strings(ptProjectsCopy.art));
  assert.deepEqual([...portuguese.keys()].sort(), [...english.keys()].sort());
  // Words that are the same in both languages; everything else differs.
  const same = [...english]
    .filter(([key, value]) => portuguese.get(key) === value)
    .map(([key]) => key)
    .sort();
  assert.deepEqual(same, ["hum.volume", "yanawa.tokens"]);
});

test("Refrain's art draws only characters its cut-down typefaces have", () => {
  const faces = {
    kicker: refrainFontText.silkscreen,
    tagline: refrainFontText.instrumentSerifItalic,
    note: refrainFontText.laBelleAurore,
  };
  for (const copy of [projectsCopy, ptProjectsCopy])
    for (const [key, set] of Object.entries(faces))
      for (const char of copy.art.refrain[key])
        assert.ok(set.includes(char), `${key}: "${char}"`);
});

test("the published cases are Stucco. and Quadra, and their pages exist", () => {
  assert.deepEqual(
    cases.map(({ id, name, year }) => [id, name, year]),
    [
      ["stucco", "Stucco.", "2026"],
      ["quadra", "Quadra", "2025"],
    ],
  );
  for (const { route } of cases) {
    assert.ok(routeKeys.includes(route), route);
    assert.ok(routes[route]["pt-BR"], route);
  }
});

test("each case has the same shape in both languages", () => {
  const paths = (value, path = []) =>
    Array.isArray(value)
      ? [
          `${path.join(".")}[${value.length}]`,
          ...value.flatMap((item, index) => paths(item, [...path, index])),
        ]
      : typeof value === "object"
        ? Object.entries(value).flatMap(([key, item]) =>
            paths(item, [...path, key]),
          )
        : [path.join(".")];
  assert.deepEqual(paths(ptStuccoCopy), paths(stuccoCopy));
  assert.notEqual(ptStuccoCopy.intro, stuccoCopy.intro);
  assert.deepEqual(paths(ptQuadraCopy), paths(quadraCopy));
  assert.notEqual(ptQuadraCopy.intro, quadraCopy.intro);
});

test("the Quadra case says what is fictional and that its demo stores nothing", () => {
  for (const copy of [quadraCopy, ptQuadraCopy]) {
    assert.match(copy.note, /fictional|fictícios/);
    const state = copy.tech.rows.find(({ term }) => /state|Estado/.test(term));
    assert.match(state.value, /nothing is stored|nada fica guardado/);
  }
  assert.match(quadraPartner.profile, /^https:\/\//);
});

test("the Stucco. case states the owner's print sizes and that the brand is fictional", () => {
  const text = (value) =>
    typeof value === "string"
      ? value
      : typeof value === "object"
        ? Object.values(value).map(text).join("\n")
        : "";
  for (const copy of [stuccoCopy, ptStuccoCopy]) {
    assert.equal(copy.brand.pieces.car.spec.slice(0, 10), "20 × 28 cm");
    assert.equal(copy.brand.pieces.business.spec.slice(0, 8), "9 × 5 cm");
    assert.doesNotMatch(text(copy), /300 × 280/);
    assert.match(copy.note, /fictional|fictícios/);
  }
});

test("nothing published is a placeholder", () => {
  const strings = (value) =>
    typeof value === "string"
      ? [value]
      : Object.values(value).flatMap((item) => strings(item));
  for (const text of strings([
    projectsCopy,
    ptProjectsCopy,
    stuccoCopy,
    ptStuccoCopy,
    quadraCopy,
    ptQuadraCopy,
  ])) {
    assert.doesNotMatch(text, /[[\]]/, text);
    assert.doesNotMatch(text, /\bTODO\b|lorem ipsum/, text);
  }
});

test("Orbit's copy never claims scheduling or execution exists", () => {
  for (const copy of [projectsCopy, ptProjectsCopy]) {
    const { description, summary } = copy.projects.orbit;
    assert.match(description, /planned|planejad/);
    assert.match(summary, /planned|planejad/);
  }
});

test("the Mochifile sketch always lands under the chosen target", () => {
  for (const target of mochifileTargets) {
    const result = mochifileResult(target);
    assert.ok(result.kb <= target, `${target}`);
    assert.ok(result.reduction > 0 && result.reduction < 100);
  }
  assert.equal(formatSize(4800, "en-US"), "4.8 MB");
  assert.equal(formatSize(4800, "pt-BR"), "4,8 MB");
  assert.equal(formatSize(192, "pt-BR"), "192 KB");
});

test("the catalog count uses each language's plural", () => {
  assert.equal(countLabel(projectsCopy.all.count, 1), "01 project");
  assert.equal(countLabel(projectsCopy.all.count, 8), "08 projects");
  assert.equal(countLabel(ptProjectsCopy.all.count, 3), "03 projetos");
});
