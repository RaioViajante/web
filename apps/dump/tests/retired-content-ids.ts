// Works retired by an explicit editorial decision, by contentId. Their source
// is gone, but their pre-migration RSS identity stays reserved in
// `LEGACY_ENGLISH_CONTENT_IDS`, so tests that cross-check that list against
// published posts must set these aside.
export const RETIRED_CONTENT_IDS = [
  "a-toml-file-changed-what-sweep-was",
  "an-execution-is-more-than-a-row-in-a-database",
  "apparently-moving-a-file-has-edge-cases",
  "building-orbit",
] as const;

export const stillPublishedLegacyIds = (legacy: readonly string[]) =>
  legacy.filter(
    (id) => !(RETIRED_CONTENT_IDS as readonly string[]).includes(id),
  );
