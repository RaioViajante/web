import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// security/minimatch-compat stands in for minimatch 3.1.5, which eslint 9 and
// its plugins ask for, on top of minimatch 11 (docs/security-maintenance.md).
// These tests resolve `minimatch` the way eslint does, so they fail if the
// override stops applying and the vulnerable version comes back.
const root = fileURLToPath(new URL("..", import.meta.url));
const eslintEntry = createRequire(join(root, "apps/root/package.json")).resolve(
  "eslint",
);
const shimEntry = createRequire(eslintEntry).resolve("minimatch");
const shim = createRequire(eslintEntry)("minimatch");

/** The version of the real minimatch the shim delegates to. */
function modernVersion() {
  let dir = dirname(createRequire(shimEntry).resolve("minimatch-modern"));
  // dist/commonjs and dist/esm carry a package.json that only sets the type.
  for (; dirname(dir) !== dir; dir = dirname(dir)) {
    const file = join(dir, "package.json");
    if (!existsSync(file)) continue;
    const pkg = JSON.parse(readFileSync(file, "utf8"));
    if (pkg.name) {
      assert.equal(pkg.name, "minimatch");
      return pkg.version;
    }
  }
  throw new Error("minimatch-modern has no package.json");
}
const atLeast = (version, minimum) => {
  const [a, b] = [version, minimum].map((v) => v.split(".").map(Number));
  for (let i = 0; i < 3; i += 1) if (a[i] !== b[i]) return a[i] > b[i];
  return true;
};

test("eslint resolves minimatch to the shim over a patched release", () => {
  assert.match(shimEntry, /minimatch-compat/);
  assert.ok(
    atLeast(modernVersion(), "11.0.1"),
    `minimatch ${modernVersion()} is below the GHSA-g3hv-75wg-m249 fix`,
  );
});

test("the shim keeps the minimatch 3 call shape eslint and its plugins use", () => {
  assert.equal(typeof shim, "function", "callable: require('minimatch')(...)");
  for (const member of ["Minimatch", "filter", "match", "braceExpand"])
    assert.equal(typeof shim[member], "function", member);
  assert.ok(shim.sep && shim.GLOBSTAR);
});

// Expected values were produced by minimatch 3.1.5 itself.
const cases = [
  ["a.js", "*.js", {}, true],
  ["x/y/z.js", "**/*.js", {}, true],
  [".hidden", "*", {}, false],
  [".hidden", "*", { dot: true }, true],
  ["src/a.js", "src/**", {}, true],
  ["README.md", "!*.md", {}, false],
  ["a/b/d", "a/{b,c}/d", {}, true],
  ["a/x/d", "a/{b,c}/d", {}, false],
  ["b/c.tsx", "**/*.{ts,tsx}", {}, true],
  ["aab.js", "*(a|b).js", {}, true],
  ["src/d.js", "src/[a-c]*.js", {}, false],
  ["#comment", "#comment", {}, false],
  ["#comment", "#comment", { nocomment: true }, true],
  ["x/.env", "**", {}, false],
  ["x/.env", "**", { dot: true }, true],
  ["a/b.js", "*.js", { matchBase: true }, true],
  ["FooBar", "foo*", { nocase: true }, true],
  ["FooBar", "foo*", {}, false],
  ["a.md", "!*.md", { nonegate: true }, false],
  ["a.md", "!*.md", { flipNegate: true }, true],
  ["xa.ts", "{a,b}.ts", { nobrace: true }, false],
];

test("the function and the Minimatch class match what minimatch 3.1.5 matched", () => {
  for (const [path, pattern, options, expected] of cases) {
    const label = `${path} against ${pattern} ${JSON.stringify(options)}`;
    assert.equal(shim(path, pattern, options), expected, label);
    assert.equal(new shim.Minimatch(pattern, options).match(path), expected, label);
  }
  assert.deepEqual(["a.js", "b.md"].filter(shim.filter("*.js")), ["a.js"]);
  assert.deepEqual(shim.match(["a.js", "b.md"], "*.js"), ["a.js"]);
  assert.deepEqual(shim.braceExpand("a{b,c}d"), ["abd", "acd"]);
});

test("the patched pattern preprocessing limit applies through the shim", () => {
  // `**/..` repeated doubles the pattern set at optimizationLevel 2. A release
  // before 11.0.1 ignores braceExpandMax and builds 2^30 sets, so this runs in
  // a child process with a small heap and a deadline instead of in this one.
  const script = `
    const m = require(${JSON.stringify(shimEntry)});
    const pattern = Array(30).fill("**/../a/b").join("/");
    const set = new m.Minimatch(pattern, { optimizationLevel: 2, braceExpandMax: 64 }).set;
    console.log(set.length);`;
  const run = spawnSync(
    process.execPath,
    ["--max-old-space-size=256", "-e", script],
    { encoding: "utf8", timeout: 20_000 },
  );
  assert.equal(run.error, undefined, "finished before the deadline");
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout.trim(), "64");
});

test("known gap: minimatch 11 has no makeRe, so the shim has none", () => {
  // eslint-plugin-import's import/no-internal-modules calls minimatch.makeRe.
  // No app enables that rule. If this starts failing, makeRe was added: check
  // that it matches 3.x before relying on it, then update the documentation.
  assert.equal(shim.makeRe, undefined);
  assert.equal(new shim.Minimatch("*.js").makeRe, undefined);
});
