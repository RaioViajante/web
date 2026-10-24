import assert from "node:assert/strict";
import test from "node:test";
import { pageMetadata } from "../../../seo/metadata.ts";
import { ptPageSeo } from "../lib/pt.ts";
import { counterpartsOf, declaredPages } from "../lib/routes.ts";

const origin = "https://raioviajante.com";

test("Setup metadata forms a reciprocal English and Portuguese cluster", () => {
  const english = pageMetadata(origin, "raioviajante", {
    path: "/setup",
    title: "setup",
    description:
      "The computers, tools and software in RaioViajante\u2019s working setup.",
    locale: "en",
    counterparts: counterpartsOf("setup", "en"),
  });
  const portuguese = pageMetadata(origin, "raioviajante", {
    path: "/pt/setup",
    ...ptPageSeo["setup"],
    locale: "pt-BR",
    counterparts: counterpartsOf("setup", "pt-BR"),
  });
  const languages = {
    en: `${origin}/setup`,
    "pt-BR": `${origin}/pt/setup`,
    "x-default": `${origin}/setup`,
  };

  assert.deepEqual(english.alternates, {
    canonical: "/setup",
    languages,
  });
  assert.deepEqual(portuguese.alternates, {
    canonical: "/pt/setup",
    languages,
  });
  assert.equal(portuguese.title.absolute, "setup — raioviajante");
  assert.equal(portuguese.openGraph.locale, "pt_BR");
  assert.deepEqual(portuguese.openGraph.alternateLocale, ["en_US"]);
  assert.equal(portuguese.openGraph.url, `${origin}/pt/setup`);
  assert.equal(portuguese.openGraph.images[0].url, `${origin}/og/pt/setup.png`);
});

test("the localized Setup page is part of the indexable page inventory", () => {
  assert.deepEqual(
    declaredPages()
      .filter(({ key }) => key === "setup")
      .map(({ locale, path }) => ({ locale, path })),
    [
      { locale: "en", path: "/setup" },
      { locale: "pt-BR", path: "/pt/setup" },
    ],
  );
});
