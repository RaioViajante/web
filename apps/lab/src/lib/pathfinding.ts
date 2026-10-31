// Grid pathfinding with four algorithms, advanced one node expansion at a time.
// Everything is deterministic: neighbors are visited in a fixed order and every
// tie in a queue is broken by insertion order, so a grid and an algorithm always
// give the same exploration and the same path.
//
// Movement is four-directional. Entering a cell costs its weight (1 for plain
// ground, 5 for mud); walls cannot be entered. Breadth-first and depth-first
// search ignore weights, Dijkstra and A* use them.

export type Algorithm = "bfs" | "dfs" | "dijkstra" | "astar";
export const algorithms: readonly Algorithm[] = [
  "bfs",
  "dfs",
  "dijkstra",
  "astar",
];

export const WALL = 0;
export const GROUND = 1;
export const MUD = 5;
export type Weight = typeof WALL | typeof GROUND | typeof MUD;

export const SIZES = {
  small: { width: 12, height: 8 },
  medium: { width: 20, height: 12 },
  large: { width: 30, height: 16 },
} as const;
export type SizeName = keyof typeof SIZES;

export interface Grid {
  width: number;
  height: number;
  /** Row-major cell weights: 0 wall, 1 ground, 5 mud. */
  cells: readonly Weight[];
  start: number;
  goal: number;
}

export const index = (grid: Pick<Grid, "width">, row: number, column: number) =>
  row * grid.width + column;
export const rowOf = (grid: Pick<Grid, "width">, cell: number) =>
  Math.floor(cell / grid.width);
export const columnOf = (grid: Pick<Grid, "width">, cell: number) =>
  cell % grid.width;

export function createGrid(size: SizeName): Grid {
  const { width, height } = SIZES[size];
  const row = Math.floor(height / 2);
  return {
    width,
    height,
    cells: new Array<Weight>(width * height).fill(GROUND),
    start: index({ width }, row, 1),
    goal: index({ width }, row, width - 2),
  };
}

/** Returns a copy with `cell` set to `weight`; the start and the goal stay walkable. */
export function paint(grid: Grid, cell: number, weight: Weight): Grid {
  if (!Number.isInteger(cell) || cell < 0 || cell >= grid.cells.length)
    return grid;
  if (weight === WALL && (cell === grid.start || cell === grid.goal))
    return grid;
  if (grid.cells[cell] === weight) return grid;
  const cells = grid.cells.slice();
  cells[cell] = weight;
  return { ...grid, cells };
}

/** Moves the start or the goal. Refuses walls, the other endpoint and out-of-range cells. */
export function place(grid: Grid, which: "start" | "goal", cell: number): Grid {
  if (!Number.isInteger(cell) || cell < 0 || cell >= grid.cells.length)
    return grid;
  const other = which === "start" ? grid.goal : grid.start;
  if (cell === other || grid.cells[cell] === WALL || grid[which] === cell)
    return grid;
  return { ...grid, [which]: cell };
}

/** Removes every wall and mud cell, keeping the endpoints. */
export function clearGrid(grid: Grid): Grid {
  return { ...grid, cells: new Array<Weight>(grid.cells.length).fill(GROUND) };
}

// Small seeded generator (mulberry32) so "generate" is repeatable.
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Scatters walls (about 24%) and mud (about 12%) from a seed. The endpoints are
 * never blocked. The same seed and size always give the same grid; nothing
 * guarantees that a path exists.
 */
export function generate(grid: Grid, seed: number): Grid {
  const next = random(seed);
  const cells = grid.cells.map((_, cell): Weight => {
    if (cell === grid.start || cell === grid.goal) return GROUND;
    const roll = next();
    return roll < 0.24 ? WALL : roll < 0.36 ? MUD : GROUND;
  });
  return { ...grid, cells };
}

/** Neighbors in the fixed order up, right, down, left; walls and edges are skipped. */
export function neighbors(grid: Grid, cell: number): number[] {
  const row = rowOf(grid, cell);
  const column = columnOf(grid, cell);
  const out: number[] = [];
  const candidates: [number, number][] = [
    [row - 1, column],
    [row, column + 1],
    [row + 1, column],
    [row, column - 1],
  ];
  for (const [r, c] of candidates) {
    if (r < 0 || c < 0 || r >= grid.height || c >= grid.width) continue;
    const id = index(grid, r, c);
    if (grid.cells[id] !== WALL) out.push(id);
  }
  return out;
}

