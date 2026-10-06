/**
 * The Shiki theme for RaioViajante code: no stock theme. Every color is one of
 * the `--syn-*` tokens in styles/tokens.css, so rendered tokens map back to the
 * `.tok-*` classes and stay themeable from CSS.
 */
import type { ThemeRegistration } from "shiki";

/** Mirrors `--syn-*` in styles/tokens.css (checked by tests). */
export const SYNTAX = {
  keyword: "#d8bd84",
  type: "#bfa6d9",
  function: "#8fb8d6",
  string: "#a8c791",
  number: "#de9f8c",
  comment: "#7b818a",
  punct: "#8792a1",
} as const;

export type TokenClass = keyof typeof SYNTAX;

export const FOREGROUND = "#edf1f6";
export const CODE_BACKGROUND = "#212121";

export const raioviajanteTheme: ThemeRegistration = {
  name: "raioviajante",
  type: "dark",
  colors: {
    "editor.background": CODE_BACKGROUND,
    "editor.foreground": FOREGROUND,
  },
  tokenColors: [
    { settings: { foreground: FOREGROUND } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: SYNTAX.comment, fontStyle: "italic" },
    },
    {
      scope: ["string", "punctuation.definition.string", "string.regexp"],
      settings: { foreground: SYNTAX.string },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.control",
        "keyword.operator.word",
        "constant.language.boolean",
      ],
      settings: { foreground: SYNTAX.keyword },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "entity.other.inherited-class",
        "support.type",
        "support.class",
        "entity.name.tag",
        "meta.table.toml entity.name",
        "support.type.property-name.table",
        "support.function.asm",
        "storage.type.asm",
      ],
      settings: { foreground: SYNTAX.type },
    },
    {
      scope: ["constant.language.register"],
      settings: { foreground: FOREGROUND },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call entity.name.function",
        "entity.name.label",
        "support.type.property-name",
      ],
      settings: { foreground: SYNTAX.function },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "support.constant",
      ],
      settings: { foreground: SYNTAX.number },
    },
    {
      scope: [
        "punctuation",
        "meta.brace",
        "keyword.operator",
        "punctuation.separator",
      ],
      settings: { foreground: SYNTAX.punct },
    },
  ],
};

const classByColor = new Map<string, TokenClass>(
  (Object.entries(SYNTAX) as [TokenClass, string][]).map(([name, color]) => [
    color.toLowerCase(),
    name,
  ]),
);

/** The `.tok-*` class for a rendered theme color, or undefined for plain text. */
export function classForColor(color: string | undefined) {
  return color ? classByColor.get(color.toLowerCase().slice(0, 7)) : undefined;
}
