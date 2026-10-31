import assert from "node:assert/strict";
import { test } from "node:test";
import {
  GROUND,
  MUD,
  SIZES,
  WALL,
  algorithms,
  clearGrid,
  compare,
  createGrid,
  createSearch,
  generate,
  index,
  neighbors,
  paint,
  place,
  reachable,
  solve,
  stepSearch,
} from "../src/lib/pathfinding.ts";

/** A grid from rows of text: `#` wall, `~` mud, `.` ground, `S` start, `G` goal. */
function parse(rows) {
  const width = rows[0].length;
  const cells = [];
  let start = -1;
  let goal = -1;
  rows.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch === "S") start = r * width + c;
      if (ch === "G") goal = r * width + c;
      cells.push(ch === "#" ? WALL : ch === "~" ? MUD : GROUND);
    }),
  );
  return { width, height: rows.length, cells, start, goal };
}

/** Independent references: cheapest cost by relaxation, fewest moves by plain BFS. */
function cheapest(grid) {
  const dist = new Array(grid.cells.length).fill(Infinity);
  dist[grid.start] = 0;
  for (let changed = true; changed;) {
    changed = false;
    for (let cell = 0; cell < dist.length; cell += 1) {
      if (dist[cell] === Infinity) continue;
      for (const next of neighbors(grid, cell))
        if (dist[cell] + grid.cells[next] < dist[next]) {
          dist[next] = dist[cell] + grid.cells[next];
          changed = true;
        }
    }
  }
  return dist[grid.goal];
}
function fewest(grid) {
  const dist = new Map([[grid.start, 0]]);
  const queue = [grid.start];
  for (let i = 0; i < queue.length; i += 1)
    for (const next of neighbors(grid, queue[i]))
      if (!dist.has(next)) {
        dist.set(next, dist.get(queue[i]) + 1);
        queue.push(next);
      }
  return dist.get(grid.goal) ?? Infinity;
}
function assertValidPath(grid, search) {
  const { path } = search;
  assert.equal(path[0], grid.start);
  assert.equal(path.at(-1), grid.goal);
  for (let i = 1; i < path.length; i += 1) {
    assert.ok(
      neighbors(grid, path[i - 1]).includes(path[i]),
      "each move is one step onto a free cell",
    );
  }
  assert.equal(search.pathSteps, path.length - 1);
  assert.equal(
    search.pathCost,
    path.slice(1).reduce((sum, cell) => sum + grid.cells[cell], 0),
  );
}

const open = parse(["S......", ".......", "......G"]);

test("every algorithm finds a valid path on an open grid", () => {
  for (const algorithm of algorithms) {
    const search = solve(open, algorithm);
    assert.equal(search.status, "found", algorithm);
    assertValidPath(open, search);
  }
});

test("neighbors come in the fixed order up, right, down, left and skip walls and edges", () => {
  const grid = parse(["...", ".S.", "..."]);
  assert.deepEqual(neighbors(grid, grid.start), [1, 5, 7, 3]);
  assert.deepEqual(neighbors(grid, 0), [1, 3]);
  const walled = parse(["#.#", ".S.", "#.#"]);
  assert.deepEqual(neighbors(walled, walled.start), [1, 5, 7, 3]);
  assert.deepEqual(neighbors(parse(["S#", ".G"]), 0), [2]);
});

test("exploration order is repeatable and follows the tie-breaking rules", () => {
  const grid = parse(["...", ".S.", "..G"]);
  const order = (algorithm) => solve(grid, algorithm).expanded;
  assert.deepEqual(order("bfs").slice(0, 5), [4, 1, 5, 7, 3]);
  // DFS goes up first, then follows the stack down the first branch it can.
  assert.deepEqual(order("dfs").slice(0, 3), [4, 1, 2]);
  for (const algorithm of algorithms)
    assert.deepEqual(solve(grid, algorithm), solve(grid, algorithm));
});

test("breadth-first search finds the fewest moves", () => {
  for (const rows of [
    ["S..#...", ".#.#.#.", ".#...#G"],
    ["S.....", "#####.", "G....."],
    ["S.~.G"],
  ]) {
    const grid = parse(rows);
    const search = solve(grid, "bfs");
    assertValidPath(grid, search);
    assert.equal(search.pathSteps, fewest(grid));
  }
});

