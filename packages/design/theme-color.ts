import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * The page background token, for `theme-color` and the web manifest. Build
 * time only, like the social cards: every app builds from `apps/<site>`.
 */
let color: Promise<string> | undefined;
export function themeColor() {
  color ??= readFile(
    resolve(process.cwd(), "../../packages/design/styles/tokens.css"),
    "utf8",
  ).then((css) => {
    const value = css.match(/--bg:\s*([^;]+);/)?.[1]?.trim();
    if (!value) throw new Error("Missing --bg token");
    return value;
  });
  return color;
}
