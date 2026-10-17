import { describe, expect, it } from "vitest";
import { LOCALE_IDS } from "../../../site/locales";
import { SITES } from "../../../site/sites";
import { catalogFor, catalogs, type SharedCatalog } from "../catalog";

// Same key shape, any leaf kind: strings stay strings, functions stay functions.
function shape(value: unknown): unknown {
  if (typeof value === "function") return "function";
  if (typeof value === "string") return "string";
  return Object.fromEntries(
    Object.entries(value as object).map(([k, v]) => [k, shape(v)]),
  );
}

describe("shared catalogs", () => {
  it("has exactly one catalog per registry locale", () => {
    expect(Object.keys(catalogs).sort()).toEqual([...LOCALE_IDS].sort());
  });

  it("has the same keys in every locale", () => {
    const [first, ...rest] = LOCALE_IDS;
    for (const id of rest)
      expect(shape(catalogs[id])).toEqual(shape(catalogs[first!]));
  });

  it("has a non-empty string for every leaf and a search prompt for every site", () => {
    const check = (value: unknown, path: string) => {
      if (typeof value === "string") expect(value.trim(), path).not.toBe("");
      else if (typeof value === "function") return;
      else
        for (const [k, v] of Object.entries(value as object))
          check(v, `${path}.${k}`);
    };
    for (const id of LOCALE_IDS) {
      check(catalogs[id], id);
      for (const site of SITES)
        expect(catalogs[id].search.prompts[site.id]).toBeTruthy();
    }
  });

  it("returns Portuguese for pt-BR and does not reuse English strings for shared chrome", () => {
    const en = catalogFor("en");
    const pt = catalogFor("pt-BR");
    expect(pt.shell.pages).toBe("PÁGINAS");
    expect(pt.shell.onThisPage).toBe("NESTA PÁGINA");
    expect(pt.pager.previous).toBe("← Anterior");
    expect(pt.sound.off).toBe("DESLIGADO");
    for (const key of ["skip", "pages", "onThisPage", "experiments"] as const)
      expect(pt.shell[key]).not.toBe(en.shell[key]);
    for (const key of ["terms", "privacy"] as const)
      expect(pt.footer[key]).not.toBe(en.footer[key]);
    expect(pt.search.prompts.docs).not.toBe(en.search.prompts.docs);
  });

  it("refuses an unsupported locale instead of falling back to English", () => {
    expect(() => catalogFor("fr" as never)).toThrow(RangeError);
    expect(() => catalogFor(undefined as never)).toThrow(RangeError);
  });

  it("requires every locale and key at compile time", () => {
    // @ts-expect-error a locale missing from the registry-keyed record
    const missingLocale: Record<"en" | "pt-BR", SharedCatalog> = {
      en: catalogs.en,
    };
    // @ts-expect-error a catalog missing a required key
    const missingKey: SharedCatalog = { ...catalogs.en, pager: { aria: "x" } };
    expect([missingLocale, missingKey]).toHaveLength(2);
  });

  it("has no runtime English fallback branch", async () => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(
      new URL("../catalog.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toMatch(
      /\?\?\s*catalogs\.en|\|\|\s*catalogs\.en|DEFAULT_LOCALE/,
    );
  });
});
