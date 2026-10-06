import { readFile, readdir } from "node:fs/promises";

// Shipped (client-reachable) source: app code and the shared design package,
// without tests, build output or dependencies.
export const sourceRoots = [
  ...["root", "dump", "docs", "lab"].flatMap((app) =>
    ["app", "src", "components", "lib", "pages"].map((d) => `apps/${app}/${d}`),
  ),
  "packages/design",
];
const skip = new Set(["node_modules", "tests", ".next", "dist", ".astro"]);

export async function* sources(path) {
  const base = new URL(`../${path}/`, import.meta.url);
  let entries;
  try {
    entries = await readdir(base, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (skip.has(entry.name)) continue;
    if (entry.isDirectory()) yield* sources(`${path}/${entry.name}`);
    else if (/\.(tsx?|astro|mjs|js|css)$/.test(entry.name))
      yield [
        `${path}/${entry.name}`,
        await readFile(new URL(entry.name, base), "utf8"),
      ];
  }
}

export async function* shippedSources() {
  for (const root of sourceRoots) yield* sources(root);
}
