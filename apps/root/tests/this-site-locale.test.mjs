import assert from "node:assert/strict";
import test from "node:test";
import { pageMetadata } from "../../../seo/metadata.ts";
import { localizedPath } from "../../../site/locales.ts";
import { ABOUT_SITES_PATH } from "../../../site/sites.ts";
import { ptPageSeo, ptThisSite } from "../lib/pt.ts";
import { counterpartsOf, declaredPages, routes } from "../lib/routes.ts";

const origin = "https://raioviajante.com";

test("This Site metadata forms a reciprocal English and Portuguese cluster", () => {
  const english = pageMetadata(origin, "raioviajante", {
    path: "/this-site",
    title: "this site",
    description:
      "How raioviajante.com is built, designed and connected to dump, docs and lab.",
    locale: "en",
    counterparts: counterpartsOf("this-site", "en"),
  });
  const portuguese = pageMetadata(origin, "raioviajante", {
    path: "/pt/this-site",
    ...ptPageSeo["this-site"],
    locale: "pt-BR",
    counterparts: counterpartsOf("this-site", "pt-BR"),
  });
  const languages = {
    en: `${origin}/this-site`,
    "pt-BR": `${origin}/pt/this-site`,
    "x-default": `${origin}/this-site`,
  };

  assert.deepEqual(english.alternates, {
    canonical: "/this-site",
    languages,
  });
  assert.deepEqual(portuguese.alternates, {
    canonical: "/pt/this-site",
    languages,
  });
  assert.equal(portuguese.title.absolute, "este site — raioviajante");
  assert.equal(portuguese.openGraph.locale, "pt_BR");
  assert.deepEqual(portuguese.openGraph.alternateLocale, ["en_US"]);
  assert.equal(portuguese.openGraph.url, `${origin}/pt/this-site`);
  assert.equal(
    portuguese.openGraph.images[0].url,
    `${origin}/og/pt/this-site.png`,
  );
});

test("the other sites' footer link reaches this page in both languages", () => {
  assert.equal(routes["this-site"].en, ABOUT_SITES_PATH);
  assert.equal(
    routes["this-site"]["pt-BR"],
    localizedPath("root", "pt-BR", ABOUT_SITES_PATH),
  );
});

test("the Portuguese page describes Dump, Docs and Lab, each with its own link", () => {
  assert.deepEqual(
    ptThisSite.otherSites.map(({ id }) => id),
    ["dump", "docs", "lab"],
  );
  for (const site of ptThisSite.otherSites) {
    assert.ok(new URL(site.link.href).host.startsWith(`${site.id}.`));
    assert.ok(site.built.length > 0);
  }
});

test("the localized This Site page is part of the indexable page inventory", () => {
  assert.deepEqual(
    declaredPages()
      .filter(({ key }) => key === "this-site")
      .map(({ locale, path }) => ({ locale, path })),
    [
      { locale: "en", path: "/this-site" },
      { locale: "pt-BR", path: "/pt/this-site" },
    ],
  );
});
