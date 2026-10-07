import { describe, expect, it } from "vitest";
import { fenceTokens, parseFenceMeta } from "../blocks/meta";
import {
  splitMarker,
  splitTreeBranch,
  stripTrailingNewlines,
} from "../blocks/model";

// Block source and fence meta come from authored Markdown. These helpers are
// linear scans; the long inputs below are the shapes that made the earlier
// regular expressions slow, and each must finish quickly.
const FAST_MS = 500;
const timed = (fn: () => void) => {
  const started = performance.now();
  fn();
  return performance.now() - started;
};

describe("trailing newlines", () => {
  it("drops only the final newlines", () => {
    expect(stripTrailingNewlines("a\n\n\n")).toBe("a");
    expect(stripTrailingNewlines("a\nb")).toBe("a\nb");
    expect(stripTrailingNewlines("\n\n")).toBe("");
    expect(stripTrailingNewlines("a \n")).toBe("a ");
    expect(stripTrailingNewlines("")).toBe("");
  });
  it("handles a very long run of newlines", () => {
    const input = `a${"\n".repeat(200_000)}b${"\n".repeat(200_000)}`;
    expect(timed(() => stripTrailingNewlines(input))).toBeLessThan(FAST_MS);
    expect(stripTrailingNewlines(input)).toBe(`a${"\n".repeat(200_000)}b`);
  });
});

describe("[!n] line markers", () => {
  it("splits a trailing marker and the space before it", () => {
    expect(splitMarker("const a = 1; [!2]")).toEqual({
      text: "const a = 1;",
      mark: 2,
    });
    expect(splitMarker("x\t [!10]  \t")).toEqual({ text: "x", mark: 10 });
    expect(splitMarker("[!7]")).toEqual({ text: "", mark: 7 });
  });
  it("leaves lines without a complete trailing marker alone", () => {
    for (const line of [
      "plain",
      "[!]",
      "[!x]",
      "[!1] trailing text",
      "[1]",
      "!1]",
      "x [!1",
      "",
    ]) {
      expect(splitMarker(line), line).toEqual({ text: line });
    }
  });
  it("handles long runs of spaces, tabs and brackets quickly", () => {
    for (const filler of [" ", "\t", "[!", "9"]) {
      const line = `x${filler.repeat(200_000)}y`;
      expect(
        timed(() => splitMarker(line)),
        JSON.stringify(filler),
      ).toBeLessThan(FAST_MS);
      expect(splitMarker(line).mark).toBeUndefined();
    }
    const long = `x${" ".repeat(200_000)}[!3]`;
    expect(timed(() => splitMarker(long))).toBeLessThan(FAST_MS);
    expect(splitMarker(long)).toEqual({ text: "x", mark: 3 });
  });
});

describe("tree rows", () => {
  it("separates leading glyphs and whitespace from the name", () => {
    expect(splitTreeBranch("├── src/")).toEqual(["├── ", "src/"]);
    expect(splitTreeBranch("│   └── a.ts")).toEqual(["│   └── ", "a.ts"]);
    expect(splitTreeBranch("root")).toEqual(["", "root"]);
    expect(splitTreeBranch("")).toEqual(["", ""]);
    expect(splitTreeBranch("   ")).toEqual(["   ", ""]);
  });
  it("keeps a carriage return in a CRLF line with its name", () => {
    expect(splitTreeBranch("└── a.ts\r")).toEqual(["└── ", "a.ts\r"]);
  });
  it("handles a very long branch prefix quickly", () => {
    const line = `${"│ ".repeat(100_000)}name`;
    expect(timed(() => splitTreeBranch(line))).toBeLessThan(FAST_MS);
    expect(splitTreeBranch(line)[1]).toBe("name");
  });
});

describe("fence meta", () => {
  it("reads titles, notes, groups, ranges and flags", () => {
    const meta = parseFenceMeta(
      `asm title="boot.asm" showLineNumbers {8-9,12} note="one" note='two' group=g terminal expanded`,
    );
    expect(meta).toMatchObject({
      title: "boot.asm",
      numbered: true,
      highlight: [8, 9, 12],
      notes: ["one", "two"],
      terminal: true,
      expanded: true,
    });
    expect(meta.group).toBeUndefined();
  });
  it("tokenizes quoted pairs, range groups and plain words", () => {
    expect([...fenceTokens(`a="x y" {1-2} b=c d='' {x} e="open`)]).toEqual([
      { key: "a", value: "x y" },
      { ranges: "1-2" },
      { word: "b=c" },
      { key: "d", value: "" },
      { word: "{x}" },
      { word: 'e="open' },
    ]);
  });
  it("handles very long words, quotes and spaces quickly", () => {
    for (const input of [
      "a".repeat(200_000),
      `${"a".repeat(100_000)}=`,
      `${"a".repeat(100_000)}="`,
      " ".repeat(200_000),
      "{".repeat(100_000),
      `{${"1,".repeat(100_000)}`,
    ]) {
      expect(timed(() => [...fenceTokens(input)])).toBeLessThan(FAST_MS);
    }
  });
});
