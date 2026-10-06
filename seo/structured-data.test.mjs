import assert from "node:assert/strict";
import test from "node:test";
import {
  breadcrumbJsonLd,
  identity,
  jsonLdScript,
  personJsonLd,
  personRef,
  websiteJsonLd,
} from "./structured-data.ts";

test("identity is absolute, on the root host, and the single Person id", () => {
  assert.equal(identity.url, "https://raioviajante.com/");
  assert.equal(identity.id, "https://raioviajante.com/#person");
  assert.equal(personRef()["@id"], personJsonLd()["@id"]);
  assert.deepEqual(personJsonLd().sameAs, ["https://github.com/RaioViajante"]);
  // Nothing beyond name, url and the profile is published.
  assert.deepEqual(Object.keys(personJsonLd()).sort(), [
    "@id",
    "@type",
    "name",
    "sameAs",
    "url",
  ]);
});

test("a WebSite references the person and has no SearchAction", () => {
  const site = websiteJsonLd("https://lab.raioviajante.com", "lab", "d");
  assert.equal(site["@id"], "https://lab.raioviajante.com/#website");
  assert.equal(site.url, "https://lab.raioviajante.com/");
  assert.equal(site.author["@id"], identity.id);
  assert.ok(!("potentialAction" in site));
});

test("JSON-LD serializes to one parseable graph that cannot close its script", () => {
  const body = jsonLdScript({ "@type": "Thing", name: "</script><b>" });
  assert.ok(!body.includes("<"));
  assert.deepEqual(JSON.parse(body), {
    "@context": "https://schema.org",
    "@graph": [{ "@type": "Thing", name: "</script><b>" }],
  });
});

test("breadcrumbs are numbered with absolute URLs", () => {
  const list = breadcrumbJsonLd("https://docs.raioviajante.com", [
    ["docs", "/"],
    ["Sweep", "/projects/sweep/"],
  ]);
  assert.deepEqual(
    list.itemListElement.map((item) => item.position),
    [1, 2],
  );
  assert.equal(
    list.itemListElement[1].item,
    "https://docs.raioviajante.com/projects/sweep/",
  );
});
