import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { siteOrigins } from "../site/sites.ts";
import {
  classify,
  createFrameTracker,
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
// Deterministic mode (the blocking CI check) must not touch the internet. The
// policy still sees the logical URLs; the network is controlled twice:
//  - BiDi interception answers requests to a sibling's production origin from
//    the matching local server and fails any other non-local request before it
//    is sent (so a lazy trigger firing early cannot reach giscus);
//  - Firefox is pointed at a trap proxy that records and refuses every
//    connection it is handed, which catches anything BiDi cannot see.
// The loopback (*.localhost, 127.0.0.1) is exempt from proxying.
const deterministic = !!process.env.ORIGINS_SKIP_THIRD_PARTY;
const siteByOrigin = new Map(
  Object.entries(siteOrigins).map(([site, origin]) => [origin, site]),
);
const blockedExternal = new Map();
const trapped = [];
let trap;
if (deterministic) {
  trap = createServer((socket) => {
    socket.once("data", (chunk) => {
      trapped.push(chunk.toString("latin1").split("\r\n")[0].slice(0, 120));
      socket.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
    });
    socket.on("error", () => {});
  });
  await new Promise((resolve) => trap.listen(0, "127.0.0.1", resolve));
}
const isLoopback = (host) =>
  host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1";

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
if (deterministic) {
  const { port } = trap.address();
  const prefs = {
    "network.proxy.type": 1,
    "network.proxy.http": "127.0.0.1",
    "network.proxy.http_port": port,
    "network.proxy.ssl": "127.0.0.1",
    "network.proxy.ssl_port": port,
    "network.proxy.no_proxies_on": "localhost, 127.0.0.1, .localhost",
    "network.proxy.allow_hijacking_localhost": false,
    "app.update.auto": false,
    "app.update.enabled": false,
    "datareporting.healthreport.uploadEnabled": false,
    "toolkit.telemetry.enabled": false,
    "browser.safebrowsing.malware.enabled": false,
    "browser.safebrowsing.phishing.enabled": false,
    "network.captive-portal-service.enabled": false,
    "network.connectivity-service.enabled": false,
    "extensions.update.enabled": false,
    "geo.enabled": false,
    "services.settings.server": "http://127.0.0.1:1/v1",
    "browser.region.network.url": "",
    "browser.search.update": false,
    "media.gmp-provider.enabled": false,
    "media.gmp-manager.url": "",
    "media.gmp-gmpopenh264.enabled": false,
    "browser.safebrowsing.downloads.enabled": false,
    "browser.safebrowsing.blockedURIs.enabled": false,
    "browser.search.suggest.enabled": false,
    "browser.urlbar.suggest.searches": false,
  };
  await writeFile(
    join(profile, "user.js"),
    Object.entries(prefs)
      .map(
        ([key, value]) =>
          `user_pref(${JSON.stringify(key)}, ${JSON.stringify(value)});`,
      )
      .join("\n"),
  );
}
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
let track;
// Answers one intercepted request; see the comment on `deterministic`.
async function control({ request: { request: requestId, url } }) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    parsed = null;
  }
  const origin = parsed?.origin;
  const site = siteByOrigin.get(origin);
  if (!parsed || ["data:", "blob:", "about:"].includes(parsed.protocol)) {
    await send("network.continueRequest", { request: requestId });
  } else if (isLoopback(parsed.hostname)) {
    await send("network.continueRequest", { request: requestId });
  } else if (site) {
    const response = await fetch(
      `http://127.0.0.1:${ports[site]}${parsed.pathname}${parsed.search}`,
    );
    const body = Buffer.from(await response.arrayBuffer());
    const skip = new Set([
      "content-encoding",
      "content-length",
      "transfer-encoding",
      "connection",
    ]);
    await send("network.provideResponse", {
      request: requestId,
      statusCode: response.status,
      reasonPhrase: response.statusText || "OK",
      headers: [...response.headers]
        .filter(([name]) => !skip.has(name))
        .map(([name, value]) => ({ name, value: { type: "string", value } })),
      body: { type: "base64", value: body.toString("base64") },
    });
  } else {
    blockedExternal.set(origin, (blockedExternal.get(origin) ?? 0) + 1);
    await send("network.failRequest", { request: requestId });
  }
}
ws.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  } else if (message.method === "network.beforeRequestSent") {
    const { context, navigation, request } = message.params;
    // A navigation request is a frame's document (first load, later
    // navigation or redirect hop) and replaces that frame's host.
    requests.push(track({ context, url: request.url, navigation }));
    if (message.params.isBlocked) control(message.params);
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
if (deterministic)
  await send("network.addIntercept", { phases: ["beforeRequestSent"] });
top = (await send("browsingContext.getTree")).result.contexts[0].context;
track = createFrameTracker(top);
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
  // Node does not resolve *.localhost (Firefox does, glibc Linux does not).
  const html = await (
    await fetch(`http://127.0.0.1:${ports.dump}${path}`)
  ).text();
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
    if (!requests.some((r) => r.frame && r.frameHost === "https://giscus.app"))
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

if (deterministic) {
  // giscus.app is the one external origin a page may legitimately try (a
  // short article loads comments on arrival); it is blocked, not contacted.
  for (const [origin, count] of [...blockedExternal].sort()) {
    console.log(`blocked before sending (deterministic) ${origin} (${count})`);
    if (origin !== "https://giscus.app")
      failures.push(
        `deterministic mode: a page requested external origin ${origin}`,
      );
  }
  // Page traffic never gets this far (it is intercepted above), so what the
  // trap sees is the browser's own housekeeping, refused. Mozilla's hosts are
  // reported (Mozilla, Cisco OpenH264, Google updater/safe-browsing); any other host means something bypassed the interception.
  const attempts = new Map();
  for (const line of trapped) {
    const host = line.split(" ")[1] ?? line;
    attempts.set(host, (attempts.get(host) ?? 0) + 1);
  }
  for (const [host, count] of [...attempts].sort()) {
    const browserInternal =
      /(^|\.)(mozilla\.(net|com|org)|firefox\.com|openh264\.org|gvt1\.com|googleapis\.com):443$/.test(
        host,
      ) || host === "www.google.com:443";
    console.log(
      `${browserInternal ? "refused browser-internal" : "REFUSED"} ${host} (${count})`,
    );
    if (!browserInternal)
      failures.push(
        `deterministic mode: Firefox tried to leave the machine: ${host}`,
      );
  }
  console.log(
    `deterministic mode: ${blockedExternal.size} external origin(s) blocked in the page, ${attempts.size} host(s) reached the trap proxy`,
  );
  trap.close();
}
ws.close();
if (failures.length) {
  console.error(`\nFAILED:\n${failures.map((f) => `  - ${f}`).join("\n")}`);
  process.exitCode = 1;
}
cleanup();
