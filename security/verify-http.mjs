import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { contentSecurityPolicy, securityHeaders } from "./headers.ts";
import { ports, startServers } from "./local-servers.mjs";

// Run against the built apps (`pnpm -r build`): Next start (3002/3001) and
// Astro preview (4321/4322), reused if already running and otherwise started
// and stopped here. This checks HTTP/HTML, not browser execution or Vercel rollout.
const { stop } = await startServers();
process.on("exit", stop);
const nonces = new Set();
let documents = 0;
let assets = 0;

for (const [site, port] of Object.entries(ports)) {
  const origin = `http://127.0.0.1:${port}`;
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  const paths = [
    ...new Set([
      "/",
      ...(site === "root" || site === "dump"
        ? ["/phase4-missing", "/og/phase4-missing.png"]
        : ["/404.html"]),
      ...[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
        ([, url]) => new URL(url).pathname,
      ),
    ]),
  ];
  const resources = new Set([
    "/favicon.ico",
    "/icon-192.png",
    "/apple-touch-icon.png",
    "/manifest.webmanifest",
    "/robots.txt",
    "/sitemap.xml",
    "/search-index.json",
    "/og/index.png",
  ]);
  if (site === "root" || site === "dump") {
    for (const headers of [
      { "next-router-prefetch": "1", purpose: "prefetch" },
      { RSC: "1" },
    ]) {
      const response = await fetch(origin + "/", { headers });
      assert.equal(response.status, 200);
      assert.match(response.headers.get("Content-Security-Policy"), /'nonce-/);
      assert.match(response.headers.get("Cache-Control"), /no-store/);
      if (headers.RSC)
        assert.match(response.headers.get("Content-Type"), /text\/x-component/);
      await response.arrayBuffer();
    }
  }
  if (site === "dump") resources.add("/rss.xml").add("/giscus.css");

  for (const path of paths) {
    const response = await fetch(origin + path, {
      headers: {
        "x-nonce": "untrusted",
        "Content-Security-Policy": "script-src 'unsafe-inline'",
      },
    });
    assert.equal(
      response.status,
      path.includes("phase4-missing") ? 404 : 200,
      `${site} ${path}`,
    );
    for (const { key, value } of securityHeaders(site))
      assert.equal(response.headers.get(key), value, `${site} ${path} ${key}`);
    const csp = response.headers.get("Content-Security-Policy");
    const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
    const html = await response.text();
    if (site === "root" || site === "dump") {
      assert.ok(nonce, `${site} ${path}: missing nonce`);
      assert.equal(Buffer.from(nonce, "base64").length, 16);
      assert.ok(!nonces.has(nonce), "reused nonce");
      nonces.add(nonce);
      assert.match(response.headers.get("Cache-Control"), /private.*no-store/);
      const repeat = await fetch(origin + path);
      assert.notEqual(
        repeat.headers.get("Content-Security-Policy"),
        csp,
        "nonce reused across requests",
      );
      await repeat.arrayBuffer();
    } else assert.equal(nonce, undefined);
    assert.equal(csp, contentSecurityPolicy(site, nonce));
    for (const [, attributes] of html.matchAll(/<script\b([^>]*)>/g)) {
      // JSON-LD is data, not executed, so the CSP does not govern it.
      if (/\btype="application\/ld\+json"/.test(attributes)) continue;
      if (nonce)
        assert.ok(
          attributes.includes(`nonce="${nonce}"`),
          `${site} ${path}: script missing nonce`,
        );
      else
        assert.match(
          attributes,
          /src="\/_astro\//,
          `${site} ${path}: inline script`,
        );
    }
    for (const [, value] of html.matchAll(/\sstyle="([^"]*)"/g)) {
      const hash = createHash("sha256").update(value).digest("base64");
      assert.ok(
        csp.includes(`'sha256-${hash}'`),
        `${site} ${path}: unlisted style ${value}`,
      );
    }
    for (const [, url] of html.matchAll(
      /(?:src|href)="(\/_(?:next\/static|astro)\/[^"?]+)"/g,
    ))
      resources.add(url);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${site} ${path}: h1`);
    documents++;
  }
  for (const path of resources) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, `${site}: ${path}`);
    for (const { key, value } of securityHeaders(site))
      assert.equal(response.headers.get(key), value, `${site} ${path} ${key}`);
    assert.ok(
      response.headers.get("Content-Security-Policy"),
      `${site} ${path}: CSP`,
    );
    if (site === "dump" && path === "/giscus.css")
      assert.equal(
        response.headers.get("Access-Control-Allow-Origin"),
        "https://giscus.app",
      );
    await response.arrayBuffer();
    assets++;
  }
  console.log(
    `${site}: ${paths.length} documents, ${resources.size} asset/metadata endpoints passed`,
  );
}
console.log(
  `Passed: ${documents} documents, ${assets} assets, ${nonces.size} unique 128-bit nonces plus repeated-request checks.`,
);
stop();