function manhattan(grid: Grid, a: number, b: number): number {
  return (
    Math.abs(rowOf(grid, a) - rowOf(grid, b)) +
    Math.abs(columnOf(grid, a) - columnOf(grid, b))
  );
}

export type SearchStatus = "running" | "found" | "unreachable";

interface Entry {
  cell: number;
  /** Cell it was reached from, or -1. */
  from: number;
  /** Cost of the path to `cell` (weighted for Dijkstra and A*, steps for the others). */
  cost: number;
  priority: number;
  /** Heuristic value, used only to break ties in A*. */
  h: number;
  seq: number;
}

export interface Search {
  grid: Grid;
  algorithm: Algorithm;
  status: SearchStatus;
  /** Cells whose expansion is finished, in order. */
  expanded: readonly number[];
  /** Cells waiting in the open list, without stale duplicates. */
  frontier: readonly number[];
  /** The cell expanded by the latest step, or -1. */
  current: number;
  /** The path from start to goal when found, else empty. */
  path: readonly number[];
  /** Number of moves on the path. */
  pathSteps: number;
  /** Total weight of the cells entered along the path. */
  pathCost: number;
  steps: number;
  // Internals.
  open: readonly Entry[];
  parent: ReadonlyMap<number, number>;
  best: ReadonlyMap<number, number>;
  closed: ReadonlySet<number>;
  seq: number;
}

function entry(
  grid: Grid,
  algorithm: Algorithm,
  cell: number,
  from: number,
  cost: number,
  seq: number,
): Entry {
  const h = manhattan(grid, cell, grid.goal);
  const priority = algorithm === "astar" ? cost + h : cost;
  return { cell, from, cost, priority, h, seq };
}

export function createSearch(grid: Grid, algorithm: Algorithm): Search {
  const first = entry(grid, algorithm, grid.start, -1, 0, 0);
  return {
    grid,
    algorithm,
    status: "running",
    expanded: [],
    frontier: [grid.start],
    current: -1,
    path: [],
    pathSteps: 0,
    pathCost: 0,
    steps: 0,
    open: [first],
    parent: new Map(),
    best: new Map([[grid.start, 0]]),
    closed: new Set(),
    seq: 1,
  };
}

/** Which open entry to take next. The index of the winner in `open`. */
function pick(search: Search): number {
  const { open, algorithm } = search;
  if (algorithm === "bfs") return 0; // oldest first
  if (algorithm === "dfs") return open.length - 1; // newest first
  let best = 0;
  for (let i = 1; i < open.length; i += 1) {
    const a = open[i]!;
    const b = open[best]!;
    // Lowest priority; A* then prefers the cell closer to the goal; then the older entry.
    if (
      a.priority < b.priority ||
      (a.priority === b.priority && algorithm === "astar" && a.h < b.h) ||
      (a.priority === b.priority &&
        (algorithm !== "astar" || a.h === b.h) &&
        a.seq < b.seq)
    )
      best = i;
  }
  return best;
}

function tracePath(grid: Grid, parent: ReadonlyMap<number, number>): number[] {
  const path = [grid.goal];
  let at = grid.goal;
  // The chain ends at the start, which has no parent; the bound only guards a corrupt map.
  for (
    let guard = 0;
    at !== grid.start && guard <= grid.cells.length;
    guard += 1
  ) {
    const before = parent.get(at);
    if (before === undefined) return [];
    path.push(before);
    at = before;
  }
  return path.reverse();
}

function frontierOf(search: {
  open: readonly Entry[];
  closed: ReadonlySet<number>;
}): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const item of search.open)
    if (!search.closed.has(item.cell) && !seen.has(item.cell)) {
      seen.add(item.cell);
      out.push(item.cell);
    }
  return out;
}

