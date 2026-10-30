# Pathfinding playground (005)

An interactive grid for BFS, DFS, Dijkstra and A*. It is not tied to a project,
so its record has no `revision` (the field is optional) and no `source` link.
Fidelity is `runs here`: the algorithms in `src/lib/pathfinding.ts` are the ones
the page executes.

## Model

- Four-directional movement. Entering a cell costs its weight: 1 for ground, 5
  for mud; walls cannot be entered. The start and the goal can lie under mud but
  never under a wall.
- Neighbors are tried up, right, down, left. A queue is FIFO (BFS), a stack is
  LIFO (DFS, neighbors pushed in reverse so "up" is tried first), and the
  priority algorithms take the lowest priority with ties going to the entry
  queued first. A* prefers the lower heuristic value before the queue order.
- BFS and DFS count moves and ignore weights; Dijkstra and A* use them. A*'s
  heuristic is Manhattan distance, admissible and consistent because every move
  costs at least 1, so A* stays optimal.
- DFS marks a cell when it is taken from the stack and keeps the parent of the
  entry it was taken from. It finds a path whenever one exists and promises
  nothing about its length; the page and tests say so.
- `stepSearch` expands exactly one cell; stale duplicate entries are skipped
  inside the same step. `solve` is bounded by `cells × 5 + 10` steps.
- `compare` solves the grid with all four and reports which paths are optimal by
  moves and by weight, using the minimum over the algorithms that found a path.
  The tests check the optimal lengths and weights against independent
  references (a plain BFS and a relaxation pass).
- `generate(seed)` uses a seeded generator (about 24% walls, 12% mud). A seed
  can produce a grid with no path; the page says so.

## Page

`PathfindingBench.tsx` renders the controls; the plain TypeScript script in
`PathfindingPlayground.astro` builds the grid (an ARIA `grid` with a roving
tabindex), runs the search with a single `setTimeout` chain cleared on pause,
reset, edit and `pagehide`, and renders every cell with a one-character mark and
an accessible name, so no state depends on color. Arrow keys, Home, End and
Enter/Space draw; the mouse and pen drag to draw; touch taps (dragging scrolls).
With `prefers-reduced-motion` run finishes at once and the speed slider is
disabled.

Counted phrases use the locale's plural rules at build time: the build renders
which counts take the "one" wording and the script applies it
(`pickForm` / `oneCountsFor`), so the script imports no plural code. A test
compares it with `countedFor` for every count up to 480.

## Tests

`tests/pathfinding.test.mjs` (reachability, unreachable goals, optimality
against references, weighted versus unweighted, DFS not shortest, termination
and repeatability over 120 generated grids) and `tests/pathfinding-copy.test.mjs`
(EN/PT parity, plurals, labels).