test("depth-first search finds a path but not necessarily the shortest", () => {
  // The medium grid starts mid-height, so DFS (up first) climbs before it heads for the goal.
  const grid = createGrid("medium");
  const search = solve(grid, "dfs");
  assertValidPath(grid, search);
  assert.ok(search.pathSteps > fewest(grid), "on an open grid DFS wanders");
  assert.ok(
    search.pathSteps >= fewest(grid),
    "and is never shorter than the minimum",
  );
  const comparison = compare(grid).find((row) => row.algorithm === "dfs");
  assert.equal(comparison.fewestSteps, false);
});

test("Dijkstra and A* find the lowest total weight", () => {
  for (const rows of [
    ["S.~~~~.", ".#~##~.", "...~~.G"],
    ["S~~~G", ".###.", "....."],
    ["S....", ".~~~.", "....G"],
  ]) {
    const grid = parse(rows);
    for (const algorithm of ["dijkstra", "astar"]) {
      const search = solve(grid, algorithm);
      assertValidPath(grid, search);
      assert.equal(
        search.pathCost,
        cheapest(grid),
        `${algorithm} on ${rows[0]}`,
      );
    }
  }
});

test("weights split the algorithms: BFS counts moves, Dijkstra counts cost", () => {
  // Straight through the mud is 4 moves of weight 5; around it is longer but cheaper.
  const grid = parse(["S~~~~G", "......", "......"].map((row) => row));
  const bfs = solve(grid, "bfs");
  const dijkstra = solve(grid, "dijkstra");
  assert.equal(bfs.pathSteps, 5);
  assert.ok(
    bfs.pathCost > dijkstra.pathCost,
    "BFS pays for the mud it ignored",
  );
  assert.ok(
    dijkstra.pathSteps >= bfs.pathSteps,
    "Dijkstra may take more moves for less weight",
  );
  assert.equal(dijkstra.pathCost, cheapest(grid));
  const rows = compare(grid);
  assert.equal(rows.find((r) => r.algorithm === "bfs").fewestSteps, true);
  assert.equal(rows.find((r) => r.algorithm === "bfs").lowestCost, false);
  assert.equal(rows.find((r) => r.algorithm === "dijkstra").lowestCost, true);
});

test("on a grid without weights BFS, Dijkstra and A* agree on the path length", () => {
  const grid = parse(["S..#...", ".#.#.#.", ".#...#G"]);
  const steps = ["bfs", "dijkstra", "astar"].map(
    (a) => solve(grid, a).pathSteps,
  );
  assert.deepEqual(new Set(steps).size, 1);
});

test("A* explores no more cells than Dijkstra on an open grid", () => {
  const grid = createGrid("medium");
  const astar = solve(grid, "astar");
  const dijkstra = solve(grid, "dijkstra");
  assert.equal(astar.pathCost, dijkstra.pathCost);
  assert.ok(astar.expanded.length < dijkstra.expanded.length);
});

test("an unreachable goal ends as unreachable for every algorithm", () => {
  const grid = parse(["S.#.G", "..#..", "..#.."]);
  assert.equal(reachable(grid), false);
  for (const algorithm of algorithms) {
    const search = solve(grid, algorithm);
    assert.equal(search.status, "unreachable", algorithm);
    assert.deepEqual(search.path, []);
    assert.deepEqual(search.frontier, []);
    assert.ok(
      search.expanded.every((cell) => cell % 5 < 2),
      "only the start side is explored",
    );
  }
  assert.equal(
    compare(grid).every((row) => !row.fewestSteps && !row.lowestCost),
    true,
  );
});

test("start equal to a neighbor of the goal and trivial grids", () => {
  const tiny = parse(["SG"]);
  for (const algorithm of algorithms) {
    const search = solve(tiny, algorithm);
    assert.equal(search.status, "found");
    assert.equal(search.pathSteps, 1);
    assert.equal(search.pathCost, 1);
  }
});

