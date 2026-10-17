import { describe, expect, it, vi } from "vitest";
import type { SearchEntry } from "../components/search";
import type { SiteId } from "../../../site/sites";
import type { LocaleId } from "../../../site/locales";
import {
  loadEverywhere,
  loadSiteIndex,
  searchEntries,
  unavailableNote,
} from "../search/engine";
import { validateIndex } from "../search/locale";

const entry = (
  site: SiteId,
  title: string,
  body?: string,
  locale: LocaleId = "en",
): SearchEntry => ({
  site,
  locale,
  title,
  href: `https://${site}.example/${title}`,
  description: "",
  body,
});

const own = [entry("root", "gallery"), entry("root", "projects")];
const all = () => true;

describe("searchEntries", () => {
  it("returns an entry when searching its known title", () => {
    expect(searchEntries(own, "gallery", "en").map((e) => e.title)).toEqual([
      "gallery",
    ]);
  });

  it("matches case-insensitively, across words and in the body", () => {
    const entries = [entry("dump", "A TOML File", "loading sweep config")];
    expect(searchEntries(entries, "toml SWEEP", "en")).toHaveLength(1);
    expect(searchEntries(entries, "toml orbit", "en")).toHaveLength(0);
  });

  it("returns nothing for an empty query", () => {
    expect(searchEntries(own, "   ", "en")).toEqual([]);
  });

  it("is accent-insensitive in both locales, whichever side carries the accent", () => {
    const pt = [
      entry("docs", "Configuração", "ação do usuário", "pt-BR"),
      entry("docs", "Outro", undefined, "pt-BR"),
    ];
    for (const query of ["configuracao", "CONFIGURAÇÃO", "acao", "ação"])
      expect(searchEntries(pt, query, "pt-BR").map((e) => e.title)).toEqual([
        "Configuração",
      ]);
    const en = [entry("docs", "Café notes"), entry("docs", "cafe")];
    expect(searchEntries(en, "cafe", "en")).toHaveLength(2);
    expect(searchEntries(en, "café", "en")).toHaveLength(2);
    expect(searchEntries(en, "tea", "en")).toHaveLength(0);
  });

  it("uses the requested locale, not the entries', for case folding", () => {
    const entries = [entry("docs", "ISTANBUL", undefined, "pt-BR")];
    expect(searchEntries(entries, "istanbul", "pt-BR")).toHaveLength(1);
    expect(searchEntries(entries, "istanbul", "en")).toHaveLength(1);
  });
});

