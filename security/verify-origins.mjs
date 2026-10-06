import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  classify,
  frameInternalOrigins,
  judge,
  sites,
  siblingOrigins,
  violations,
} from "./network-origins.ts";
import { ports, startServers } from "./local-servers.mjs";

// Runtime network-origin check. Not part of `pnpm validate`: it needs built
// apps, local sockets and Firefox. Run `pnpm security:origins` after
// `pnpm -r build`. It drives Firefox over WebDriver BiDi, so no dependency is
// added. Exit codes: 0 pass, 1 policy violation or failed expectation,
// 2 environment missing (nothing was verified).
const searchPath = {
  root: "/search",
  dump: "/search",
  docs: "/search/",
  lab: "/search/",
};
const local = (site) => `http://${site}.localhost:${ports[site]}`;
const ownOrigins = (site) => [local(site)];

const firefox = [
  process.env.FIREFOX_BIN,
  "/Applications/Firefox.app/Contents/MacOS/firefox",
  "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox",
  "/usr/bin/firefox",
].find((path) => path && existsSync(path));
if (!firefox) {
  console.error("Firefox not found (set FIREFOX_BIN). Nothing was verified.");
  process.exit(2);
}

const { stop: stopServers } = await startServers();

const profile = await mkdtemp(join(tmpdir(), "rv-origins-"));
const browser = spawn(
  firefox,
  [
    "--headless",
    "--no-remote",
    "--remote-debugging-port",
    "9223",
    "--profile",
    profile,
  ],
  { stdio: "ignore" },
);
const cleanup = () => {
  browser.kill();
  stopServers();
};
process.on("exit", cleanup);

let ws;
for (let i = 0; i < 40 && !ws; i++) {
  await new Promise((r) => setTimeout(r, 500));
  ws = await new Promise((resolve) => {
    const socket = new WebSocket("ws://127.0.0.1:9223/session");
    socket.onopen = () => resolve(socket);
    socket.onerror = () => resolve(null);
  });
}
if (!ws) {
  console.error("Could not connect to Firefox WebDriver BiDi.");
  process.exit(2);
}
let id = 0;
const pending = new Map();
let requests = [];
let top;
const frameHosts = new Map();
ws.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  } else if (message.method === "network.beforeRequestSent") {
    const { context } = message.params;
    const url = message.params.request.url;
    const frame = context !== top;
    // A frame's first request is its own document: that is the frame host.
    if (frame && !frameHosts.has(context))
      frameHosts.set(context, new URL(url).origin);
    requests.push({ url, frame, frameHost: frameHosts.get(context) });
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const n = ++id;
    pending.set(n, resolve);
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await send("session.new", {
  capabilities: { alwaysMatch: { webSocketUrl: true } },
});
await send("session.subscribe", { events: ["network.beforeRequestSent"] });
top = (await send("browsingContext.getTree")).result.contexts[0].context;
const evaluate = async (expression) =>
  (
    await send("script.evaluate", {
      expression,
      target: { context: top },
      awaitPromise: true,
      resultOwnership: "none",
    })
  ).result?.result?.value;
async function visit(url) {
  requests = [];
  await send("browsingContext.navigate", {
    context: top,
    url,
    wait: "complete",
  });
  await send("browsingContext.setViewport", {
    context: top,
    viewport: { width: 1440, height: 900 },
    devicePixelRatio: 1,
  });
}

const observed = [];
const failures = [];
const record = (app, page, state = "page") =>
  observed.push(...requests.map((r) => ({ ...r, app, page, state })));
let pages = 0;

// 1. Every sitemap document in every app.
for (const site of sites) {
  const xml = await (
    await fetch(`http://127.0.0.1:${ports[site]}/sitemap.xml`)
  ).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, url]) => new URL(url).pathname,
  );
  for (const path of paths) {
    await visit(local(site) + path);
    await sleep(1500);
    let state = "page";
    if (site === "dump" && path.startsWith("/posts/")) {
      // Short articles legitimately load comments on arrival (within 200px).
      const near = await evaluate(
        "(() => { const c = document.querySelector('.comments'); return c ? c.getBoundingClientRect().top <= innerHeight + 200 : null })()",
      );
      if (near === null) failures.push(`dump ${path}: no comments region`);
      const contacted = requests.some((r) =>
        r.url.startsWith("https://giscus.app/"),
      );
      if (near) {
        await sleep(4000);
        state = "comments";
      } else if (contacted)
        failures.push(
          `dump ${path}: giscus contacted although the comments are far from the viewport`,
        );
    }
    record(site, path, state);
    pages++;
  }
}

// 2. Search "everywhere" in every app: this is what reads sibling indexes.
const siblingsSeen = {};
for (const site of sites) {
  await visit(local(site) + searchPath[site]);
  await sleep(1000);
  requests = [];
  await evaluate(
    `(() => { document.querySelector('[data-search-scope="everywhere"]').click(); const i = document.querySelector('[data-search-input]'); i.value = 'a'; i.dispatchEvent(new Event('input', { bubbles: true })); })()`,
  );
  await sleep(2500);
  record(site, `${searchPath[site]} (scope everywhere)`);
  siblingsSeen[site] = new Set(
    requests.flatMap((r) => {
      const c = classify(r.url, site, "page", ownOrigins(site));
      return c.kind === "sibling" ? [c.origin] : [];
    }),
  );
}

