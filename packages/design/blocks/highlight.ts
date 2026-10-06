/** Build-time syntax highlighting: source text to lines of classed tokens. */
import { bundledLanguages, codeToTokens, type BundledLanguage } from "shiki";
import { classForColor, raioviajanteTheme, type TokenClass } from "./theme";

export interface Token {
  text: string;
  cls?: TokenClass;
}
export type Line = Token[];

const aliases: Record<string, string> = {
  sh: "shellscript",
  shell: "shellscript",
  bash: "shellscript",
  zsh: "shellscript",
  console: "shellscript",
  nasm: "asm",
  assembly: "asm",
  py: "python",
  ts: "typescript",
  js: "javascript",
  yml: "yaml",
};

export function resolveLanguage(lang: string | undefined) {
  const name =
    aliases[(lang ?? "").toLowerCase()] ?? (lang ?? "").toLowerCase();
  return name in bundledLanguages ? name : "text";
}

function trimTrailingNewlines(code: string) {
  return code.replace(/\r\n/g, "\n").replace(/\n+$/, "");
}

/** Plain lines without highlighting. */
export function plainLines(code: string): Line[] {
  return trimTrailingNewlines(code)
    .split("\n")
    .map((text) => (text ? [{ text }] : []));
}

export async function highlightLines(
  code: string,
  lang: string | undefined,
): Promise<Line[]> {
  const language = resolveLanguage(lang);
  if (language === "text") return plainLines(code);
  const { tokens } = await codeToTokens(trimTrailingNewlines(code), {
    lang: language as BundledLanguage,
    theme: raioviajanteTheme,
  });
  return tokens.map((line) => {
    const merged: Token[] = [];
    for (const token of line) {
      if (token.content === "") continue;
      const cls = classForColor(token.color);
      const last = merged[merged.length - 1];
      if (last && last.cls === cls) last.text += token.content;
      else merged.push({ text: token.content, ...(cls ? { cls } : {}) });
    }
    return merged;
  });
}
