import assert from "node:assert/strict";
import test from "node:test";
import { pageMetadata } from "../../../seo/metadata.ts";
import { ptPageSeo } from "../lib/pt.ts";
import { counterpartsOf, declaredPages } from "../lib/routes.ts";

const origin = "https://raioviajante.com";

test("Gallery metadata forms a reciprocal English and Portuguese cluster", () => {
  const english = pageMetadata(origin, "raioviajante", {
    path: "/gallery",
    title: "gallery",
    description:
      "A personal collection of character artwork, illustrations and visual experiments.",
    locale: "en",
    counterparts: counterpartsOf("gallery", "en"),
  });
  const portuguese = pageMetadata(origin, "raioviajante", {
    path: "/pt/gallery",
    ...ptPageSeo["gallery"],
    locale: "pt-BR",
    counterparts: counterpartsOf("gallery", "pt-BR"),
  });
  const languages = {
    en: `${origin}/gallery`,
    "pt-BR": `${origin}/pt/gallery`,
    "x-default": `${origin}/gallery`,
  };

  assert.deepEqual(english.alternates, {
    canonical: "/gallery",
    languages,
  });
  assert.deepEqual(portuguese.alternates, {
    canonical: "/pt/gallery",
    languages,
  });
  assert.equal(portuguese.title.absolute, "galeria — raioviajante");
  assert.equal(portuguese.openGraph.locale, "pt_BR");
  assert.deepEqual(portuguese.openGraph.alternateLocale, ["en_US"]);
  assert.equal(portuguese.openGraph.url, `${origin}/pt/gallery`);
  assert.equal(
    portuguese.openGraph.images[0].url,
    `${origin}/og/pt/gallery.png`,
  );
});

test("the localized Gallery page is part of the indexable page inventory", () => {
  assert.deepEqual(
    declaredPages()
      .filter(({ key }) => key === "gallery")
      .map(({ locale, path }) => ({ locale, path })),
    [
      { locale: "en", path: "/gallery" },
      { locale: "pt-BR", path: "/pt/gallery" },
    ],
  );
});
