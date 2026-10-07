// Which commits a run must check. Pure: no git, no environment of its own.
// `kind: "skip"` is a deliberate non-check with a reason; it is never an error.
const ZERO = /^0+$/;
const SHA = /^[0-9a-f]{40}$/i;

/**
 * @param {{ event?: string, base?: string, head?: string, before?: string,
 *   after?: string, from?: string, to?: string }} input
 * @returns {{ kind: "range", from: string, to: string } | { kind: "skip", reason: string }}
 */
export function resolveRange(input) {
  const { event, base, head, before, after, from, to } = input;
  if (!event) {
    return { kind: "range", from: from || "origin/main", to: to || "HEAD" };
  }
  if (event === "pull_request") {
    if (!SHA.test(base ?? "") || !SHA.test(head ?? "")) {
      throw new Error("pull_request needs the base and head commit SHAs");
    }
    return { kind: "range", from: base, to: head };
  }
  if (event === "push") {
    // Only a branch's first push has no previous commit: GitHub reports an
    // all-zero SHA. Anything else that is not a SHA is a tooling mistake, and a
    // check that quietly passes there would let commits through unchecked.
    if (ZERO.test(before ?? "x")) {
      return {
        kind: "skip",
        reason: "this push created the branch, so there is no previous commit",
      };
    }
    if (!SHA.test(before ?? "") || !SHA.test(after ?? "")) {
      throw new Error("push needs the before and after commit SHAs");
    }
    return { kind: "range", from: before, to: after };
  }
  return {
    kind: "skip",
    reason: `no commit range exists for a ${event} run`,
  };
}
