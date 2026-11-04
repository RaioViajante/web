// Hand-drawn strokes for the Refrain sketch: every line is drawn twice with a
// small, seeded wobble, like ink going over the same mark. The output is
// deterministic (same seed, same path), so server and client agree and the
// sketch never changes between visits. Paths are SVG `d` strings.

/** A small seeded generator (mulberry32). */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (value: number) => Number(value.toFixed(1));

/** A slightly bent line, drawn twice. */
export function roughLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  wobble = 1.4,
) {
  const next = random(seed);
  const jitter = () => (next() - 0.5) * 2 * wobble;
  const pass = () => {
    const c1x = x1 + (x2 - x1) * 0.3 + jitter();
    const c1y = y1 + (y2 - y1) * 0.3 + jitter();
    const c2x = x1 + (x2 - x1) * 0.7 + jitter();
    const c2y = y1 + (y2 - y1) * 0.7 + jitter();
    return `M${n(x1 + jitter() / 2)} ${n(y1 + jitter() / 2)} C${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(x2 + jitter() / 2)} ${n(y2 + jitter() / 2)}`;
  };
  return `${pass()} ${pass()}`;
}

/** An ellipse that does not quite close, drawn twice. */
export function roughEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  wobble = 0.05,
) {
  const next = random(seed);
  const steps = 10;
  const pass = (overshoot: number) => {
    const start = next() * Math.PI * 2;
    const points = Array.from({ length: steps + 1 }, (_, index) => {
      const angle = start + (index / steps) * (Math.PI * 2 + overshoot);
      const scale = 1 + (next() - 0.5) * 2 * wobble;
      return [
        cx + Math.cos(angle) * rx * scale,
        cy + Math.sin(angle) * ry * scale,
      ];
    });
    // Catmull-Rom through the points, as cubic Béziers.
    let d = `M${n(points[0]![0])} ${n(points[0]![1])}`;
    for (let index = 0; index < points.length - 1; index++) {
      const p0 = points[Math.max(index - 1, 0)]!;
      const p1 = points[index]!;
      const p2 = points[index + 1]!;
      const p3 = points[Math.min(index + 2, points.length - 1)]!;
      d += ` C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])} ${n(p2[1])}`;
    }
    return d;
  };
  return `${pass(0.25)} ${pass(0.1)}`;
}

/** A box of four rough lines. */
export function roughRect(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
  wobble = 1.6,
) {
  return [
    roughLine(x, y, x + width, y, seed, wobble),
    roughLine(x + width, y, x + width, y + height, seed + 1, wobble),
    roughLine(x + width, y + height, x, y + height, seed + 2, wobble),
    roughLine(x, y + height, x, y, seed + 3, wobble),
  ].join(" ");
}

/** The ten points of a five-pointed star. */
function starPoints(cx: number, cy: number, radius: number) {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const r = index % 2 ? radius * 0.45 : radius;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r] as const;
  });
}

/** A star outline in rough strokes. */
export function roughStar(
  cx: number,
  cy: number,
  radius: number,
  seed: number,
) {
  const points = starPoints(cx, cy, radius);
  return points
    .map((point, index) => {
      const to = points[(index + 1) % points.length]!;
      return roughLine(point[0], point[1], to[0], to[1], seed + index, 0.5);
    })
    .join(" ");
}

/** The same star as a plain closed shape, for its fill. */
export function starFill(cx: number, cy: number, radius: number) {
  return `M${starPoints(cx, cy, radius)
    .map(([x, y]) => `${n(x)} ${n(y)}`)
    .join(" L")}Z`;
}

/** Parallel diagonal strokes inside a circle, like a pen shading a label. */
export function hatchCircle(radius: number, gap: number, seed: number) {
  const strokes: string[] = [];
  for (let offset = -radius + gap / 2; offset < radius; offset += gap) {
    const half = Math.sqrt(radius * radius - offset * offset);
    // A 45° line at distance `offset` from the center.
    const ux = Math.SQRT1_2;
    const uy = -Math.SQRT1_2;
    const px = offset * Math.SQRT1_2;
    const py = offset * Math.SQRT1_2;
    strokes.push(
      roughLine(
        px - ux * half,
        py - uy * half,
        px + ux * half,
        py + uy * half,
        seed + strokes.length,
        0.4,
      ),
    );
  }
  return strokes.join(" ");
}
