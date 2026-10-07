/** Data model for code-like soft blocks. Markup is built from it in build.ts. */
import {
  highlightLines,
  plainLines,
  resolveLanguage,
  type Line,
} from "./highlight";
import { parseFenceMeta, type FenceMeta } from "./meta";
import type { TokenClass } from "./theme";

export const COLLAPSE_AFTER_LINES = 20;

export type BlockVariant = "code" | "terminal" | "diff" | "tree";
export type RowKind = "cmd" | "out" | "add" | "del";

export interface BlockRow {
  tokens: Line;
  kind?: RowKind;
  /** Annotation marker number shown at the end of the line. */
  mark?: number;
}

export interface BlockPanel {
  /** File name: the tab label, or the label above a single block. */
  file?: string;
  rows: BlockRow[];
}

export interface BlockModel {
  variant: BlockVariant;
  panels: BlockPanel[];
  /** Language label shown above the block. */
  language?: string;
  numbered: boolean;
  /** 1-based lines with the highlight band. */
  highlight: number[];
  collapsible: boolean;
  notes: string[];
}

const isSpace = (char: string | undefined) =>
  char !== undefined && /\s/.test(char);
const isDigit = (char: string | undefined) =>
  char !== undefined && char >= "0" && char <= "9";

/** Drops the final newlines in one pass, with no backtracking. */
export function stripTrailingNewlines(code: string) {
  let end = code.length;
  while (end > 0 && code.charCodeAt(end - 1) === 10) end--;
  return code.slice(0, end);
}

/**
 * Splits a trailing `[!n]` marker, and the space before it, off a line. It
 * scans backwards from the end, so long runs of spaces cost nothing extra.
 */
export function splitMarker(text: string): { text: string; mark?: number } {
  let end = text.length;
  while (end > 0 && isSpace(text[end - 1])) end--;
  if (text[end - 1] !== "]") return { text };
  let digits = end - 2;
  while (digits >= 0 && isDigit(text[digits])) digits--;
  if (digits === end - 2) return { text };
  if (digits < 1 || text[digits] !== "!" || text[digits - 1] !== "[")
    return { text };
  let start = digits - 1;
  while (start > 0 && isSpace(text[start - 1])) start--;
  return {
    text: text.slice(0, start),
    mark: Number(text.slice(digits + 1, end - 1)),
  };
}

const TREE_GLYPHS = "│├└─";
/** Splits leading tree glyphs and whitespace from the name that follows. */
export function splitTreeBranch(text: string): [branch: string, name: string] {
  let index = 0;
  while (
    index < text.length &&
    (TREE_GLYPHS.includes(text[index]!) || isSpace(text[index]))
  )
    index++;
  return [text.slice(0, index), text.slice(index)];
}

function terminalRows(code: string): BlockRow[] {
  return stripTrailingNewlines(code)
    .split("\n")
    .map((text) =>
      text.startsWith("$ ")
        ? { kind: "cmd" as const, tokens: [{ text: text.slice(2) }] }
        : { kind: "out" as const, tokens: text ? [{ text }] : [] },
    );
}

function diffRows(code: string): BlockRow[] {
  return stripTrailingNewlines(code)
    .split("\n")
    .map((text) => {
      const kind = text.startsWith("+")
        ? ("add" as const)
        : text.startsWith("-")
          ? ("del" as const)
          : undefined;
      const body = kind ? text.slice(1) : text.replace(/^ /, "");
      return {
        ...(kind ? { kind } : {}),
        tokens: body ? [{ text: body }] : [],
      };
    });
}

function treeRows(code: string): BlockRow[] {
  return stripTrailingNewlines(code)
    .split("\n")
    .map((text) => {
      const [branch, name] = splitTreeBranch(text);
      const tokens: Line = [];
      if (branch.trim()) tokens.push({ text: branch, cls: "punct" });
      else if (branch) tokens.push({ text: branch });
      if (name)
        tokens.push(
          name.endsWith("/") ? { text: name, cls: "type" } : { text: name },
        );
      return { tokens };
    });
}

/** Branch glyphs and directory names use their own classes, not syntax colors. */
export const TREE_CLASSES: Partial<Record<TokenClass, string>> = {
  punct: "tree-branch",
  type: "tree-dir",
};

async function rowsFor(
  variant: BlockVariant,
  code: string,
  lang: string | undefined,
): Promise<BlockRow[]> {
  if (variant === "terminal") return terminalRows(code);
  if (variant === "diff") return diffRows(code);
  if (variant === "tree") return treeRows(code);
  const marks = new Map<number, number>();
  const source = stripTrailingNewlines(code)
    .split("\n")
    .map((line, index) => {
      const { text, mark } = splitMarker(line);
      if (mark !== undefined) marks.set(index, mark);
      return text;
    })
    .join("\n");
  const lines = await highlightLines(source, lang);
  return lines.map((tokens, index) => ({
    tokens,
    ...(marks.has(index) ? { mark: marks.get(index) } : {}),
  }));
}

export interface BlockInput {
  code: string;
  lang?: string;
  meta?: string | FenceMeta;
}

export async function createBlockModel(input: BlockInput): Promise<BlockModel> {
  const meta =
    typeof input.meta === "object" ? input.meta : parseFenceMeta(input.meta);
  const lang = (input.lang ?? "").toLowerCase();
  const variant: BlockVariant =
    meta.terminal || ["sh-session", "terminal"].includes(lang)
      ? "terminal"
      : lang === "diff"
        ? "diff"
        : lang === "tree"
          ? "tree"
          : "code";
  const rows = await rowsFor(variant, input.code, lang);
  const language =
    meta.label ??
    (variant === "code" && lang && resolveLanguage(lang) !== "text"
      ? lang
      : undefined);
  return {
    variant,
    panels: [{ file: meta.title, rows }],
    language,
    numbered: meta.numbered && variant === "code",
    highlight: meta.highlight,
    collapsible: !meta.expanded && rows.length > COLLAPSE_AFTER_LINES,
    notes: meta.notes,
  };
}

/** Joins adjacent panels into one tabbed block. */
export function mergeIntoTabs(models: BlockModel[]): BlockModel {
  const [first] = models;
  if (!first) throw new Error("mergeIntoTabs needs at least one block");
  return {
    ...first,
    panels: models.flatMap((model) => model.panels),
    language: undefined,
    collapsible: models.some((model) => model.collapsible),
    notes: [],
  };
}

export { plainLines };
