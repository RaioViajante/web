import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../../site/locales";
import { SITES, type SiteId } from "../../../site/sites";
import {
  formatSearchDate,
  normalizeSearchText,
  searchIndexPath,
  searchLocaleHref,
  searchPagePath,
  validateIndex,
} from "../search/locale";

const entry = (site: SiteId, locale?: unknown) => ({
  site,
  locale,
  title: "t",
  href: "/x",
  description: "d",
});

describe("search paths", () => {
  it.each([
    ["root", "en", "/search", "/search-index.json"],
    ["root", "pt-BR", "/pt/search", "/pt/search-index.json"],
    ["dump", "en", "/search", "/search-index.json"],
    ["dump", "pt-BR", "/pt/search", "/pt/search-index.json"],
    ["docs", "en", "/search/", "/search-index.json"],
    ["docs", "pt-BR", "/pt/search/", "/pt/search-index.json"],
    ["lab", "en", "/search/", "/search-index.json"],
    ["lab", "pt-BR", "/pt/search/", "/pt/search-index.json"],
  ] as const)("%s %s", (site, locale, page, index) => {
    expect(searchPagePath(site, locale)).toBe(page);
    expect(searchIndexPath(site, locale)).toBe(index);
  });

  it("never prefixes English or doubles a prefix", () => {
    for (const { id } of SITES)
      for (const locale of LOCALE_IDS) {
        for (const path of [
          searchPagePath(id, locale),
          searchIndexPath(id, locale),
        ]) {
          expect(path).not.toContain("/en");
          expect(path).not.toContain("/pt/pt");
        }
      }
  });
});

describe("validateIndex", () => {
  it("accepts the requested site and locale, and an empty index", () => {
    expect(validateIndex([entry("docs", "en")], "docs", "en")).toHaveLength(1);
    expect(
      validateIndex([entry("docs", "pt-BR")], "docs", "pt-BR"),
    ).toHaveLength(1);
    expect(validateIndex([], "docs", "pt-BR")).toEqual([]);
  });

  it.each([
    ["wrong site", [entry("lab", "en")], "en"],
    ["wrong locale", [entry("docs", "en")], "pt-BR"],
    ["missing locale", [entry("docs")], "en"],
    ["null locale", [entry("docs", null)], "en"],
    ["unsupported locale", [entry("docs", "fr")], "en"],
    ["en-US spelling", [entry("docs", "en-US")], "en"],
    [
      "one bad entry among good ones",
      [entry("docs", "en"), entry("docs", "pt-BR")],
      "en",
    ],
  ] as const)("rejects %s", (_name, data, locale) => {
    expect(() => validateIndex(data, "docs", locale as LocaleId)).toThrow();
  });

  it("rejects a non-array", () => {
    expect(() => validateIndex({}, "docs", "en")).toThrow();
    expect(() => validateIndex(null, "docs", "en")).toThrow();
  });
});

describe("normalizeSearchText", () => {
  it("lower-cases and folds accents the same way in both locales", () => {
    for (const locale of LOCALE_IDS) {
      expect(normalizeSearchText("Configuração AÇÃO Café", locale)).toBe(
        "configuracao acao cafe",
      );
    }
    expect(normalizeSearchText("", "en")).toBe("");
  });
});

describe("formatSearchDate", () => {
  it("formats the same calendar day with the registry locale, in UTC", () => {
    expect(formatSearchDate("2026-09-03", "en")).toBe("September 3, 2026");
    expect(formatSearchDate("2026-09-03", "pt-BR")).toBe(
      "3 de setembro de 2026",
    );
    expect(formatSearchDate("2026-01-01", "en")).toBe("January 1, 2026");
    expect(formatSearchDate("2026-12-31", "pt-BR")).toBe(
      "31 de dezembro de 2026",
    );
  });

  it("leaves a value that is not a plain date alone", () => {
    expect(formatSearchDate("soon", "en")).toBe("soon");
    expect(formatSearchDate("2026-13-45", "en")).toBe("2026-13-45");
  });
});

describe("searchLocaleHref", () => {
  const both = () => true;
  it("carries q only, in the host's trailing-slash form", () => {
    expect(searchLocaleHref("root", "en", "pt-BR", "sweep", both)).toBe(
      "/pt/search?q=sweep",
    );
    expect(searchLocaleHref("docs", "pt-BR", "en", "sweep", both)).toBe(
      "/search/?q=sweep",
    );
    expect(searchLocaleHref("lab", "en", "pt-BR", "x", both)).toBe(
      "/pt/search/?q=x",
    );
  });

  it("encodes spaces and unicode, trims, and omits an empty q", () => {
    expect(
      searchLocaleHref("root", "en", "pt-BR", " configuração nova ", both),
    ).toBe("/pt/search?q=configura%C3%A7%C3%A3o+nova");
    expect(searchLocaleHref("docs", "en", "pt-BR", "   ", both)).toBe(
      "/pt/search/",
    );
  });

  it("advertises nothing unless the host participates in both locales", () => {
    expect(searchLocaleHref("root", "en", "pt-BR", "q")).toBe("/pt/search?q=q");
    expect(searchLocaleHref("docs", "en", "pt-BR", "q")).toBe(
      "/pt/search/?q=q",
    );
    expect(searchLocaleHref("lab", "en", "pt-BR", "q")).toBe("/pt/search/?q=q");
    expect(
      searchLocaleHref("root", "en", "pt-BR", "q", (_s, l) => l === "en"),
    ).toBeUndefined();
    expect(
      searchLocaleHref("root", "pt-BR", "en", "q", (_s, l) => l === "en"),
    ).toBeUndefined();
  });

  it("never carries other parameters or a hash", () => {
    const href = searchLocaleHref(
      "dump",
      "en",
      "pt-BR",
      "a&scope=everywhere#top",
      both,
    )!;
    expect(href).toBe("/pt/search?q=a%26scope%3Deverywhere%23top");
    expect(
      new URL(href, "https://x.invalid").searchParams.keys().next().value,
    ).toBe("q");
  });
});
