import { createHash } from "node:crypto";

import { GISCUS, commentKey, legacyPathnameTerm } from "./comment-key";

/** One discussion as recorded by the read-only migration snapshot. */
export interface SnapshotDiscussion {
  number: number;
  nodeId: string;
  url: string;
  categoryId: string;
  title: string;
  strictMarker: string;
  commentCount: number;
  comments: { nodeId: string; createdAt: string }[];
  contentId: string;
  legacySlug: string;
}

export interface DiscussionSnapshot {
  repository: { id: string; discussionsTotal: number };
  category: { id: string; name: string };
  discussions: SnapshotDiscussion[];
}

/** giscus's strict marker: the SHA-1 of the mapping term. */
export function strictMarker(term: string): string {
  return createHash("sha1").update(term).digest("hex");
}

/** The discussion's number, in the shape giscus's `data-term` for `specific` mapping resolves. */
export const MANDATORY_DISCUSSION = 14;

/**
 * Every reason the snapshot does not prove that switching to
 * `specific`/`commentKey` keeps each existing discussion attached. Empty means
 * proven. Missing or inconsistent evidence is a problem, never a pass.
 */
export function identityProblems(
  snapshot: DiscussionSnapshot | undefined,
): string[] {
  if (!snapshot?.discussions?.length)
    return ["no discussion snapshot: identity is unproven"];
  const problems: string[] = [];
  if (snapshot.repository.id !== GISCUS.repoId)
    problems.push("snapshot repository is not the configured one");
  if (snapshot.category.id !== GISCUS.categoryId)
    problems.push("snapshot category is not the configured Comments category");
  if (snapshot.discussions.length !== snapshot.repository.discussionsTotal)
    problems.push(
      `snapshot lists ${snapshot.discussions.length} discussions, repository has ${snapshot.repository.discussionsTotal}`,
    );
  const seen = new Set<string>();
  for (const d of snapshot.discussions) {
    const at = `discussion #${d.number}`;
    const key = commentKey(d.contentId);
    if (d.categoryId !== GISCUS.categoryId)
      problems.push(`${at}: not in the configured category`);
    if (key !== legacyPathnameTerm(d.legacySlug))
      problems.push(
        `${at}: key "${key}" differs from legacy term "${legacyPathnameTerm(d.legacySlug)}"`,
      );
    if (strictMarker(key) !== d.strictMarker)
      problems.push(`${at}: SHA-1 of "${key}" is not the recorded marker`);
    if (d.title !== key) problems.push(`${at}: title is not the key`);
    if (d.comments.length !== d.commentCount)
      problems.push(`${at}: comment list disagrees with the count`);
    for (const unique of [`n${d.number}`, d.nodeId, d.strictMarker])
      if (seen.has(unique)) problems.push(`${at}: duplicate identity`);
      else seen.add(unique);
  }
  const mandatory = snapshot.discussions.find(
    (d) => d.number === MANDATORY_DISCUSSION,
  );
  if (!mandatory) problems.push("Discussion #14 is missing from the snapshot");
  else if (mandatory.commentCount < 1)
    problems.push("Discussion #14 has lost its comment");
  return problems;
}
