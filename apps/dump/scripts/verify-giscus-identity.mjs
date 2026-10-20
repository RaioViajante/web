// Read-only proof that every discussion in the Comments category still
// resolves from its `posts/<contentId>` key: `node scripts/verify-giscus-identity.mjs`.
// Issues one GraphQL *query* through the authenticated `gh` CLI. It never
// creates, edits, comments on, reacts to, moves or deletes anything, and the
// query text below is checked for that in tests.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const QUERY = `query {
  repository(owner: "RaioViajante", name: "web") {
    id
    discussions(first: 100) {
      totalCount
      nodes {
        number
        id
        url
        title
        body
        category { id }
        comments(first: 100) { totalCount nodes { id } }
      }
    }
  }
}`;

const sha1 = (term) => createHash("sha1").update(term).digest("hex");
const MARKER = /<!--\s*sha1:\s*([0-9a-f]{40})\s*-->/;

/**
 * The discussions giscus strict mode would pick for a term: same category and
 * a body marker equal to the term's SHA-1. A title is never consulted.
 */
export function resolveStrict(term, categoryId, discussions) {
  return discussions.filter(
    (d) =>
      d.category.id === categoryId && MARKER.exec(d.body)?.[1] === sha1(term),
  );
}

/** Every way live data fails to match the snapshot; empty means every key resolves its original. */
export function compareLive(snapshot, repository) {
  const problems = [];
  const live = repository?.discussions?.nodes;
  if (!live) return ["no live discussion data: identity is unproven"];
  if (repository.discussions.totalCount > live.length)
    problems.push("live discussions are paginated: inventory incomplete");
  for (const d of snapshot.discussions) {
    const at = `discussion #${d.number}`;
    const found = resolveStrict(`posts/${d.contentId}`, d.categoryId, live);
    if (found.length !== 1)
      problems.push(
        `${at}: key resolves ${found.length} discussions, expected 1`,
      );
    else {
      const [hit] = found;
      if (hit.number !== d.number || hit.id !== d.nodeId)
        problems.push(`${at}: key resolves #${hit.number} (${hit.id}) instead`);
      if (hit.url !== d.url) problems.push(`${at}: URL changed`);
      if (hit.comments.totalCount < d.commentCount)
        problems.push(`${at}: comments dropped to ${hit.comments.totalCount}`);
      for (const c of d.comments)
        if (!hit.comments.nodes.some((n) => n.id === c.nodeId))
          problems.push(`${at}: comment ${c.nodeId} is gone`);
    }
  }
  const known = new Set(snapshot.discussions.map((d) => d.number));
  for (const d of live)
    if (d.category.id === snapshot.category.id && !known.has(d.number))
      problems.push(
        `discussion #${d.number} is in Comments but not in the snapshot`,
      );
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const snapshot = JSON.parse(
    readFileSync(
      new URL(
        "../tests/fixtures/giscus-discussions-snapshot.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const out = execFileSync("gh", ["api", "graphql", "-f", `query=${QUERY}`], {
    encoding: "utf8",
  });
  const result = JSON.parse(out);
  if (result.errors)
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  const problems = compareLive(snapshot, result.data.repository);
  if (problems.length) {
    console.error(`Giscus identity NOT proven:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log(
    `Giscus identity proven: ${snapshot.discussions.length} discussion(s) resolve from their keys.`,
  );
}