// 3. Lab: press every experiment control once.
const labXml = await (
  await fetch(`http://127.0.0.1:${ports.lab}/sitemap.xml`)
).text();
for (const [, url] of labXml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const path = new URL(url).pathname;
  if (!path.startsWith("/experiments/")) continue;
  await visit(local("lab") + path);
  await sleep(1000);
  requests = [];
  await evaluate(
    "document.querySelectorAll('main button').forEach((b) => { try { b.click() } catch {} })",
  );
  await sleep(1000);
  record("lab", `${path} (every control pressed)`);
}

// 4. Dump comments, explicit states, on an article whose comments start far below the fold.
const articles = [
  ...(
    await (await fetch(`http://127.0.0.1:${ports.dump}/sitemap.xml`)).text()
  ).matchAll(/<loc>([^<]+\/posts\/[^<]+)<\/loc>/g),
].map(([, u]) => new URL(u).pathname);
let long;
for (const path of articles) {
  const html = await (await fetch(local("dump") + path)).text();
  if (/giscus\.app\/client\.js|<iframe|<script[^>]+giscus/.test(html))
    failures.push(
      `dump ${path}: initial HTML contains a giscus script or frame`,
    );
  if (long) continue;
  await visit(local("dump") + path);
  await sleep(1500);
  const far = await evaluate(
    "document.querySelector('.comments').getBoundingClientRect().top > innerHeight + 600",
  );
  if (far) long = path;
}
if (!long)
  failures.push(
    "dump: no article with comments far below the viewport to test",
  );
else {
  await visit(local("dump") + long);
  await sleep(3000);
  const before = requests.filter(
    (r) =>
      classify(r.url, "dump", "page", ownOrigins("dump")).kind ===
        "third-party" || /giscus|github/.test(r.url),
  );
  if (before.length)
    failures.push(
      `dump ${long}: ${before.length} giscus/GitHub request(s) before the trigger`,
    );
  record("dump", `${long} (before comments trigger)`, "page");
  if (process.env.ORIGINS_SKIP_THIRD_PARTY) {
    console.log(
      "Skipped the giscus states (ORIGINS_SKIP_THIRD_PARTY): they need the public internet.",
    );
  } else {
    // After the trigger: the page may contact giscus.app; the frame must be
    // served from giscus.app; what the frame loads is reported only.
    requests = [];
    await evaluate("document.querySelector('#comments').scrollIntoView(); 1");
    await sleep(7000);
    const hosts = new Set(requests.map((r) => new URL(r.url).origin));
    if (!hosts.has("https://giscus.app"))
      failures.push(
        `dump ${long}: expected https://giscus.app after the trigger, saw ${[...hosts].join(", ")}`,
      );
    if (requests.filter((r) => r.url.endsWith("/client.js")).length !== 1)
      failures.push(
        `dump ${long}: giscus client.js was not requested exactly once`,
      );
    if (![...frameHosts.values()].includes("https://giscus.app"))
      failures.push(
        `dump ${long}: no frame was served from https://giscus.app`,
      );
    record("dump", `${long} (after comments trigger)`, "comments");

    // Returning from GitHub sign-in: `?giscus=` loads giscus at once, with no
    // scroll, so giscus can finish the sign-in. A made-up value is enough to
    // see the load; no real token is used or stored.
    await visit(`${local("dump")}${long}?giscus=origins-check`);
    await sleep(7000);
    // Judge by the DOM: giscus.js may come from the HTTP cache after the
    // earlier state, which produces no network request to count.
    const state = JSON.parse(
      await evaluate(
        "JSON.stringify({ scripts: document.querySelectorAll('script[src*=\"giscus.app\"]').length, frames: document.querySelectorAll('iframe.giscus-frame').length, scrolled: window.scrollY })",
      ),
    );
    if (state.scripts !== 1 || state.frames < 1 || state.scrolled !== 0)
      failures.push(
        `dump ${long}?giscus=…: expected giscus to load once without scrolling on a sign-in return, got ${JSON.stringify(state)}`,
      );
    record("dump", `${long}?giscus=… (sign-in return, no scroll)`, "comments");
  }
}

// Classify everything.
const stateOf = (item) => item.state;
failures.push(...violations(observed, stateOf, ownOrigins));
// An allowance nobody uses is as suspicious as an unexpected request.
for (const site of sites)
  for (const origin of siblingOrigins(site))
    if (!siblingsSeen[site].has(origin))
      failures.push(
        `app ${site}: sibling ${origin} is allowed but search "everywhere" never requested it`,
      );

const origins = new Map();
for (const item of observed) {
  const v = judge(item, item.state, ownOrigins(item.app));
  const key = `${item.app} ${v.verdict === "fail" ? "FAIL" : v.kind} ${v.origin}`;
  origins.set(key, (origins.get(key) ?? 0) + 1);
}
const internal = frameInternalOrigins(observed, stateOf, ownOrigins);
for (const [origin, count] of [...internal].sort())
  console.log(`frame-internal (reported, not enforced) ${origin} (${count})`);
for (const [key, count] of [...origins].sort())
  console.log(`${key} (${count} requests)`);
console.log(`${pages} sitemap pages, ${observed.length} requests inspected`);

ws.close();
if (failures.length) {
  console.error(`\nFAILED:\n${failures.map((f) => `  - ${f}`).join("\n")}`);
  process.exitCode = 1;
}
cleanup();
