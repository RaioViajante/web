import assert from "node:assert/strict";
import { test } from "node:test";
import { breadcrumb, childIndexes, navNumbers, parentIndex } from "../src/lib/nav.ts";

const page = (path, label, sub = false) => ({ path, label, sub });

// The current content: one guide with one reference page, then two standards.
const current = [
  page("/projects/sweep/", "sweep"),
  page("/projects/sweep/cli/", "cli reference", true),
  page("/raioviajante/design-language/", "design language"),
  page("/raioviajante/repository-conventions/", "repository conventions"),
];

// A guide with several pages under it, followed by another guide.
const nested = [
  page("/projects/a/", "a"),
  page("/projects/a/cli/", "cli reference", true),
  page("/projects/a/config/", "configuration", true),
  page("/projects/b/", "b"),
  page("/projects/b/api/", "api", true),
];

test("numbers top-level pages and every page listed under them distinctly", () => {
  assert.deepEqual(navNumbers(current), ["01.", "01.1", "02.", "03."]);
  assert.deepEqual(navNumbers(nested), ["01.", "01.1", "01.2", "02.", "02.1"]);
});

test("a sub page with no page before it is an error, not a silent number", () => {
  assert.throws(() => navNumbers([page("/x/", "x", true)]), /no page before it/);
});

test("a sub page is listed under the nearest top-level page before it", () => {
  assert.equal(parentIndex(current, 1), 0);
  assert.equal(parentIndex(nested, 2), 0);
  assert.equal(parentIndex(nested, 4), 3);
  assert.equal(parentIndex(current, 0), undefined);
  assert.equal(parentIndex(current, 2), undefined);
});

test("a top-level page knows the pages listed under it", () => {
  assert.deepEqual(childIndexes(current, 0), [1]);
  assert.deepEqual(childIndexes(current, 2), []);
  assert.deepEqual(childIndexes(nested, 0), [1, 2]);
  assert.deepEqual(childIndexes(nested, 1), []);
});

test("breadcrumbs use the folder, the linked parent and the page's own label", () => {
  assert.deepEqual(breadcrumb(current, 1, "projects"), [
    { label: "projects" },
    { label: "sweep", href: "/projects/sweep/" },
    { label: "cli reference" },
  ]);
  assert.deepEqual(breadcrumb(current, 0, "projects"), [{ label: "projects" }, { label: "sweep" }]);
  assert.deepEqual(breadcrumb(nested, 2, "projects"), [
    { label: "projects" },
    { label: "a", href: "/projects/a/" },
    { label: "configuration" },
  ]);
  assert.deepEqual(breadcrumb(current, 2, "raioviajante"), [
    { label: "raioviajante" },
    { label: "design language" },
  ]);
});