/** Expands one cell. A finished search is returned unchanged. */
export function stepSearch(search: Search): Search {
  if (search.status !== "running") return search;
  const { grid, algorithm } = search;
  if (search.open.length === 0)
    return { ...search, status: "unreachable", frontier: [], current: -1 };
  const at = pick(search);
  const taken = search.open[at]!;
  const open = search.open.filter((_, i) => i !== at);

  // A cell can be queued more than once; only its first expansion counts.
  if (search.closed.has(taken.cell))
    return stepSearch({
      ...search,
      open,
      frontier: frontierOf({ open, closed: search.closed }),
    });

  const closed = new Set(search.closed).add(taken.cell);
  const parent = new Map(search.parent);
  if (taken.from >= 0) parent.set(taken.cell, taken.from);
  const expanded = [...search.expanded, taken.cell];
  const base = {
    ...search,
    open,
    closed,
    parent,
    expanded,
    current: taken.cell,
    steps: search.steps + 1,
  };

  if (taken.cell === grid.goal) {
    const path = tracePath(grid, parent);
    return {
      ...base,
      status: "found",
      frontier: frontierOf({ open, closed }),
      path,
      pathSteps: path.length - 1,
      pathCost: path.slice(1).reduce((sum, cell) => sum + grid.cells[cell]!, 0),
    };
  }

  const best = new Map(search.best);
  let seq = search.seq;
  const order = neighbors(grid, taken.cell);
  // The stack takes the last pushed first, so push in reverse to try "up" first.
  const visit = algorithm === "dfs" ? [...order].reverse() : order;
  const pushed: Entry[] = [];
  for (const cell of visit) {
    if (closed.has(cell)) continue;
    const step =
      algorithm === "dijkstra" || algorithm === "astar" ? grid.cells[cell]! : 1;
    const cost = taken.cost + step;
    if (algorithm === "bfs") {
      // Mark on discovery: the first time a cell is seen is by the fewest moves.
      if (best.has(cell)) continue;
      best.set(cell, cost);
    } else if (algorithm === "dijkstra" || algorithm === "astar") {
      // Only queue a route that beats the best one known so far.
      const known = best.get(cell);
      if (known !== undefined && known <= cost) continue;
      best.set(cell, cost);
    }
    pushed.push(entry(grid, algorithm, cell, taken.cell, cost, seq));
    seq += 1;
  }
  const nextOpen = [...open, ...pushed];
  const frontier = frontierOf({ open: nextOpen, closed });
  // BFS records its parent at discovery, so the path never changes afterwards.
  let nextParent = parent;
  if (algorithm === "bfs") {
    nextParent = new Map(parent);
    for (const item of pushed) nextParent.set(item.cell, item.from);
  }
  return {
    ...base,
    open: nextOpen,
    parent: nextParent,
    best,
    seq,
    frontier,
    status: nextOpen.length === 0 ? "unreachable" : "running",
  };
}

/** Runs to completion. The step count is bounded by the number of queued entries. */
export function solve(grid: Grid, algorithm: Algorithm): Search {
  let search = createSearch(grid, algorithm);
  // Every cell is expanded once and queued at most four times, so this bound is never reached.
  const limit = grid.cells.length * 5 + 10;
  for (let i = 0; i < limit && search.status === "running"; i += 1)
    search = stepSearch(search);
  return search;
}

export interface Comparison {
  algorithm: Algorithm;
  status: SearchStatus;
  explored: number;
  pathSteps: number;
  pathCost: number;
  /** The path has the fewest possible moves on this grid. */
  fewestSteps: boolean;
  /** The path has the lowest possible total weight on this grid. */
  lowestCost: boolean;
}

/** Solves the grid with every algorithm and says which found an optimal path, by moves and by cost. */
export function compare(grid: Grid): Comparison[] {
  const results = algorithms.map((algorithm) => solve(grid, algorithm));
  const found = results.filter((r) => r.status === "found");
  const minSteps = Math.min(...found.map((r) => r.pathSteps));
  const minCost = Math.min(...found.map((r) => r.pathCost));
  return results.map((r) => ({
    algorithm: r.algorithm,
    status: r.status,
    explored: r.expanded.length,
    pathSteps: r.pathSteps,
    pathCost: r.pathCost,
    fewestSteps: r.status === "found" && r.pathSteps === minSteps,
    lowestCost: r.status === "found" && r.pathCost === minCost,
  }));
}

/** Does any path exist? A plain flood fill, independent of the four algorithms. */
export function reachable(grid: Grid): boolean {
  const seen = new Set<number>([grid.start]);
  const queue = [grid.start];
  for (let at = 0; at < queue.length; at += 1) {
    for (const cell of neighbors(grid, queue[at]!))
      if (!seen.has(cell)) {
        seen.add(cell);
        queue.push(cell);
      }
  }
  return seen.has(grid.goal);
}
