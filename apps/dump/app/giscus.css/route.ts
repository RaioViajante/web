import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

/** `--name: value;` pairs from the shared tokens, resolved one level of var(). */
function readTokens() {
  const css = fs.readFileSync(
    path.join(process.cwd(), "../../packages/design/styles/tokens.css"),
    "utf8",
  );
  const tokens = new Map<string, string>();
  for (const [, name, raw] of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    const value = (raw ?? "").replace(/\/\*.*?\*\//g, "").trim();
    if (!tokens.has(name!)) tokens.set(name!, value);
  }
  for (const [name, value] of tokens) {
    const ref = /^var\((--[\w-]+)\)$/.exec(value);
    if (ref) tokens.set(name, tokens.get(ref[1]!) ?? value);
  }
  return tokens;
}

/**
 * The giscus iframe theme. The iframe cannot read this page's custom
 * properties, so the values are copied out of the shared tokens at build time.
 */
export function GET() {
  const t = readTokens();
  const v = (name: string) => t.get(name) ?? "inherit";
  const css = `/* Generated from @raioviajante/design styles/tokens.css. */
main {
  --color-canvas-default: ${v("--bg")};
  --color-canvas-overlay: ${v("--block")};
  --color-canvas-inset: ${v("--block")};
  --color-canvas-subtle: ${v("--block")};
  --color-fg-default: ${v("--fg")};
  --color-fg-muted: ${v("--fg-2")};
  --color-fg-subtle: ${v("--fg-3")};
  --color-border-default: ${v("--line")};
  --color-border-muted: ${v("--block-hairline")};
  --color-accent-fg: ${v("--fg")};
  --color-accent-emphasis: ${v("--fg")};
  --color-accent-muted: ${v("--line")};
  --color-accent-subtle: ${v("--block-hairline")};
  --color-btn-text: ${v("--fg")};
  --color-btn-bg: ${v("--block")};
  --color-btn-border: ${v("--line")};
  --color-btn-shadow: 0 0 transparent;
  --color-btn-hover-bg: ${v("--block-button")};
  --color-btn-hover-border: ${v("--fg-2")};
  --color-btn-primary-text: ${v("--bg")};
  --color-btn-primary-bg: ${v("--fg")};
  --color-btn-primary-border: ${v("--fg")};
  --color-btn-primary-hover-bg: ${v("--inline-link")};
  --color-btn-primary-hover-border: ${v("--inline-link")};
}
.gsc-main,
.gsc-comment-box-textarea {
  font-family: ${v("--font").replace(/^var\(.*$/, '"Noto Sans Mono", ui-monospace, monospace')};
}
.gsc-comment,
.gsc-comment-box,
.gsc-comment-box-main {
  border-radius: ${v("--radius")};
  box-shadow: none;
}
`;
  return new Response(css, {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Access-Control-Allow-Origin": "https://giscus.app",
    },
  });
}
