// The works with a recorded material update, and the date of that update.
//
// `updatedAt` is explicit and is never derived from Git, the build or the
// clock. These dates were recorded by hand after verifying them against the
// commits that made the updates (author date, converted to UTC, the same
// convention `publishedAt` follows):
//
// - 0d4fc90, 2026-10-30T03:19:55Z: the rollout essay (Portuguese original and
//   English translation) and the ecosystem post (English and Portuguese) got
//   past-tense wording and marked update notes for statements that time had
//   overtaken.
// - ef4f9c6, 2026-10-30T04:47:19Z: the ecosystem post got a second note on
//   "separate repositories".
//
// Every version of an updated work carries the same date. The English
// `split-my-internet-...` was recorded with 2026-10-05 in production before;
// the later update replaces it as the latest material update.
export const VERIFIED_UPDATES: Record<string, string> = {
  "split-my-internet-into-four-different-kinds-of-place": "2026-10-30",
  "traduzir-o-site-sem-fingir-que-tudo-ja-existe": "2026-10-30",
};

/** The `updatedAt` that production recorded for `split-my-internet-...` before. */
export const RECORDED_BEFORE_UPDATE = "2026-10-05";
