import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { siteOrigins } from "../site/sites.ts";
import {
  checkSecurityTxt,
  renderSecurityTxt,
  securityTxt,
  securityTxtPath,
} from "./security-txt.ts";

const sites = ["root", "dump", "docs", "lab"];

test("all four hosts are covered", () => {
  assert.deepEqual(Object.keys(siteOrigins).sort(), [...sites].sort());
});

for (const site of sites) {
  test(`${site}: committed security.txt matches the source and is valid`, async () => {
    const file = new URL(
      `../apps/${site}/public${securityTxtPath}`,
      import.meta.url,
    );
    const text = await readFile(file, "utf8");
    assert.equal(text, renderSecurityTxt(site));
    assert.deepEqual(checkSecurityTxt(site, text), []);
    assert.match(text, /^Contact: mailto:mail@raioviajante\.com$/m);
    assert.match(text, /^Preferred-Languages: en, pt$/m);
    assert.match(
      text,
      new RegExp(
        `^Canonical: ${siteOrigins[site]}/\\.well-known/security\\.txt$`,
        "m",
      ),
    );
    assert.doesNotMatch(text, /<|\*\*|^#/m);
  });
}

test("expiry guard", () => {
  const text = renderSecurityTxt("root");
  const expires = Date.parse(securityTxt.expires);
  const at = (days) => new Date(expires - days * 86_400_000);
  assert.deepEqual(checkSecurityTxt("root", text, at(300)), []);
  assert.match(checkSecurityTxt("root", text, at(29))[0], /renew/);
  assert.match(checkSecurityTxt("root", text, at(-1))[0], /expired/);
  assert.match(checkSecurityTxt("root", text, at(400))[0], /year/);
});

test("rejects malformed and duplicated fields", () => {
  const good = renderSecurityTxt("docs");
  const cases = [
    ["﻿" + good, /BOM/],
    [good + "Expires: 2028-01-01T00:00:00Z\n", /duplicate expires/],
    [good.replace("Expires:", "Expires"), /malformed/],
    [good.replace("\n", "\r\n"), /LF/],
    [good.trimEnd(), /final newline/],
    [good.replace("docs.", "lab."), /canonical/],
    [good.replace("2027-10-01T00:00:00Z", "soon"), /RFC 3339/],
  ];
  for (const [text, pattern] of cases)
    assert.match(checkSecurityTxt("docs", text).join("\n"), pattern);
});
