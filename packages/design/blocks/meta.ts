/**
 * Fence meta, as written after the language:
 *
 *   ```asm title="boot.asm" showLineNumbers {8-9}
 *   ```sh terminal
 *   ```python title="a.py" group="setup"   (adjacent fences with one group become tabs)
 *   ```python note="pads with zeros" note="the signature"
 */
export interface FenceMeta {
  title?: string;
  label?: string;
  group?: string;
  numbered: boolean;
  highlight: number[];
  terminal: boolean;
  expanded: boolean;
  notes: string[];
}

/** A range expands to at most this many lines, whatever its endpoints say. */
const MAX_RANGE_LINES = 1000;

export function parseHighlightRanges(spec: string) {
  const lines = new Set<number>();
  for (const part of spec.split(",")) {
    const [from, to = from] = part.trim().split("-").map(Number);
    if (
      from === undefined ||
      to === undefined ||
      !Number.isSafeInteger(from) ||
      !Number.isSafeInteger(to) ||
      from < 1
    )
      continue;
    // Counted, not compared: beyond 2^53 `line++` stops changing the number.
    for (
      let line = from, count = 0;
      line <= to && count < MAX_RANGE_LINES && Number.isSafeInteger(line);
      line++, count++
    )
      lines.add(line);
  }
  return [...lines].sort((a, b) => a - b);
}

export interface FenceToken {
  /** `key="value"` or `key='value'`. */
  key?: string;
  value?: string;
  /** The inside of `{8-9,12}`. */
  ranges?: string;
  /** Any other run of non-space characters. */
  word?: string;
}

const isSpace = (char: string | undefined) =>
  char !== undefined && /\s/.test(char);
const isWordChar = (char: string | undefined) =>
  char !== undefined && /\w/.test(char);
const isRangeChar = (char: string | undefined) =>
  char !== undefined && /[\d,\s-]/.test(char);

/**
 * Splits fence meta into tokens in one left-to-right pass: a quoted
 * `key="value"` pair, a `{ranges}` group, or a plain word. Each step only
 * moves forward, so a long run of word characters costs time linear in its length.
 */
export function* fenceTokens(meta: string): Generator<FenceToken> {
  let at = 0;
  while (at < meta.length) {
    if (isSpace(meta[at])) {
      at++;
      continue;
    }
    let end = at;
    while (isWordChar(meta[end])) end++;
    const quote = meta[end + 1];
    if (end > at && meta[end] === "=" && (quote === '"' || quote === "'")) {
      const close = meta.indexOf(quote, end + 2);
      if (close !== -1) {
        yield { key: meta.slice(at, end), value: meta.slice(end + 2, close) };
        at = close + 1;
        continue;
      }
    }
    if (meta[at] === "{") {
      let stop = at + 1;
      while (isRangeChar(meta[stop])) stop++;
      if (stop > at + 1 && meta[stop] === "}") {
        yield { ranges: meta.slice(at + 1, stop) };
        at = stop + 1;
        continue;
      }
    }
    end = at;
    while (end < meta.length && !isSpace(meta[end])) end++;
    yield { word: meta.slice(at, end) };
    at = end;
  }
}

export function parseFenceMeta(meta: string | null | undefined): FenceMeta {
  const result: FenceMeta = {
    numbered: false,
    highlight: [],
    terminal: false,
    expanded: false,
    notes: [],
  };
  for (const { key, value, ranges, word } of fenceTokens(meta ?? "")) {
    if (key) {
      if (key === "title" || key === "label" || key === "group")
        result[key] = value ?? "";
      else if (key === "note") result.notes.push(value ?? "");
    } else if (ranges) {
      result.highlight.push(...parseHighlightRanges(ranges));
    } else if (word === "showLineNumbers") result.numbered = true;
    else if (word === "terminal") result.terminal = true;
    else if (word === "expanded") result.expanded = true;
  }
  return result;
}