describe("loadEverywhere", () => {
  it("merges every site that answers", async () => {
    const loaded = await loadEverywhere(
      "root",
      "en",
      own,
      async (site) => [entry(site, `${site}-page`)],
      all,
    );
    expect(loaded.unavailable).toEqual([]);
    expect(loaded.skipped).toEqual([]);
    expect(loaded.entries.map((e) => e.site)).toEqual([
      "root",
      "root",
      "dump",
      "docs",
      "lab",
    ]);
  });

  it("keeps this site's results and names the sites it could not reach", async () => {
    const loaded = await loadEverywhere(
      "root",
      "en",
      own,
      async (site) => {
        if (site === "docs" || site === "lab") throw new Error("offline");
        return [entry(site, "post")];
      },
      all,
    );
    expect(loaded.unavailable).toEqual(["docs", "lab"]);
    expect(searchEntries(loaded.entries, "gallery", "en")).toHaveLength(1);
    expect(unavailableNote(loaded.unavailable)).toBe(
      "couldn't reach docs, lab: showing the rest.",
    );
  });

  it("treats an active empty index as success, not unavailable", async () => {
    const loaded = await loadEverywhere("root", "en", own, async () => [], all);
    expect(loaded.unavailable).toEqual([]);
    expect(loaded.entries).toEqual(own);
  });

  it("uses registry participation by default: English fetches all, Portuguese none", async () => {
    const read = vi.fn(async (site: SiteId) => [entry(site, "x")]);
    const en = await loadEverywhere("docs", "en", [], read);
    expect(read).toHaveBeenCalledTimes(3);
    expect(en.skipped).toEqual([]);
    read.mockClear();
    const pt = await loadEverywhere("docs", "pt-BR", [], read);
    expect(read).not.toHaveBeenCalled();
    expect(pt.skipped).toEqual(["root", "dump", "lab"]);
    expect(pt.unavailable).toEqual([]);
  });

  it("fetches only the sites that participate in a partially active locale", async () => {
    const read = vi.fn(async (site: SiteId) => [
      entry(site, "p", undefined, "pt-BR"),
    ]);
    const loaded = await loadEverywhere(
      "docs",
      "pt-BR",
      [entry("docs", "own", undefined, "pt-BR")],
      read,
      (site) => site === "docs" || site === "dump",
    );
    expect(read.mock.calls.map(([site]) => site)).toEqual(["dump"]);
    expect(loaded.skipped).toEqual(["root", "lab"]);
    expect(loaded.unavailable).toEqual([]);
    expect(loaded.entries.map((e) => e.site)).toEqual(["docs", "dump"]);
  });

  it("marks a host that returns another locale unavailable, without merging it", async () => {
    const loaded = await loadEverywhere(
      "docs",
      "pt-BR",
      [entry("docs", "own", undefined, "pt-BR")],
      async (site) =>
        site === "dump"
          ? [entry("dump", "injected", undefined, "en")]
          : [entry(site, "ok", undefined, "pt-BR")],
      all,
    );
    expect(loaded.unavailable).toEqual(["dump"]);
    expect(loaded.entries.map((e) => e.title)).toEqual(["own", "ok", "ok"]);
  });

  it("marks a host that returns another site's entries unavailable", async () => {
    const loaded = await loadEverywhere(
      "root",
      "pt-BR",
      [],
      async (site) =>
        site === "docs"
          ? [entry("lab", "injected", undefined, "pt-BR")]
          : [entry(site, "ok", undefined, "pt-BR")],
      all,
    );
    expect(loaded.unavailable).toEqual(["docs"]);
    expect(loaded.entries.map((e) => e.title)).not.toContain("injected");
    expect(loaded.entries).toHaveLength(2);
  });

  it.each([
    ["missing locale", { ...entry("dump", "x"), locale: undefined }],
    ["unsupported locale", { ...entry("dump", "x"), locale: "fr" }],
  ])("marks a host with %s unavailable", async (_name, bad) => {
    const loaded = await loadEverywhere(
      "root",
      "en",
      [],
      async (site) => (site === "dump" ? [bad as never] : []),
      all,
    );
    expect(loaded.unavailable).toEqual(["dump"]);
    expect(loaded.entries).toEqual([]);
  });

  it("marks a non-array response unavailable and keeps the others", async () => {
    const loaded = await loadEverywhere(
      "root",
      "en",
      own,
      async (site) => (site === "lab" ? ({} as never) : [entry(site, "ok")]),
      all,
    );
    expect(loaded.unavailable).toEqual(["lab"]);
    expect(loaded.entries).toHaveLength(4);
  });

  it("refuses an invalid own collection instead of merging it", async () => {
    const read = vi.fn(async () => []);
    await expect(
      loadEverywhere(
        "docs",
        "pt-BR",
        [entry("docs", "own", undefined, "en")],
        read,
        all,
      ),
    ).rejects.toThrow();
    await expect(
      loadEverywhere("docs", "en", [entry("lab", "own")], read, all),
    ).rejects.toThrow();
    expect(read).not.toHaveBeenCalled();
  });

  it("gives no note when every site answered", () => {
    expect(unavailableNote([])).toBe("");
  });
});

describe("loadSiteIndex", () => {
  it("never reads a host that does not participate, the current host included", async () => {
    const read = vi.fn(async (site: SiteId) => [
      entry(site, "x", undefined, "pt-BR"),
    ]);
    for (const site of ["root", "dump", "docs", "lab"] as const)
      expect(await loadSiteIndex(site, "pt-BR", read)).toEqual({
        state: "skipped",
      });
    expect(read).not.toHaveBeenCalled();
  });

  it("is ready with entries, ready with a valid empty index, unavailable on failure or invalid data", async () => {
    expect(
      await loadSiteIndex("docs", "en", async () => [entry("docs", "a")], all),
    ).toEqual({ state: "ready", entries: [entry("docs", "a")] });
    expect(await loadSiteIndex("docs", "en", async () => [], all)).toEqual({
      state: "ready",
      entries: [],
    });
    expect(
      await loadSiteIndex(
        "docs",
        "en",
        async () => Promise.reject(new Error("x")),
        all,
      ),
    ).toEqual({ state: "unavailable" });
    expect(
      await loadSiteIndex(
        "docs",
        "en",
        async () => [entry("docs", "a", undefined, "pt-BR")],
        all,
      ),
    ).toEqual({ state: "unavailable" });
  });

  it("with real participation, English hosts are read", async () => {
    const read = vi.fn(async (site: SiteId) => [entry(site, "x")]);
    for (const site of ["root", "dump", "docs", "lab"] as const)
      expect((await loadSiteIndex(site, "en", read)).state).toBe("ready");
    expect(read).toHaveBeenCalledTimes(4);
  });
});
