import { ports, startServers } from "../security/local-servers.mjs";
import { siteOrigins } from "../site/sites.ts";
import dumpConfig from "../apps/dump/next.config.mjs";
import { typeOk } from "./content-types.mjs";
import {
  anchors,
  classify,
  cssUrls,
  fragmentTargets,
  resources,
} from "./extract.mjs";

// Deterministic internal link and first-party resource check over the local
// production builds. The page list is each app's sitemap plus its search page;
// RaioViajante URLs (relative or on any of the four production hosts) are
// mapped to the local servers, so no DNS or internet is needed. External links
// are validated for syntax only (see `pnpm links:external` for a live check).
// Exit 1 on a broken link, 2 if the apps cannot start.
const sites = Object.keys(ports);
const searchPath = {
  root: "/search",
  dump: "/search",
  docs: "/search/",
  lab: "/search/",
};
const local = (app, path) => `http://127.0.0.1:${ports[app]}${path}`;

// Intentional redirects come from the app's own config, so this cannot drift.
const redirects = new Map();
for (const r of await dumpConfig.redirects())
  redirects.set(`dump ${r.source}`, {
    to: r.destination,
    permanent: r.permanent,
  });

const { stop } = await startServers();
process.on("exit", stop);

const problems = new Map(); // message -> sources
const note = (message, source) =>
  problems.set(message, [...(problems.get(message) ?? []), source]);
const stats = {
  pages: 0,
  links: 0,
  internal: 0,
  external: new Set(),
  mailto: 0,
  resources: 0,
  fragments: 0,
  redirectsFollowed: 0,
};

const docs = new Map(); // "app path" -> html
async function html(app, path) {
  const key = `${app} ${path}`;
  if (docs.has(key)) return docs.get(key);
  const response = await fetch(local(app, path), { redirect: "manual" });
  const text = response.status === 200 ? await response.text() : undefined;
  docs.set(key, text);
  return text;
}

// 1. Pages.
const pages = [];
for (const app of sites) {
  const xml = await (await fetch(local(app, "/sitemap.xml"))).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, loc]) => new URL(loc).pathname,
  );
  for (const path of new Set([...paths, searchPath[app]])) {
    const text = await html(app, path);
    if (text === undefined)
      note(`page is not served (HTTP != 200)`, `[${app}] ${path}`);
    else pages.push({ app, path, text });
  }
}
stats.pages = pages.length;

// 2. Collect link and resource targets, deduplicated.
const targets = new Map(); // "app path" -> { kind, sources:Set, hashes:Set, linkKind }
const addTarget = (app, path, kind, source, hash) => {
  const key = `${app} ${path}`;
  const entry = targets.get(key) ?? {
    app,
    path,
    kinds: new Set(),
    sources: new Set(),
    hashes: new Set(),
  };
  entry.kinds.add(kind);
  entry.sources.add(source);
  if (hash) entry.hashes.add(hash);
  targets.set(key, entry);
};
for (const { app, path, text } of pages) {
  const source = `[${app}] ${path}`;
  const ids = fragmentTargets(text);
  for (const href of anchors(text)) {
    stats.links++;
    const c = classify(href, app, path);
    if (c.kind === "bad") note(c.reason, source);
    else if (c.kind === "external") stats.external.add(c.url);
    else if (c.kind === "mailto") stats.mailto++;
    else if (c.kind === "fragment") {
      stats.fragments++;
      if (!ids.has(c.hash))
        note(`same-page fragment #${c.hash} has no target`, source);
    } else if (c.kind === "internal") {
      stats.internal++;
      addTarget(c.app, c.path, "link", source, c.hash);
    }
  }
  for (const { url, kind } of resources(text)) {
    stats.resources++;
    const c = classify(url, app, path);
    if (c.kind === "internal") addTarget(c.app, c.path, kind, source);
    else if (c.kind === "bad") note(c.reason, source);
    else note(`${kind} is not first-party: ${url.slice(0, 80)}`, source);
  }
}

