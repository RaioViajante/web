// The small sketches of the projects only the catalog shows (yanawa, Sweep,
// Hum, Morrowferry), and the dispatcher for all eight. Server-rendered,
// decorative, animated only by CSS (no inline styles: Root's CSP blocks
// them), and still under reduced motion.

import type { ProjectArtCopy, ProjectId } from "../../lib/projects";
import { FeaturedMini, type FeaturedId } from "./minis";
import "./catalog-minis.css";

const yanawaTokens = [
  ["let", "is-keyword"],
  ["name", ""],
  [":", "is-punct"],
  ["str", "is-type"],
  ["=", "is-punct"],
  ['"Morgan"', "is-string"],
] as const;

function YanawaSketch({ copy }: { copy: ProjectArtCopy }) {
  return (
    <>
      <span className="ya__note">{copy.yanawa.note}</span>
      <span className="ya__code">
        <span className="ya__typed">
          <span className="is-keyword">let</span> name
          <span className="is-punct">:</span>{" "}
          <span className="is-type">str</span>{" "}
          <span className="is-punct">=</span>{" "}
          <span className="is-string">&quot;Morgan&quot;</span>
        </span>
        <span className="ya__cursor" />
      </span>
      <span className="ya__tokens">
        <span className="ya__label">{copy.yanawa.tokens}</span>
        <span className="ya__token-list">
          {yanawaTokens.map(([text, kind], index) => (
            <span key={index} className={`ya__token ${kind}`}>
              {text}
            </span>
          ))}
        </span>
      </span>
      <span className="ya__tree">
        <span className="ya__label">{copy.yanawa.tree}</span>
        <svg viewBox="0 0 128 70">
          <line x1="64" y1="24" x2="22" y2="54" />
          <line x1="64" y1="24" x2="64" y2="54" />
          <line x1="64" y1="24" x2="106" y2="54" />
        </svg>
        <span className="ya__node is-keyword is-root">let</span>
        <span className="ya__node is-left">name</span>
        <span className="ya__node is-type is-middle">str</span>
        <span className="ya__node is-string is-right">&quot;Morgan&quot;</span>
      </span>
    </>
  );
}

const sweepCategories = ["Images/", "Documents/", "Archives/", "Other/"];

function SweepSketch({ copy }: { copy: ProjectArtCopy }) {
  return (
    <>
      <span className="sw__path">~/Downloads</span>
      <span className="sw__command">
        <span className="sw__prompt">$</span> sweep run ~/Downloads
      </span>
      {copy.sweep.files.map((file, index) => (
        <span key={file} className="sw__row">
          <span className="sw__file">{file}</span>
          <span className="sw__arrow">→</span>
          <span className="sw__dest">{sweepCategories[index]}</span>
          <span className="sw__ok">✓</span>
        </span>
      ))}
      <span className="sw__done">{copy.sweep.done}</span>
    </>
  );
}

// Twenty-four bars; projects.css staggers their timings.
const humBars = Array.from({ length: 24 });

function HumSketch({ copy }: { copy: ProjectArtCopy }) {
  return (
    <span className="hu__box">
      <span className="hu__head">
        <span>hum</span>
        <span>{copy.hum.note}</span>
      </span>
      <span className="hu__now">
        <span className="hu__play">▶</span>
        {copy.hum.track}
        <span className="hu__state">{copy.hum.nowPlaying}</span>
      </span>
      <span className="hu__bars">
        {humBars.map((bar, index) => (
          <i key={index} />
        ))}
      </span>
      <span className="hu__controls">
        <span>|◂</span>
        <span>❙❙</span>
        <span>▸|</span>
        <span className="hu__progress" />
        <span>{copy.hum.volume} ▮▮▮▯</span>
      </span>
    </span>
  );
}

/** One pixel row: x, y, width, height and a palette name (`--ferry-*`). */
type Pixel = readonly [number, number, number, number, string];

