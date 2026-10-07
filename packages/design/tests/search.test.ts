import { describe, expect, it } from "vitest";
import type { SearchEntry } from "../components/search";
import type { SiteId } from "../../../site/sites";
import {
  loadEverywhere,
  searchEntries,
  unavailableNote,
} from "../search/engine";

const entry = (site: SiteId, title: string, body?: string): SearchEntry => ({
  site,
  title,
  href: `https://${site}.example/${title}`,
  description: "",
  body,
});

const own = [entry("root", "gallery"), entry("root", "projects")];

describe("searchEntries", () => {
  it("returns an entry when searching its known title", () => {
    expect(searchEntries(own, "gallery").map((e) => e.title)).toEqual([
      "gallery",
    ]);
  });

  it("matches case-insensitively, across words and in the body", () => {
    const entries = [entry("dump", "A TOML File", "loading sweep config")];
    expect(searchEntries(entries, "toml SWEEP")).toHaveLength(1);
    expect(searchEntries(entries, "toml orbit")).toHaveLength(0);
  });

  it("returns nothing for an empty query", () => {
    expect(searchEntries(own, "   ")).toEqual([]);
  });
});

describe("loadEverywhere", () => {
  it("merges every site that answers", async () => {
    const loaded = await loadEverywhere("root", own, async (site) => [
      entry(site, `${site}-page`),
    ]);
    expect(loaded.unavailable).toEqual([]);
    expect(loaded.entries.map((e) => e.site)).toEqual([
      "root",
      "root",
      "dump",
      "docs",
      "lab",
    ]);
  });

  it("keeps this site's results and names the sites it could not reach", async () => {
    const loaded = await loadEverywhere("root", own, async (site) => {
      if (site === "docs" || site === "lab") throw new Error("offline");
      return [entry(site, "post")];
    });
    expect(loaded.unavailable).toEqual(["docs", "lab"]);
    expect(searchEntries(loaded.entries, "gallery")).toHaveLength(1);
    expect(unavailableNote(loaded.unavailable)).toBe(
      "couldn't reach docs, lab: showing the rest.",
    );
  });

  it("gives no note when every site answered", () => {
    expect(unavailableNote([])).toBe("");
  });
});
