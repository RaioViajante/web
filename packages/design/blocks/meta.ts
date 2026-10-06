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

export function parseHighlightRanges(spec: string) {
  const lines = new Set<number>();
  for (const part of spec.split(",")) {
    const [from, to = from] = part.trim().split("-").map(Number);
    if (
      from === undefined ||
      to === undefined ||
      !Number.isInteger(from) ||
      !Number.isInteger(to) ||
      from < 1
    )
      continue;
    for (let line = from; line <= to && line - from < 1000; line++)
      lines.add(line);
  }
  return [...lines].sort((a, b) => a - b);
}

export function parseFenceMeta(meta: string | null | undefined): FenceMeta {
  const result: FenceMeta = {
    numbered: false,
    highlight: [],
    terminal: false,
    expanded: false,
    notes: [],
  };
  const pattern = /(\w+)=(?:"([^"]*)"|'([^']*)')|\{([\d,\s-]+)\}|(\S+)/g;
  for (const match of (meta ?? "").matchAll(pattern)) {
    const [, key, double, single, ranges, word] = match;
    if (key) {
      const value = double ?? single ?? "";
      if (key === "title" || key === "label" || key === "group")
        result[key] = value;
      else if (key === "note") result.notes.push(value);
    } else if (ranges) {
      result.highlight.push(...parseHighlightRanges(ranges));
    } else if (word === "showLineNumbers") result.numbered = true;
    else if (word === "terminal") result.terminal = true;
    else if (word === "expanded") result.expanded = true;
  }
  return result;
}