const ferrySky: Pixel[] = [
  [68, 5, 5, 1, "moon"],
  [67, 6, 7, 1, "moon"],
  [66, 7, 9, 7, "moon"],
  [67, 14, 7, 1, "moon"],
  [68, 15, 5, 1, "moon"],
  [73, 9, 1, 4, "moon-shade"],
  [72, 13, 2, 1, "moon-shade"],
  [60, 13, 9, 1, "cloud-light"],
  [57, 14, 24, 1, "cloud-light"],
  [63, 12, 4, 1, "cloud-light"],
  [75, 13, 6, 1, "cloud-light"],
  [52, 15, 10, 1, "cloud"],
  [74, 15, 9, 1, "cloud"],
  [21, 17, 10, 1, "cloud"],
  [24, 16, 4, 1, "cloud"],
  [17, 18, 6, 1, "cloud"],
];
const ferryStars = [
  [8, 4],
  [19, 8],
  [43, 3],
  [88, 5],
  [54, 7],
  [33, 11],
  [91, 14],
];
const ferryReeds: Pixel[] = [
  [7, 26, 1, 7, "reed"],
  [9, 24, 1, 9, "reed"],
  [11, 27, 1, 6, "reed"],
  [86, 25, 1, 8, "reed"],
  [88, 27, 1, 6, "reed"],
  [90, 24, 1, 9, "reed"],
  [9, 23, 1, 1, "reed-tip"],
  [88, 26, 1, 1, "reed-tip"],
];
const ferryBoat: Pixel[] = [
  [23, 26, 2, 1, "hull"],
  [69, 25, 2, 1, "hull"],
  [70, 24, 2, 1, "hull"],
  [24, 27, 47, 1, "hull"],
  [25, 28, 45, 1, "hull-dark"],
  [27, 29, 41, 1, "hull-dark"],
  [30, 30, 35, 1, "keel"],
  [31, 29, 2, 1, "moss"],
  [36, 29, 1, 1, "moss"],
  [41, 29, 2, 1, "moss"],
  [47, 29, 1, 1, "moss"],
  [53, 29, 2, 1, "moss"],
  [58, 29, 1, 1, "moss"],
  [62, 29, 1, 1, "moss"],
  [28, 22, 1, 2, "oar"],
  [27, 24, 1, 2, "oar"],
  [26, 26, 1, 2, "oar"],
  [25, 28, 1, 2, "oar"],
  [24, 30, 1, 2, "oar"],
  [23, 32, 1, 2, "oar"],
  [26, 19, 1, 8, "pole"],
  [27, 19, 3, 2, "flag"],
  [34, 17, 2, 1, "cloak"],
  [33, 18, 4, 1, "cloak"],
  [33, 19, 3, 1, "cloak"],
  [36, 19, 1, 1, "bone-shade"],
  [32, 20, 4, 1, "cloak"],
  [36, 20, 1, 1, "bone"],
  [32, 21, 5, 6, "cloak"],
  [32, 23, 1, 4, "cloak-dark"],
  [37, 22, 2, 1, "cloak"],
  [36, 21, 1, 2, "bone"],
  [39, 13, 1, 14, "pole"],
  [40, 13, 1, 1, "pole"],
  [40, 14, 1, 1, "pole-light"],
  [44, 26, 8, 1, "oar"],
  [46, 21, 4, 1, "cap"],
  [45, 22, 1, 1, "cap"],
  [46, 22, 1, 1, "hair"],
  [47, 22, 2, 1, "skin"],
  [46, 23, 4, 3, "coat"],
  [50, 24, 1, 2, "bag"],
  [62, 17, 1, 10, "pole"],
  [62, 16, 4, 1, "pole"],
  [65, 17, 1, 1, "pole"],
  [64, 18, 3, 1, "hull-dark"],
  [64, 21, 3, 1, "hull-dark"],
];
// Four rows of ripples, nine pixels apart, that slide one period to the left.
const ferryWaves: Pixel[] = (
  [
    [32, -9, 4, "wave"],
    [34, -5, 3, "wave-light"],
    [36, -7, 4, "wave"],
    [38, -3, 4, "wave-dark"],
  ] as const
).flatMap(([y, start, width, color]) =>
  Array.from(
    { length: 14 },
    (_, index) => [start + index * 9, y, width, 1, color] as const,
  ),
);

function Pixels({ pixels }: { pixels: readonly Pixel[] }) {
  return pixels.map(([x, y, width, height, color], index) => (
    <rect
      key={index}
      x={x}
      y={y}
      width={width}
      height={height}
      fill={`var(--ferry-${color})`}
    />
  ));
}

function MorrowferrySketch() {
  return (
    <svg
      className="mf__scene"
      viewBox="8 2 82 34"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect x="-20" y="-10" width="140" height="60" fill="var(--ferry-night)" />
      <g fill="var(--ferry-moon)">
        {ferryStars.map(([x, y], index) => (
          <rect
            key={index}
            className={`mf__star is-${(index % 3) + 1}`}
            x={x}
            y={y}
            width="1"
            height="1"
          />
        ))}
      </g>
      <Pixels pixels={ferrySky} />
      <rect x="0" y="31" width="96" height="9" fill="var(--ferry-water)" />
      <g className="mf__water">
        <Pixels pixels={ferryWaves} />
      </g>
      <g className="mf__reflection" fill="var(--ferry-lamp)">
        <rect x="63" y="32" width="4" height="1" />
        <rect x="64" y="34" width="3" height="1" opacity=".8" />
        <rect x="64" y="36" width="2" height="1" opacity=".6" />
      </g>
      <Pixels pixels={ferryReeds} />
      <g className="mf__boat">
        <Pixels pixels={ferryBoat} />
        <g className="mf__lamp">
          <rect x="64" y="19" width="3" height="2" fill="var(--ferry-lamp)" />
          <rect
            x="65"
            y="19"
            width="1"
            height="1"
            fill="var(--ferry-lamp-light)"
          />
        </g>
      </g>
    </svg>
  );
}

const featured = new Set<ProjectId>([
  "mochifile",
  "ordelis",
  "refrain",
  "orbit",
]);

/** The small sketch of any project, by id. */
export function MiniSketch({
  id,
  copy,
  intlLocale,
}: {
  id: ProjectId;
  copy: ProjectArtCopy;
  intlLocale: string;
}) {
  if (featured.has(id))
    return (
      <FeaturedMini id={id as FeaturedId} copy={copy} intlLocale={intlLocale} />
    );
  return (
    <span className={`mn mn--${id}`} aria-hidden="true">
      {id === "yanawa" ? (
        <YanawaSketch copy={copy} />
      ) : id === "sweep" ? (
        <SweepSketch copy={copy} />
      ) : id === "hum" ? (
        <HumSketch copy={copy} />
      ) : (
        <MorrowferrySketch />
      )}
    </span>
  );
}
