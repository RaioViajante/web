import { mkdir, readFile, writeFile } from "node:fs/promises";
import { staticHeaders } from "./headers.ts";
import {
  checkSecurityTxt,
  renderSecurityTxt,
  securityTxtPath,
} from "./security-txt.ts";

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

// security.txt is a static file in each app's public/ directory, rendered from
// the one source in security-txt.ts. Never edit the copies by hand.
for (const site of ["root", "dump", "docs", "lab"]) {
  const file = new URL(
    `../apps/${site}/public${securityTxtPath}`,
    import.meta.url,
  );
  const expected = renderSecurityTxt(site);
  if (process.argv.includes("--check")) {
    const actual = await readFile(file, "utf8").catch(() => undefined);
    if (actual !== expected)
      throw new Error(`${site}: run node security/sync-vercel.mjs`);
    const problems = checkSecurityTxt(site, actual);
    if (problems.length) throw new Error(`${site}: ${problems.join("; ")}`);
  } else {
    await mkdir(new URL("./", file), { recursive: true });
    await writeFile(file, expected);
  }
}
