// Lint commit messages in a range with commitlint.
//   pnpm commits:check                     origin/main..HEAD (or main..HEAD)
//   pnpm commits:check -- --from A --to B  an explicit range
// In CI, set COMMITS_EVENT plus the SHAs from the event; see docs/ci.md.
import { spawnSync } from "node:child_process";
import { resolveRange } from "./range.mjs";

const git = (...args) => spawnSync("git", args, { encoding: "utf8" });
const exists = (ref) =>
  git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`).status === 0;

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function main() {
  const event = process.env.COMMITS_EVENT;
  let range;
  try {
    range = resolveRange({
      event,
      base: process.env.COMMITS_BASE,
      head: process.env.COMMITS_HEAD,
      before: process.env.COMMITS_BEFORE,
      after: process.env.COMMITS_AFTER,
      from: arg("from"),
      to: arg("to"),
    });
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  if (range.kind === "skip") {
    console.log(`Commit messages not checked: ${range.reason}.`);
    return 0;
  }
  let { from, to } = range;
  if (!event && !arg("from") && !exists(from)) from = "main";
  for (const ref of [from, to]) {
    if (!exists(ref)) {
      if (event === "push" && ref === from) {
        console.error(
          `The previous commit ${from} is not in this clone, so the pushed commits cannot be identified. ` +
            "A forced push can cause this; fetch full history or check the commits locally.",
        );
        return 2;
      }
      console.error(
        `Unknown commit: ${ref}. Fetch enough history or pass --from/--to.`,
      );
      return 2;
    }
  }
  const count = Number(git("rev-list", "--count", `${from}..${to}`).stdout);
  if (!count) {
    console.log(`No commits in ${from}..${to}.`);
    return 0;
  }
  console.log(
    `Checking ${count} commit message${count === 1 ? "" : "s"} in ${from}..${to}`,
  );
  return (
    spawnSync(
      "pnpm",
      [
        "exec",
        "commitlint",
        "--config",
        "commitlint.config.mjs",
        "--from",
        from,
        "--to",
        to,
      ],
      { stdio: "inherit" },
    ).status ?? 1
  );
}

process.exit(main());
