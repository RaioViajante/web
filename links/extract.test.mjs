import assert from "node:assert/strict";
import test from "node:test";
import {
  anchors,
  classify,
  cssUrls,
  fragmentTargets,
  resources,
} from "./extract.mjs";

test("anchors and resources are extracted with entities decoded", () => {
  const html = `<html><head>
    <link rel="stylesheet" href="/a.css"/><link rel="icon" href="/favicon.ico?v=4"/>
    <link rel="manifest" href="/manifest.webmanifest"/>
    <link rel="preload" href="/f.woff2" as="font" type="font/woff2" crossorigin/>
    <script src="/x.js" async></script></head>
    <body><a href="/p?a=1&amp;b=2">p</a><a href="#top">t</a><a>none</a>
    <img src="/i.png" srcset="/i1.png 1x, /i2.png 2x"/></body></html>`;
  assert.deepEqual(anchors(html), ["/p?a=1&b=2", "#top"]);
  assert.deepEqual(
    resources(html).map((r) => `${r.kind}:${r.url}`),
    [
      "stylesheet:/a.css",
      "icon:/favicon.ico?v=4",
      "manifest:/manifest.webmanifest",
      "font:/f.woff2",
      "script:/x.js",
      "image:/i.png",
      "image:/i1.png",
      "image:/i2.png",
    ],
  );
});

test("css url() references skip data URIs", () => {
  assert.deepEqual(
    cssUrls(
      'a{background:url(data:image/png;base64,AA)} @font-face{src:url("../fonts/a.woff2") format("woff2"),url(b.woff)}',
    ),
    ["../fonts/a.woff2", "b.woff"],
  );
});

test("fragment targets include ids and names", () => {
  assert.deepEqual(
    [...fragmentTargets('<h2 id="a-b"></h2><a name="old"></a>')],
    ["a-b", "old"],
  );
});

test("classification: internal, sibling, external, fragments, mailto and the bad cases", () => {
  const c = (href, app = "docs", path = "/x/") => classify(href, app, path);
  assert.deepEqual(c("/projects/sweep/#install"), {
    kind: "internal",
    app: "docs",
    path: "/projects/sweep/",
    hash: "install",
  });
  assert.deepEqual(c("https://dump.raioviajante.com/posts/a?x=1#c"), {
    kind: "internal",
    app: "dump",
    path: "/posts/a?x=1",
    hash: "c",
  });
  assert.deepEqual(c("../y/", "docs", "/a/b/"), {
    kind: "internal",
    app: "docs",
    path: "/a/y/",
    hash: "",
  });
  assert.deepEqual(c("#section"), { kind: "fragment", hash: "section" });
  assert.equal(c("https://github.com/RaioViajante").kind, "external");
  assert.equal(c("mailto:mail@raioviajante.com").kind, "mailto");
  for (const href of [
    "mailto:nope",
    "javascript:alert(1)",
    "http://localhost:3000/x",
    "https://foo.vercel.app/x",
    "http://127.0.0.1:4321/",
    "http://192.168.1.2/",
    "http://example.com/",
    "https://",
  ])
    assert.equal(c(href).kind, "bad", href);
  assert.equal(c("").kind, "ignored");
});
