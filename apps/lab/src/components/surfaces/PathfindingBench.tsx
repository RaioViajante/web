import {
  LabBench,
  BenchBand,
  ActionButton,
  ToggleButton,
} from "@raioviajante/design/components";
import { LOCALES, type LocaleId } from "../../../../../site/locales";
import { oneCountsFor } from "../../lib/pathfinding-count";
import {
  pathfindingCopy,
  type PathfindingCopy,
  type Tool,
} from "../../lib/pathfinding-copy";
import { SIZES, algorithms, type SizeName } from "../../lib/pathfinding";

const tools: readonly Tool[] = ["wall", "mud", "erase", "start", "goal"];
const legendKeys = [
  "start",
  "goal",
  "wall",
  "mud",
  "frontier",
  "expanded",
  "path",
] as const;
const MAX_CELLS = Math.max(
  ...Object.values(SIZES).map((s) => s.width * s.height),
);

export function PathfindingBench({ locale }: { locale: LocaleId }) {
  const text: PathfindingCopy = pathfindingCopy[locale];
  const intlLocale = LOCALES[locale].intlLocale;
  // The prose below the bench is rendered by the page; the script needs the rest.
  const clientCopy: Partial<PathfindingCopy> = { ...text };
  for (const key of [
    "concepts",
    "limits",
    "conceptsHeading",
    "limitsHeading",
    "noscript",
  ] as const)
    delete clientCopy[key];
  return (
    <div
      data-pathfinding
      data-locale={locale}
      data-copy={JSON.stringify({
        ...clientCopy,
        oneCounts: oneCountsFor(intlLocale, MAX_CELLS),
      })}
    >
      <LabBench caption={text.caption}>
        <BenchBand label={text.toolsBand}>
          <div
            className="bench-actions"
            role="group"
            aria-label={text.toolsAria}
          >
            {tools.map((tool) => (
              <ToggleButton
                key={tool}
                pressed={tool === "wall"}
                data-tool={tool}
              >
                {text.tools[tool]}
              </ToggleButton>
            ))}
          </div>
          <p className="bench-help">{text.keyboardHelp}</p>
          <p className="bench-help">{text.touchHelp}</p>
        </BenchBand>
        <BenchBand label={text.algorithmBand}>
          <div
            className="bench-actions"
            role="group"
            aria-label={text.algorithmAria}
          >
            {algorithms.map((algorithm) => (
              <ToggleButton
                key={algorithm}
                pressed={algorithm === "bfs"}
                data-algorithm={algorithm}
              >
                {text.algorithmNames[algorithm]}
              </ToggleButton>
            ))}
          </div>
          <p className="bench-help" data-algorithm-note>
            {text.algorithmNotes.bfs}
          </p>
          <div className="path-size">
            <label>
              <span className="rv-label">{text.sizeLabel}</span>
              <select className="rv-input" data-size defaultValue="medium">
                {(Object.keys(SIZES) as SizeName[]).map((size) => (
                  <option key={size} value={size}>
                    {text.sizes[size]}
                  </option>
                ))}
              </select>
            </label>
            <ActionButton data-generate>{text.generate}</ActionButton>
            <ActionButton data-clear>{text.clear}</ActionButton>
          </div>
        </BenchBand>
        <BenchBand label={text.gridBand}>
          <div
            className="path-grid"
            role="grid"
            aria-label={text.gridLabel}
            data-grid
            data-grid-size="medium"
          />
          <ul className="path-legend">
            {legendKeys.map((key) => (
              <li key={key}>
                <span className="path-key" data-kind={key}>
                  {text.marks[key]}
                </span>{" "}
                {text.legend[key]}
              </li>
            ))}
          </ul>
        </BenchBand>
        <BenchBand label={text.controlsBand}>
          <div className="bench-actions">
            <ActionButton primary data-step>
              {text.step}
            </ActionButton>
            <ActionButton data-run>{text.run}</ActionButton>
            <ActionButton data-reset-search>{text.resetSearch}</ActionButton>
            <ActionButton data-compare>{text.compare}</ActionButton>
          </div>
          <div className="path-speed">
            <label>
              <span className="rv-label">{text.speedLabel}</span>
              <input
                type="range"
                data-speed
                min={1}
                max={5}
                step={1}
                defaultValue={3}
              />
            </label>
            <span data-speed-text />
          </div>
          <p className="bench-help" data-reduced hidden>
            {text.reducedMotionNote}
          </p>
          <p
            className="bench-feedback"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-status
          >
            {text.messages.ready}
          </p>
        </BenchBand>
        <BenchBand label={text.statsBand}>
          <dl className="bench-fields">
            {(["status", "explored", "frontier", "moves", "cost"] as const).map(
              (key) => (
                <div key={key} style={{ display: "contents" }}>
                  <dt>{text.stats[key]}</dt>
                  <dd data-stat={key}>
                    {key === "status" ? text.statusNames.idle : "0"}
                  </dd>
                </div>
              ),
            )}
          </dl>
        </BenchBand>
        <BenchBand label={text.compareBand}>
          <div className="path-compare" data-compare-out />
          <p className="bench-help">{text.compareNote}</p>
        </BenchBand>
      </LabBench>
      <noscript>{text.noscript}</noscript>
    </div>
  );
}
