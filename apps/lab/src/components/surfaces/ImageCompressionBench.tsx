import {
  LabBench,
  BenchBand,
  ActionButton,
  ToggleButton,
} from "@raioviajante/design/components";
import { LOCALES, type LocaleId } from "../../../../../site/locales";
import { formats, presets } from "../../lib/image-compression";
import {
  imageCompressionCopy,
  type ImageCompressionCopy,
} from "../../lib/image-compression-copy";
import { oneCountsFor } from "../../lib/plural-lookup-build";

const rowKeys = ["file", "dimensions", "saved", "factor", "raw"] as const;

export function ImageCompressionBench({ locale }: { locale: LocaleId }) {
  const text: ImageCompressionCopy = imageCompressionCopy[locale];
  const intlLocale = LOCALES[locale].intlLocale;
  // The prose below the bench is rendered by the page; the script needs the rest.
  const clientCopy: Partial<ImageCompressionCopy> = { ...text };
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
      data-compress
      data-locale={locale}
      data-copy={JSON.stringify({
        ...clientCopy,
        intlLocale,
        oneCounts: oneCountsFor(intlLocale, 10),
      })}
    >
      <LabBench caption={text.caption}>
        <BenchBand label={text.imageBand}>
          <div className="ic-file">
            <label>
              <span className="rv-label">{text.choose}</span>
              <input
                className="rv-input"
                type="file"
                accept="image/*"
                data-file
              />
            </label>
            <ActionButton data-sample>{text.useSample}</ActionButton>
          </div>
          <p className="bench-help">{text.fileHelp}</p>
        </BenchBand>
        <BenchBand label={text.presetsBand}>
          <div
            className="bench-actions"
            role="group"
            aria-label={text.presetsAria}
          >
            {presets.map((preset) => (
              <ToggleButton
                key={preset.id}
                pressed={false}
                data-preset={preset.id}
              >
                {text.presets[preset.id].name}
              </ToggleButton>
            ))}
          </div>
        </BenchBand>
        <BenchBand label={text.settingsBand}>
          <div className="ic-settings">
            <label>
              <span className="rv-label">{text.formatLabel}</span>
              <select className="rv-input" data-format defaultValue="jpeg">
                {formats.map((format) => (
                  <option key={format} value={format}>
                    {text.formatNames[format]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="rv-label">{text.qualityLabel}</span>
              <input
                type="range"
                data-quality
                min={1}
                max={100}
                step={1}
                defaultValue={80}
              />
              <span className="ic-value" data-quality-text />
            </label>
            <label>
              <span className="rv-label">{text.scaleLabel}</span>
              <input
                type="range"
                data-scale
                min={10}
                max={100}
                step={5}
                defaultValue={100}
              />
              <span className="ic-value" data-scale-text />
            </label>
          </div>
          <p className="bench-help" data-quality-note hidden>
            {text.qualityLossless}
          </p>
          <p className="bench-help" data-transparency-note>
            {text.transparencyNote}
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
        <BenchBand label={text.resultBand}>
          <div
            className="ic-scroll"
            data-scroll-region
            data-scroll-label={text.resultBand}
          >
            <table className="ic-table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="rv-sr-only">{text.resultBand}</span>
                  </th>
                  <th scope="col">{text.resultHeaders[1]}</th>
                  <th scope="col">{text.resultHeaders[2]}</th>
                </tr>
              </thead>
              <tbody>
                {rowKeys.map((key) => (
                  <tr key={key}>
                    <th scope="row">
                      {text.rows[key]}{" "}
                      <small>
                        (
                        {key === "factor" || key === "raw"
                          ? text.theoretical
                          : text.measured}
                        )
                      </small>
                    </th>
                    <td data-cell={`${key}-original`}>—</td>
                    <td data-cell={`${key}-output`}>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BenchBand>
        <BenchBand label={text.compareBand}>
          <div className="ic-stage" data-stage hidden>
            <canvas data-original role="img" aria-label={text.originalAlt} />
            <canvas data-result role="img" aria-label={text.resultAlt} />
            <canvas
              data-difference
              role="img"
              aria-label={text.differenceAlt}
              hidden
            />
            <span className="ic-tag ic-tag-left">{text.original}</span>
            <span className="ic-tag ic-tag-right">{text.result}</span>
          </div>
          <div className="ic-compare" data-compare-controls hidden>
            <label>
              <span className="rv-label">{text.compareLabel}</span>
              <input
                type="range"
                data-split
                min={0}
                max={100}
                step={1}
                defaultValue={50}
              />
            </label>
            <div className="bench-actions">
              <ToggleButton pressed={false} data-diff>
                {text.showDifference}
              </ToggleButton>
              <ToggleButton pressed={false} data-zoom>
                {text.zoom}
              </ToggleButton>
            </div>
            <p className="bench-help">{text.differenceNote}</p>
          </div>
        </BenchBand>
        <BenchBand label={text.sweepBand}>
          <div className="bench-actions">
            <ActionButton data-sweep>{text.sweepRun}</ActionButton>
          </div>
          <div
            className="ic-scroll"
            data-scroll-region
            data-scroll-label={text.sweepBand}
            data-sweep-out
          />
          <p className="bench-help">{text.sweepNote}</p>
        </BenchBand>
      </LabBench>
      <noscript>{text.noscript}</noscript>
    </div>
  );
}
