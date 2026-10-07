import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { appFromCwd, apps, decide } from "./vercel-ignore.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, "vercel-ignore.mjs");
const BUILD = 1; // Vercel: exit 1 continues the build
const SKIP = 0; // Vercel: exit 0 cancels it

// A throwaway repository shaped like this one. The real history is never touched.
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "vercel-ignore-"));
  const git = (...args) => {
    const r = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    return r.stdout.trim();
  };
  git("init", "-q", "-b", "main");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "test");
  git("config", "commit.gpgsign", "false");
  const put = (path, text) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  };
  for (const app of apps) put(`apps/${app}/index.txt`, app);
  for (const path of [
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "packages/design/a.ts",
    "packages/other/a.ts",
    "security/headers.ts",
    "seo/metadata.ts",
    "site/sites.ts",
    "docs/readme.md",
  ]) {
    put(path, "v1");
  }
  mkdirSync(join(dir, "security"), { recursive: true });
  copyFileSync(script, join(dir, "security/vercel-ignore.mjs"));
  git("add", "-A");
  git("commit", "-q", "-m", "chore: base");
  const base = git("rev-parse", "HEAD");
  return {
    dir,
    base,
    change(path) {
      put(path, `changed ${Math.random()}`);
      git("add", "-A");
      git("commit", "-q", "-m", `chore: change ${path}`);
    },
    run(app, previousSha) {
      const env = { ...process.env };
      delete env.VERCEL_GIT_PREVIOUS_SHA;
      if (previousSha !== undefined) env.VERCEL_GIT_PREVIOUS_SHA = previousSha;
      return spawnSync("node", ["../../security/vercel-ignore.mjs"], {
        cwd: join(dir, "apps", app),
        env,
        encoding: "utf8",
      });
    },
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

function withFixture(fn) {
  const f = fixture();
  try {
    return fn(f);
  } finally {
    f.cleanup();
  }
}

test("a change inside an app rebuilds that app and only that app", () =>
  withFixture((f) => {
    f.change("apps/docs/index.txt");
    assert.equal(f.run("docs", f.base).status, BUILD);
    for (const other of ["root", "dump", "lab"]) {
      assert.equal(f.run(other, f.base).status, SKIP, other);
    }
  }));

test("shared inputs rebuild every app", () => {
  for (const path of [
    "packages/design/a.ts",
    "security/headers.ts",
    "seo/metadata.ts",
    "site/sites.ts",
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "security/vercel-ignore.mjs", // the rule itself
  ]) {
    withFixture((f) => {
      f.change(path);
      for (const app of apps) {
        assert.equal(f.run(app, f.base).status, BUILD, `${path} -> ${app}`);
      }
    });
  }
});

test("files nothing depends on skip every app", () =>
  withFixture((f) => {
    f.change("docs/readme.md");
    f.change("packages/other/a.ts");
    for (const app of apps) assert.equal(f.run(app, f.base).status, SKIP, app);
  }));

test("no change at all skips", () =>
  withFixture((f) => {
    for (const app of apps) assert.equal(f.run(app, f.base).status, SKIP, app);
  }));

test("an untrustworthy previous commit always builds", () =>
  withFixture((f) => {
    const missing = "1234567890abcdef1234567890abcdef12345678";
    for (const sha of [
      undefined,
      "",
      "not-a-sha",
      "abc123",
      `${f.base};ls`,
      missing,
    ]) {
      for (const app of apps) {
        assert.equal(f.run(app, sha).status, BUILD, `${app} ${sha}`);
      }
    }
  }));

test("running somewhere that is not an app builds", () =>
  withFixture((f) => {
    const r = spawnSync("node", ["security/vercel-ignore.mjs"], {
      cwd: f.dir,
      env: { ...process.env, VERCEL_GIT_PREVIOUS_SHA: f.base },
    });
    assert.equal(r.status, BUILD);
  }));

test("decide() builds when git itself fails", () => {
  const sha = "a".repeat(40);
  const git = (...args) => ({ status: args[0] === "cat-file" ? 0 : 128 });
  assert.equal(decide({ app: "root", previousSha: sha, git }).build, true);
  assert.equal(
    decide({ app: "nope", previousSha: sha, git: () => ({ status: 0 }) }).build,
    true,
  );
});

test("appFromCwd only accepts apps/<name>", () => {
  assert.equal(appFromCwd("/r", "/r/apps/lab"), "lab");
  assert.equal(appFromCwd("/r", "/r"), undefined);
  assert.equal(appFromCwd("/r", "/r/apps/lab/src"), undefined);
});

test("every project calls the same short script command", () => {
  const commands = ["root", "dump", "docs", "lab"].map(
    (app) =>
      JSON.parse(readFileSync(join(here, `../apps/${app}/vercel.json`), "utf8"))
        .ignoreCommand,
  );
  assert.equal(new Set(commands).size, 1);
  assert.equal(commands[0], "node ../../security/vercel-ignore.mjs");
});

test("the script needs only Node and git, so it can run before install", () => {
  const imports = [
    ...readFileSync(script, "utf8").matchAll(/from "([^"]+)"/g),
  ].map((m) => m[1]);
  assert.ok(
    imports.every((name) => name.startsWith("node:")),
    imports.join(),
  );
});
