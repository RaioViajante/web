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

const MARKER = /\s*\[!(\d+)\]\s*$/;

function terminalRows(code: string): BlockRow[] {
  return code
    .replace(/\n+$/, "")
    .split("\n")
    .map((text) =>
      text.startsWith("$ ")
        ? { kind: "cmd" as const, tokens: [{ text: text.slice(2) }] }
        : { kind: "out" as const, tokens: text ? [{ text }] : [] },
    );
}

function diffRows(code: string): BlockRow[] {
  return code
    .replace(/\n+$/, "")
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

const TREE_BRANCH = /^([│├└─\s]*)(.*)$/;
function treeRows(code: string): BlockRow[] {
  return code
    .replace(/\n+$/, "")
    .split("\n")
    .map((text) => {
      const [, branch = "", name = ""] = text.match(TREE_BRANCH) ?? [];
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
  const source = code
    .replace(/\n+$/, "")
    .split("\n")
    .map((text, index) => {
      const match = text.match(MARKER);
      if (!match) return text;
      marks.set(index, Number(match[1]));
      return text.replace(MARKER, "");
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
  return {
    ...first,
    panels: models.flatMap((model) => model.panels),
    language: undefined,
    collapsible: models.some((model) => model.collapsible),
    notes: [],
  };
}

export { plainLines };
