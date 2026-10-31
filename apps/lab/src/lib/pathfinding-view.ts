import { fill } from "./template.ts";
import type { CellKind, PathfindingCopy } from "./pathfinding-copy.ts";
import type { PluralForms } from "./plural-core.ts";
import {
  GROUND,
  MUD,
  WALL,
  columnOf,
  rowOf,
  type Grid,
} from "./pathfinding.ts";

// Text the playground's script shows, as pure functions so Node can test the
// wording. The script ships no plural-rule code: the build renders which counts
// take the "one" wording (`oneCounts`) and `pickForm` applies it.

/** The visual role of a cell during a search; `current` is the cell just explored. */
export type CellState = "none" | "frontier" | "expanded" | "path" | "current";

export function kindOf(grid: Grid, cell: number): CellKind {
  if (cell === grid.start) return "start";
  if (cell === grid.goal) return "goal";
  const weight = grid.cells[cell];
  return weight === WALL ? "wall" : weight === MUD ? "mud" : "ground";
}

/** The single character that marks a cell, so state never depends on color. */
export function markOf(
  copy: PathfindingCopy,
  kind: CellKind,
  state: CellState,
): string {
  if (kind === "start" || kind === "goal") return copy.marks[kind];
  if (state === "path") return copy.marks.path;
  if (state === "frontier") return copy.marks.frontier;
  if (state === "expanded" || state === "current") return copy.marks.expanded;
  return copy.marks[kind];
}

export function labelOf(
  copy: PathfindingCopy,
  grid: Grid,
  cell: number,
  state: CellState,
): string {
  const suffix = state === "none" ? "" : copy.cellStates[state];
  return fill(copy.cellLabel, {
    row: rowOf(grid, cell) + 1,
    column: columnOf(grid, cell) + 1,
    kind: copy.kinds[kindOf(grid, cell)],
    state: suffix,
  });
}

/** Counts (0 to `max`) that CLDR files under the category "one" for `intlLocale`. */
export type OneCounts = readonly number[];

export function pickForm(
  forms: PluralForms,
  count: number,
  oneCounts: OneCounts,
): string {
  if (!Number.isInteger(count) || count < 0)
    throw new RangeError(`Counts are whole numbers, got ${count}`);
  if (count === 0 && forms.none !== undefined)
    return fill(forms.none, { count });
  return fill(oneCounts.includes(count) ? forms.one : forms.other, { count });
}

export const WEIGHT_OF: Record<"wall" | "mud" | "ground", number> = {
  wall: WALL,
  mud: MUD,
  ground: GROUND,
};
