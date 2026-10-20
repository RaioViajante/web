import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  QUERY,
  compareLive,
  resolveStrict,
} from "./verify-giscus-identity.mjs";

const snapshot = JSON.parse(
  readFileSync(
    new URL(
      "../tests/fixtures/giscus-discussions-snapshot.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const [recorded] = snapshot.discussions;
const marker = (term) => createHash("sha1").update(term).digest("hex");
const live = (over = {}) => ({
  id: snapshot.repository.id,
  discussions: {
    totalCount: 1,
    nodes: [
      {
        number: recorded.number,
        id: recorded.nodeId,
        url: recorded.url,
        title: recorded.title,
        body: `# ${recorded.title}\n\n<!-- sha1: ${recorded.strictMarker} -->`,
        category: { id: recorded.categoryId },
        comments: {
          totalCount: 1,
          nodes: [{ id: recorded.comments[0].nodeId }],
        },
        ...over,
      },
    ],
  },
});

test("the query reads only", () => {
  assert.doesNotMatch(QUERY, /\bmutation\b/i);
  assert.match(QUERY, /^query\b/);
});

test("the recorded discussion resolves from its key", () => {
  assert.deepEqual(compareLive(snapshot, live()), []);
});

test("a matching title alone does not resolve", () => {
  const nodes = live({ body: "no marker here" }).discussions.nodes;
  assert.equal(
    resolveStrict(`posts/${recorded.contentId}`, recorded.categoryId, nodes)
      .length,
    0,
  );
  assert.match(
    compareLive(snapshot, live({ body: "no marker here" })).join(),
    /resolves 0/,
  );
});

test("a different discussion under the same key is rejected", () => {
  const problems = compareLive(
    snapshot,
    live({ number: 99, id: "D_other" }),
  ).join();
  assert.match(problems, /instead/);
});

test("a lost comment, a moved category and missing data all fail closed", () => {
  assert.match(
    compareLive(
      snapshot,
      live({ comments: { totalCount: 0, nodes: [] } }),
    ).join(),
    /dropped/,
  );
  assert.match(
    compareLive(snapshot, live({ category: { id: "DIC_other" } })).join(),
    /resolves 0/,
  );
  assert.match(compareLive(snapshot, undefined).join(), /unproven/);
});

test("an unrecorded discussion in the category is reported", () => {
  const repository = live();
  repository.discussions.nodes.push({
    ...repository.discussions.nodes[0],
    number: 15,
    id: "D_new",
    body: `<!-- sha1: ${marker("posts/new")} -->`,
  });
  assert.match(compareLive(snapshot, repository).join(), /#15 is in Comments/);
});
