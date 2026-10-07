// Conventional Commits, enforced by CI (see docs/ci.md) and `pnpm commits:check`.
// The standard rules apply, plus `content`: the history uses it for posts.
import conventional from "@commitlint/config-conventional";

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [...conventional.rules["type-enum"][2], "content"],
    ],
  },
};
