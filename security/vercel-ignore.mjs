// Vercel "Ignored Build Step", shared by the four projects:
//   "ignoreCommand": "node ../../security/vercel-ignore.mjs"
// Vercel runs it in the project's Root Directory (apps/<app>) and reads the exit
// code: 1 continues the build, 0 cancels it. So 1 means BUILD and 0 means SKIP,
// and anything we cannot trust means BUILD: a skipped deploy is the costly error.
//
// An app rebuilds when its own directory or shared input changed since
// VERCEL_GIT_PREVIOUS_SHA. This file lives in security/, which is watched, so
// changing the rule rebuilds everything. Only Node and git are needed: it runs
// before dependencies are installed.
import { spawnSync } from "node:child_process";
import { resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const apps = ["root", "dump", "docs", "lab"];

// Repository-relative paths every app depends on. `pnpm-*` is the lockfile and
// the workspace file.
export const sharedPaths = [
  "package.json",
  "pnpm-*",
  "packages/design",
  "security",
  "seo",
  "site",
];

const SHA = /^[0-9a-fA-F]{40}$/;

/**
 * @param {{ app: string | undefined, previousSha: string | undefined,
 *   git: (...args: string[]) => { status: number | null } }} input
 * @returns {{ build: boolean, reason: string }}
 */
export function decide({ app, previousSha, git }) {
  if (!apps.includes(app ?? "")) {
    return { build: true, reason: `cannot tell which app this is (${app})` };
  }
  if (!SHA.test(previousSha ?? "")) {
    return { build: true, reason: "no valid previous deployment commit" };
  }
  if (git("cat-file", "-e", `${previousSha}^{commit}`).status !== 0) {
    return {
      build: true,
      reason: "previous deployment commit is not in this clone",
    };
  }
  const diff = git(
    "diff",
    "--quiet",
    previousSha,
    "HEAD",
    "--",
    `apps/${app}`,
    ...sharedPaths,
  );
  if (diff.status === 0) {
    return { build: false, reason: `nothing relevant to ${app} changed` };
  }
  return {
    build: true,
    reason:
      diff.status === 1 ? `${app} or shared files changed` : "git diff failed",
  };
}

export function appFromCwd(root, cwd) {
  const parts = relative(root, cwd).split(sep);
  return parts.length === 2 && parts[0] === "apps" ? parts[1] : undefined;
}

function main() {
  const root = resolve(fileURLToPath(import.meta.url), "../..");
  const git = (...args) =>
    spawnSync("git", ["-C", root, ...args], { stdio: "ignore" });
  const { build, reason } = decide({
    app: appFromCwd(root, process.cwd()),
    previousSha: process.env.VERCEL_GIT_PREVIOUS_SHA,
    git,
  });
  console.log(`${build ? "Building" : "Skipping"}: ${reason}.`);
  return build ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main());