test("random grids: termination, agreement with reachability, and optimality", () => {
  for (const size of Object.keys(SIZES))
    for (let seed = 1; seed <= 40; seed += 1) {
      const grid = generate(createGrid(size), seed);
      const canReach = reachable(grid);
      for (const algorithm of algorithms) {
        const search = solve(grid, algorithm);
        assert.notEqual(
          search.status,
          "running",
          `${size} ${seed} ${algorithm} terminates`,
        );
        assert.equal(
          search.status === "found",
          canReach,
          `${size} ${seed} ${algorithm}`,
        );
        if (!canReach) continue;
        assertValidPath(grid, search);
        if (algorithm === "bfs") assert.equal(search.pathSteps, fewest(grid));
        if (algorithm === "dijkstra" || algorithm === "astar")
          assert.equal(
            search.pathCost,
            cheapest(grid),
            `${size} ${seed} ${algorithm}`,
          );
        if (algorithm === "dfs") assert.ok(search.pathSteps >= fewest(grid));
        assert.equal(
          new Set(search.expanded).size,
          search.expanded.length,
          "no cell is expanded twice",
        );
      }
    }
});

test("stepping one expansion at a time equals solving, and a finished search stays put", () => {
  const grid = generate(createGrid("small"), 7);
  for (const algorithm of algorithms) {
    let search = createSearch(grid, algorithm);
    let guard = 0;
    while (search.status === "running" && guard++ < 1000)
      search = stepSearch(search);
    assert.deepEqual(search, solve(grid, algorithm));
    assert.equal(stepSearch(search), search);
  }
});

test("each step expands exactly one cell and the frontier never holds an expanded cell", () => {
  const grid = generate(createGrid("small"), 3);
  let search = createSearch(grid, "astar");
  assert.deepEqual(search.frontier, [grid.start]);
  while (search.status === "running") {
    const before = search.expanded.length;
    search = stepSearch(search);
    assert.equal(search.expanded.length, before + 1);
    assert.equal(search.expanded.at(-1), search.current);
    for (const cell of search.frontier)
      assert.ok(!search.expanded.includes(cell));
  }
});

test("editing the grid: walls, mud, endpoints and clearing", () => {
  const grid = createGrid("small");
  const walled = paint(grid, 5, WALL);
  assert.equal(walled.cells[5], WALL);
  assert.equal(grid.cells[5], GROUND, "the original is not modified");
  assert.equal(
    paint(grid, grid.start, WALL),
    grid,
    "the start cannot become a wall",
  );
  assert.equal(paint(grid, grid.goal, WALL), grid, "nor the goal");
  assert.equal(paint(grid, 999, WALL), grid);
  assert.equal(paint(grid, 1.5, WALL), grid);
  assert.equal(
    paint(walled, 5, WALL),
    walled,
    "painting the same weight changes nothing",
  );
  assert.equal(paint(grid, 5, MUD).cells[5], MUD);
  assert.equal(
    paint(grid, grid.start, MUD).cells[grid.start],
    MUD,
    "mud may lie under an endpoint",
  );
  assert.equal(
    place(walled, "start", 5),
    walled,
    "the start cannot move onto a wall",
  );
  assert.equal(place(grid, "start", grid.goal), grid, "nor onto the goal");
  assert.equal(place(grid, "goal", -1), grid);
  assert.equal(place(grid, "goal", 8).goal, 8);
  assert.ok(clearGrid(walled).cells.every((w) => w === GROUND));
  assert.equal(clearGrid(walled).start, grid.start);
});

test("generate is repeatable, seed-dependent and keeps the endpoints free", () => {
  const grid = createGrid("medium");
  assert.deepEqual(generate(grid, 4), generate(grid, 4));
  assert.notDeepEqual(generate(grid, 4).cells, generate(grid, 5).cells);
  for (let seed = 1; seed <= 20; seed += 1) {
    const made = generate(grid, seed);
    assert.equal(made.cells[made.start], GROUND);
    assert.equal(made.cells[made.goal], GROUND);
    const walls = made.cells.filter((w) => w === WALL).length;
    assert.ok(
      walls > grid.cells.length * 0.1 && walls < grid.cells.length * 0.4,
    );
  }
});

test("grids keep their dimensions and the endpoints are inside", () => {
  for (const [name, { width, height }] of Object.entries(SIZES)) {
    const grid = createGrid(name);
    assert.equal(grid.cells.length, width * height);
    assert.ok(grid.start < grid.cells.length && grid.goal < grid.cells.length);
    assert.notEqual(grid.start, grid.goal);
    assert.equal(index(grid, 1, 2), width + 2);
  }
});
