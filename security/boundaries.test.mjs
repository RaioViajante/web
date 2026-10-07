import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { CONTACT, SITES, siteById, siteOrigins } from "../site/sites.ts";
import { identity } from "../seo/structured-data.ts";

// Dependency direction: site/ imports nothing; design, seo and security import
// site/ (never each other's apps); apps import anything shared; shared code
// never imports an app. See docs/architecture.md.
const root = resolve(fileURLToPath(import.meta.url), "../..");
const skip = new Set(["node_modules", ".next", "dist", ".astro", "coverage", ".git", "test-results"]);
const exts = /\.(ts|tsx|mjs|astro)$/;

function files(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...files(path));
    else if (exts.test(name) && !/\.test\./.test(name)) out.push(path);
  }
  return out;
}

function imports(path) {
  const text = readFileSync(path, "utf8");
  return [...text.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)].map((m) => m[1]);
}

function resolved(path, spec) {
  if (spec.startsWith(".")) return relative(root, resolve(path, "..", spec));
  return spec;
}

const layer = (rel) => rel.split("/")[0];

function violations(dirs, forbidden) {
  const bad = [];
  for (const dir of dirs) {
    for (const path of files(join(root, dir))) {
      for (const spec of imports(path)) {
        const target = resolved(path, spec);
        if (forbidden(target, spec)) bad.push(`${relative(root, path)} -> ${spec}`);
      }
    }
  }
  return bad;
}

const appPackage = /^@raioviajante\/(root|dump|docs|lab)(\/|$)/;
const isApp = (target) => target.startsWith("apps/") || appPackage.test(target);

test("site/ imports nothing from the repository", () => {
  assert.deepEqual(
    violations(["site"], (_t, spec) => spec.startsWith(".") || spec.startsWith("@raioviajante/")),
    [],
  );
});

test("packages/design imports neither seo/, security/, links/ nor any app", () => {
  assert.deepEqual(
    violations(["packages/design"], (target, spec) =>
      isApp(target) || ["seo", "security", "links", "perf", "e2e"].includes(layer(target)),
    ),
    [],
  );
});

test("seo/ and security/ import no app and only the design theme color; security never imports seo/", () => {
  assert.deepEqual(
    violations(["seo", "security"], (target, spec) =>
      isApp(target) ||
      spec.startsWith("@raioviajante/") ||
      (target.startsWith("packages/") && target !== "packages/design/theme-color.ts"),
    ),
    [],
  );
  assert.deepEqual(
    violations(["security"], (target) => layer(target) === "seo"),
    [],
  );
});

test("apps never import another app", () => {
  const bad = [];
  for (const app of ["root", "dump", "docs", "lab"]) {
    bad.push(
      ...violations([`apps/${app}`], (target) => {
        if (target.startsWith("apps/")) return !target.startsWith(`apps/${app}/`);
        const m = appPackage.exec(target);
        return Boolean(m && m[1] !== app);
      }),
    );
  }
  assert.deepEqual(bad, []);
});

test("site config describes the four production origins and the contact data", () => {
  assert.deepEqual(
    Object.fromEntries(SITES.map((site) => [site.id, site.href])),
    siteOrigins,
  );
  assert.deepEqual(Object.keys(siteOrigins), ["root", "dump", "docs", "lab"]);
  for (const origin of Object.values(siteOrigins)) {
    assert.equal(new URL(origin).origin, origin);
  }
  assert.equal(siteById("dump").href, siteOrigins.dump);
  assert.equal(CONTACT.email, "mail@raioviajante.com");
  assert.equal(CONTACT.cnpj, "53.021.377/0001-93");
});

test("the person identity lives on the root origin", () => {
  assert.equal(new URL(identity.url).origin, siteOrigins.root);
  assert.equal(new URL(identity.id).origin, siteOrigins.root);
});

test("shared code does not hardcode a production origin outside site/", () => {
  const literal = /["'`]https:\/\/(?:(?:dump|docs|lab)\.)?raioviajante\.com/;
  const bad = [];
  // Shared code only: editorial prose and content links inside apps keep their
  // literal URLs, and the dump app derives its origin from its environment.
  for (const dir of ["packages/design", "seo", "security", "links"]) {
    for (const path of files(join(root, dir))) {
      const rel = relative(root, path);
      const lines = readFileSync(path, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (literal.test(line)) bad.push(`${rel}:${i + 1}`);
      });
    }
  }
  assert.deepEqual(bad, []);
});
