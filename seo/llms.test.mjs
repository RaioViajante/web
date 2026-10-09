import assert from "node:assert/strict";
import test from "node:test";
import { siteOrigins } from "../site/sites.ts";
import { llmsResponse } from "./llms.ts";

for (const site of Object.keys(siteOrigins)) {
  test(`${site}: concise plain-text discovery uses canonical public URLs`, async () => {
    const response = llmsResponse(site);
    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get("content-type"),
      "text/plain; charset=utf-8",
    );
    const body = await response.text();
    assert.match(body, /^# .+\n\n> .+\n\n## Public resources\n/);
    assert.ok(body.length < 2000);
    assert.ok(body.endsWith("\n"));
    const urls = [...body.matchAll(/\]\(([^)]+)\)/g)].map((m) => new URL(m[1]));
    assert.ok(urls.length > 0);
    for (const url of urls) {
      assert.ok(Object.values(siteOrigins).includes(url.origin), url.href);
      assert.equal(url.search, "");
      assert.equal(url.hash, "");
      if (site !== "root") assert.equal(url.origin, siteOrigins[site]);
    }
    if (site === "root")
      assert.deepEqual(
        new Set(urls.map((url) => url.origin)),
        new Set(Object.values(siteOrigins)),
      );
  });
}
