import { readFile, writeFile } from "node:fs/promises";
import { staticHeaders } from "./headers.ts";

// Vercel needs literal headers for static Astro files. Keep those literals in
// sync without adding a runtime, adapter, package, or build-time deployment.
for (const site of ["docs", "lab"]) {
  const file = new URL(`../apps/${site}/vercel.json`, import.meta.url);
  const config = JSON.parse(await readFile(file, "utf8"));
  const expected = [{ source: "/(.*)", headers: staticHeaders(site) }];
  if (process.argv.includes("--check")) {
    if (JSON.stringify(config.headers) !== JSON.stringify(expected)) {
      throw new Error(`${site}: run node security/sync-vercel.mjs`);
    }
  } else {
    config.headers = expected;
    await writeFile(file, `${JSON.stringify(config, null, 2)}\n`);
  }
}