// 3. Resolve every target once.
const queue = [...targets.values()];
const stylesheets = [];
async function resolve(entry) {
  const { app, path } = entry;
  const where =
    [...entry.sources][0] +
    (entry.sources.size > 1 ? ` (+${entry.sources.size - 1} more)` : "");
  let response;
  try {
    response = await fetch(local(app, path), { redirect: "manual" });
  } catch (error) {
    return note(
      `${path}: request failed (${error.cause?.code ?? error.message})`,
      where,
    );
  }
  if (response.status >= 300 && response.status < 400) {
    const known = redirects.get(`${app} ${path}`);
    const location = response.headers.get("location") ?? "";
    if (!known) {
      const dest = location.replace(local(app, ""), "");
      return note(
        `link to ${path} redirects (HTTP ${response.status}) to ${dest}; link to the destination directly`,
        where,
      );
    }
    // An intentional redirect: it must really be permanent and land on a live page.
    if (response.status !== 308 && response.status !== 301)
      note(
        `${path}: intentional redirect is not permanent (HTTP ${response.status})`,
        where,
      );
    note(`link to the redirect ${path}; link to ${known.to} directly`, where);
    const next = classify(known.to, app, path);
    if (next.kind === "internal") {
      stats.redirectsFollowed++;
      const target = await fetch(local(next.app, next.path), {
        redirect: "manual",
      });
      if (target.status !== 200)
        note(
          `${path}: redirect target ${known.to} answered HTTP ${target.status}`,
          where,
        );
      await target.arrayBuffer();
    }
    return void (await response.arrayBuffer());
  }
  if (response.status !== 200) {
    await response.arrayBuffer();
    return note(`${path}: HTTP ${response.status}`, where);
  }
  const type = response.headers.get("content-type") ?? "";
  const body = Buffer.from(await response.arrayBuffer());
  if (!body.length) note(`${path}: empty response`, where);
  for (const kind of entry.kinds) {
    if (
      kind !== "link" &&
      kind !== "other" &&
      typeOk[kind] &&
      !typeOk[kind].test(type)
    )
      note(`${kind} ${path} has content type ${JSON.stringify(type)}`, where);
    if (kind === "stylesheet")
      stylesheets.push({ app, path, css: body.toString("utf8") });
  }
  if (entry.hashes.size) {
    if (!/^text\/html/.test(type))
      return note(`${path}: fragment on a non-HTML target`, where);
    const ids = fragmentTargets(body.toString("utf8"));
    for (const hash of entry.hashes) {
      stats.fragments++;
      if (!ids.has(hash))
        note(`${path}#${hash}: no element with that id`, where);
    }
  }
}
async function pool(items, size, worker) {
  const iterator = items[Symbol.iterator]();
  await Promise.all(
    Array.from({ length: size }, async () => {
      for (const item of iterator) await worker(item);
    }),
  );
}
await pool(queue, 10, resolve);

// 4. Fonts and images referenced from the stylesheets themselves.
const cssTargets = new Map();
for (const { app, path, css } of stylesheets)
  for (const ref of cssUrls(css)) {
    const c = classify(
      new URL(ref, `${siteOrigins[app]}${path}`).href,
      app,
      path,
    );
    if (c.kind === "internal")
      cssTargets.set(`${c.app} ${c.path}`, {
        app: c.app,
        path: c.path,
        kinds: new Set(["font-or-image"]),
        sources: new Set([`[${app}] ${path} (CSS)`]),
        hashes: new Set(),
      });
    else if (c.kind === "bad") note(c.reason, `[${app}] ${path} (CSS)`);
    else
      note(
        `stylesheet references a non-first-party URL: ${ref.slice(0, 80)}`,
        `[${app}] ${path}`,
      );
  }
await pool(
  [...cssTargets.values()].filter((e) => !targets.has(`${e.app} ${e.path}`)),
  10,
  resolve,
);
stats.resources += cssTargets.size;

// 5. Known redirects must really exist (the config is the source of truth).
for (const [key, r] of redirects) {
  const [app, source] = key.split(" ");
  const response = await fetch(local(app, source), { redirect: "manual" });
  if (response.status !== 308 && response.status !== 301)
    note(
      `${source}: configured redirect answered HTTP ${response.status}`,
      `[${app}] next.config`,
    );
  else if (response.headers.get("location") !== r.to)
    note(
      `${source}: redirects to ${response.headers.get("location")}, config says ${r.to}`,
      `[${app}] next.config`,
    );
  await response.arrayBuffer();
}

// 6. Optional, observational: ask the external sites. Never part of the gate:
// remote sites rate-limit, block bots and go down, and none of that is ours to
// fix. A 404 or 410 is reported as "likely broken"; everything else is info.
if (process.argv.includes("--external")) {
  const verdicts = [];
  await pool([...stats.external], 4, async (url) => {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
        headers: {
          "user-agent": "raioviajante-link-check/1 (+https://raioviajante.com)",
        },
      });
      await response.arrayBuffer();
      const label = response.ok
        ? "ok"
        : [403, 429, 999].includes(response.status)
          ? "blocked or rate limited"
          : [404, 410].includes(response.status)
            ? "LIKELY BROKEN"
            : "unexpected";
      verdicts.push(`${label.padEnd(24)} HTTP ${response.status} ${url}`);
    } catch (error) {
      verdicts.push(
        `${"unreachable".padEnd(24)} ${error.cause?.code ?? error.name} ${url}`,
      );
    }
  });
  console.log(
    `\nExternal links (observational, never fails the run):\n${verdicts
      .sort()
      .map((v) => `  ${v}`)
      .join("\n")}`,
  );
}

stop();
console.log(
  `${stats.pages} pages, ${stats.links} links (${stats.internal} internal, ${stats.external.size} distinct external, ${stats.mailto} mailto), ${stats.fragments} fragment checks, ${targets.size + cssTargets.size} distinct internal targets and first-party resources (${stats.resources} references), ${redirects.size} known redirects.`,
);
if (problems.size) {
  console.error(`\nFAILED (${problems.size}):`);
  for (const [message, sources] of problems)
    console.error(
      `  - ${[...new Set(sources)][0]}${sources.length > 1 ? ` (+${new Set(sources).size - 1} more)` : ""}: ${message}`,
    );
  process.exitCode = 1;
} else console.log("All internal links and first-party resources resolve.");
