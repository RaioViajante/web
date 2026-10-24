import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { pageMetadata } from "../../../seo/metadata.ts";
import { CONTACT } from "../../../site/sites.ts";
import { ptPageSeo } from "../lib/pt.ts";
import { counterpartsOf, declaredPages } from "../lib/routes.ts";

const origin = "https://raioviajante.com";
const english = {
  terms: {
    title: "terms of use",
    description:
      "Terms of Use for raioviajante.com: scope, content, code and external destinations.",
  },
  privacy: {
    title: "privacy policy",
    description:
      "Privacy Policy for raioviajante.com: preferences, data, contact and your rights.",
  },
};

for (const key of ["terms", "privacy"]) {
  test(`${key} metadata forms a reciprocal English and Portuguese cluster`, () => {
    const en = pageMetadata(origin, "raioviajante", {
      path: `/${key}`,
      ...english[key],
      locale: "en",
      counterparts: counterpartsOf(key, "en"),
    });
    const pt = pageMetadata(origin, "raioviajante", {
      path: `/pt/${key}`,
      ...ptPageSeo[key],
      locale: "pt-BR",
      counterparts: counterpartsOf(key, "pt-BR"),
    });
    const languages = {
      en: `${origin}/${key}`,
      "pt-BR": `${origin}/pt/${key}`,
      "x-default": `${origin}/${key}`,
    };
    assert.deepEqual(en.alternates, { canonical: `/${key}`, languages });
    assert.deepEqual(pt.alternates, { canonical: `/pt/${key}`, languages });
    assert.equal(pt.openGraph.locale, "pt_BR");
    assert.equal(pt.openGraph.url, `${origin}/pt/${key}`);
    assert.equal(pt.openGraph.images[0].url, `${origin}/og/pt/${key}.png`);
    assert.deepEqual(
      declaredPages()
        .filter((page) => page.key === key)
        .map(({ locale, path }) => ({ locale, path })),
      [
        { locale: "en", path: `/${key}` },
        { locale: "pt-BR", path: `/pt/${key}` },
      ],
    );
  });

  // The translation must not add, drop or alter a fact: structure, dates,
  // contact data and external references are compared with the English source.
  test(`${key} Portuguese page carries the same facts as the English source`, () => {
    const en = readFileSync(
      new URL(`../app/${key}/page.tsx`, import.meta.url),
      "utf8",
    );
    const pt = readFileSync(
      new URL(`../app/pt/${key}/page.tsx`, import.meta.url),
      "utf8",
    );
    const count = (source, pattern) => (source.match(pattern) ?? []).length;
    assert.equal(
      count(pt, /^\s{12}title: "/gm),
      count(en, /^\s{12}title: "/gm),
    );
    assert.equal(count(pt, /label: "/g), count(en, /label: "/g));
    assert.equal(count(pt, /<p(?:\s[^>]*)?>/g), count(en, /<p(?:\s[^>]*)?>/g));
    const external = (source) =>
      (source.match(/href="(?:mailto:|https:)[^"]+"/g) ?? []).sort();
    assert.deepEqual(external(pt), external(en));
  });
}

test("legal contact facts match site/ and the last-updated dates are unchanged", () => {
  const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
  const terms = read("../app/pt/terms/page.tsx");
  const privacy = read("../app/pt/privacy/page.tsx");
  assert.ok(terms.includes(`mailto:${CONTACT.email}`));
  assert.ok(privacy.includes(`mailto:${CONTACT.email}`));
  assert.ok(privacy.includes(`CNPJ ${CONTACT.cnpj}`));
  assert.match(read("../app/terms/page.tsx"), /October 24, 2026/);
  assert.match(terms, /"24 de outubro de 2026"/);
  assert.match(read("../app/privacy/page.tsx"), /October 24, 2026/);
  assert.match(privacy, /"24 de outubro de 2026"/);
});

test("both languages disclose affiliate links, the legacy sound value and cross-host search", () => {
  const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
  const normalized = (path) => read(path).replace(/\s+/g, " ");
  assert.match(normalized("../app/terms/page.tsx"), /affiliate links/);
  assert.match(normalized("../app/pt/terms/page.tsx"), /links de afiliado/);
  const en = normalized("../app/privacy/page.tsx");
  const pt = normalized("../app/pt/privacy/page.tsx");
  assert.match(en, /local storage/);
  assert.match(pt, /armazenamento local/);
  assert.match(en, /search indexes of the other raioviajante sites/);
  assert.match(pt, /índices de busca dos outros sites raioviajante/);
  // The English and Portuguese documents state no hosting practice or precedence clause.
  for (const text of [
    en,
    pt,
    normalized("../app/terms/page.tsx"),
    normalized("../app/pt/terms/page.tsx"),
  ])
    assert.doesNotMatch(
      text,
      /Vercel|prevalece|prevails|precedence|precedência/i,
    );
});
