import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { shippedSources } from "./source-files.mjs";

// Evidence for docs/privacy-storage.md: every browser-storage API in shipped
// source, and every third-party script origin, must be on this list. Adding a
// new use fails here until the inventory and the privacy pages are reviewed.
const apis = {
  "document.cookie": ["packages/design/sound/preference.ts"],
  localStorage: ["packages/design/sound/preference.ts"], // legacy value, read once
  sessionStorage: [],
  indexedDB: [],
  serviceWorker: [],
  "caches.": [],
  cookieStore: [],
  sendBeacon: [],
};

test("browser storage APIs appear only where the inventory says", async () => {
  const found = Object.fromEntries(
    Object.keys(apis).map((k) => [k, new Set()]),
  );
  for await (const [file, text] of shippedSources())
    for (const api of Object.keys(apis))
      if (text.includes(api)) found[api].add(file);
  for (const [api, files] of Object.entries(apis))
    assert.deepEqual([...found[api]].sort(), files, api);
});

test("the cookie is written only by an explicit preference change", async () => {
  const preference = await readFile(
    new URL("../packages/design/sound/preference.ts", import.meta.url),
    "utf8",
  );
  const player = await readFile(
    new URL("../packages/design/sound/player.ts", import.meta.url),
    "utf8",
  );
  assert.equal(preference.match(/document\.cookie =/g)?.length, 1);
  assert.equal(player.match(/writePreference\(/g)?.length, 1);
  assert.match(
    player,
    /setEnabled\(next\) \{\s+if \(next === enabled\) return;/,
  );
});

test("giscus is the only third-party script and loads from one place", async () => {
  const origins = new Map();
  for await (const [file, text] of shippedSources())
    for (const [, origin] of text.matchAll(
      /["'`](https:\/\/[^/"'`]+)\/[^"'`]*\.js["'`]/g,
    ))
      origins.set(file, [...(origins.get(file) ?? []), origin]);
  assert.deepEqual(
    [...origins],
    [["apps/dump/components/Comments.tsx", ["https://giscus.app"]]],
  );
});

test("no analytics or telemetry dependency is installed", async () => {
  for (const app of ["root", "dump", "docs", "lab"]) {
    const pkg = JSON.parse(
      await readFile(
        new URL(`../apps/${app}/package.json`, import.meta.url),
        "utf8",
      ),
    );
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    assert.deepEqual(
      deps.filter((d) =>
        /analytics|speed-insights|sentry|plausible|posthog|gtag|segment|mixpanel|hotjar/i.test(
          d,
        ),
      ),
      [],
      app,
    );
  }
});

// Keys we do not write. giscus-session is created by the giscus script, and the
// two theme keys belong to switchers that no longer exist. If our own source
// starts touching any of them, the inventory and the privacy copy need review.
test("our source never touches the third-party and legacy storage keys", async () => {
  // The privacy pages may name them; nothing else may.
  const copy = /privacy|PrivacyPage|LegalPages/;
  for await (const [file, text] of shippedSources())
    if (!copy.test(file))
      for (const key of ["giscus-session", "starlight-theme", "lab-theme"])
        assert.ok(!text.includes(key), `${file} references ${key}`);
});

test("there is no theme switching or theme persistence", async () => {
  for await (const [file, text] of shippedSources())
    for (const pattern of [
      /prefers-color-scheme/,
      /dataset\.theme/,
      /\[data-theme/,
      /\bthemeToggle\b/i,
    ])
      assert.ok(!pattern.test(text), `${file} matches ${pattern}`);
});

test("docs/privacy-storage.md names every storage item it covers", async () => {
  const doc = await readFile(
    new URL("../docs/privacy-storage.md", import.meta.url),
    "utf8",
  );
  for (const key of [
    "rv-sound",
    "giscus-session",
    "starlight-theme",
    "lab-theme",
  ])
    assert.ok(
      doc.includes(`\`${key}\``),
      `docs/privacy-storage.md omits ${key}`,
    );
  assert.match(doc, /\.raioviajante\.com/);
});

test("the dump privacy copy discloses the giscus session", async () => {
  const page = await readFile(
    new URL("../apps/dump/app/privacy/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(page, /giscus-session/);
  assert.match(page, /sign in/);
});
