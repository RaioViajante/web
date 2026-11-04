import assert from "node:assert/strict";
import test from "node:test";
import { ptProjectsCopy } from "../lib/pt.ts";
import {
  clientCases,
  countLabel,
  featuredProjects,
  projectCategories,
  projectLink,
  projects,
  projectsCopy,
} from "../lib/projects.ts";
import {
  formatSize,
  isFinished,
  mochifileResult,
  mochifileTargets,
  transition,
} from "../lib/sketch-demos.ts";
import { roughEllipse, roughLine } from "../lib/sketch.ts";

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
    for (const field of ["description", "summary", "status", "tagline"])
      assert.notEqual(pt[field], en[field], `${id}.${field}`);
    // A label is only needed, and only present, where there is a link.
    assert.equal(Boolean(en.actionShort), Boolean(link), id);
    assert.equal(Boolean(pt.actionShort), Boolean(link), id);
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
  assert.deepEqual(same, ["hum.volume", "mochifile.original", "yanawa.tokens"]);
});

test("nothing published is a placeholder or an invented client", () => {
  assert.deepEqual(clientCases, []);
  const strings = (value) =>
    typeof value === "string"
      ? [value]
      : Object.values(value).flatMap((item) => strings(item));
  for (const text of strings([projectsCopy, ptProjectsCopy])) {
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

test("the Orbit sketch follows Orbit's transition rules", () => {
  assert.equal(transition("queued", "start"), "running");
  assert.equal(transition("running", "succeed"), "succeeded");
  assert.equal(transition("running", "fail"), "failed");
  assert.equal(transition("queued", "cancel"), "cancelled");
  assert.equal(transition("running", "cancel"), "cancelled");
  assert.equal(transition("queued", "succeed"), undefined);
  assert.equal(transition("queued", "fail"), undefined);
  assert.equal(transition("running", "start"), undefined);
  for (const finished of ["succeeded", "failed", "cancelled"]) {
    assert.ok(isFinished(finished));
    for (const action of ["start", "succeed", "fail", "cancel"])
      assert.equal(transition(finished, action), undefined);
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

test("hand-drawn strokes are deterministic", () => {
  assert.equal(roughLine(0, 0, 10, 10, 3), roughLine(0, 0, 10, 10, 3));
  assert.notEqual(roughLine(0, 0, 10, 10, 3), roughLine(0, 0, 10, 10, 4));
  assert.equal(roughEllipse(0, 0, 5, 5, 9), roughEllipse(0, 0, 5, 5, 9));
});

test("the catalog count uses each language's plural", () => {
  assert.equal(countLabel(projectsCopy.all.count, 1), "1 project");
  assert.equal(countLabel(projectsCopy.all.count, 8), "8 projects");
  assert.equal(countLabel(ptProjectsCopy.all.count, 3), "3 projetos");
});
