import { fill } from "./template.ts";
import type {
  ContextKey,
  NameKey,
  TinyLanguageCopy,
} from "./tiny-language-copy.ts";
import type { Diagnostic } from "./tiny-language.ts";

// Wording of diagnostics from a code and its arguments, as a pure function so
// Node can test every message in both languages.

/** `found` is source text, or `~newline`, `~eof`, `~indent`, `~dedent` for tokens with no text. */
function foundText(
  copy: TinyLanguageCopy,
  found: string | number | undefined,
): string {
  const value = String(found ?? "");
  if (value.startsWith("~"))
    return (
      copy.foundNames[value.slice(1) as keyof typeof copy.foundNames] ?? value
    );
  return `\`${value}\``;
}

export function formatDiagnostic(
  copy: TinyLanguageCopy,
  d: Diagnostic,
): string {
  const args: Record<string, string | number> = { ...d.args };
  if (
    d.code === "expected-token" ||
    d.code === "expected-expression" ||
    d.code === "expected-end-of-line"
  )
    args.found = foundText(copy, d.args.found);
  if (d.code === "expected-name") args.found = foundText(copy, d.args.found);
  if (d.code === "expected-token")
    args.context =
      copy.contexts[d.args.context as ContextKey] ?? String(d.args.context);
  if (d.code === "expected-name")
    args.what = copy.names[d.args.what as NameKey] ?? String(d.args.what);
  return fill(copy.diagnostics[d.code], args);
}
