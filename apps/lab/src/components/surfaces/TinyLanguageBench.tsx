import {
  LabBench,
  BenchBand,
  ActionButton,
  ToggleButton,
} from "@raioviajante/design/components";
import { LOCALES, type LocaleId } from "../../../../../site/locales";
import { LIMITS } from "../../lib/tiny-language";
import { examples } from "../../lib/tiny-language-examples";
import {
  tinyLanguageCopy,
  type Panel,
  type TinyLanguageCopy,
} from "../../lib/tiny-language-copy";
import { oneCountsFor } from "../../lib/plural-lookup-build";

const panels: readonly Panel[] = ["tokens", "tree", "run"];
const MAX_COUNT = 4000;

export function TinyLanguageBench({ locale }: { locale: LocaleId }) {
  const text: TinyLanguageCopy = tinyLanguageCopy[locale];
  const intlLocale = LOCALES[locale].intlLocale;
  // The prose below the bench is rendered by the page; the script needs the rest.
  const clientCopy: Partial<TinyLanguageCopy> = { ...text };
  for (const key of [
    "concepts",
    "limits",
    "conceptsHeading",
    "limitsHeading",
    "noscript",
  ] as const)
    delete clientCopy[key];
  const first = examples[0]!;
  return (
    <div
      data-tiny
      data-locale={locale}
      data-copy={JSON.stringify({
        ...clientCopy,
        intlLocale,
        maxChars: LIMITS.maxChars,
        oneCounts: oneCountsFor(intlLocale, MAX_COUNT),
        sources: Object.fromEntries(examples.map((e) => [e.id, e.source])),
      })}
    >
      <LabBench caption={text.caption}>
        <BenchBand label={text.examplesBand}>
          <div
            className="bench-actions"
            role="group"
            aria-label={text.examplesAria}
          >
            {examples.map((example) => (
              <ToggleButton
                key={example.id}
                pressed={example.id === first.id}
                data-example={example.id}
              >
                {text.examples[example.id].name}
              </ToggleButton>
            ))}
          </div>
          <p className="bench-help" data-example-hint>
            {text.examples[first.id].hint}
          </p>
        </BenchBand>
        <BenchBand label={text.sourceBand}>
          <label className="tiny-source">
            <span className="rv-sr-only">{text.sourceLabel}</span>
            <textarea
              className="rv-input tiny-code"
              data-source
              rows={12}
              maxLength={LIMITS.maxChars}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              defaultValue={first.source}
            />
          </label>
          <p className="bench-help">{text.sourceHelp}</p>
          <p className="bench-help" data-chars />
        </BenchBand>
        <BenchBand label={text.problemsBand}>
          <p
            className="bench-feedback"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-status
          >
            {text.messages.ready}
          </p>
          <ul className="tiny-problems" data-problems />
        </BenchBand>
        <BenchBand label={text.panelsBand}>
          <div
            className="bench-actions"
            role="group"
            aria-label={text.panelsAria}
          >
            {panels.map((panel) => (
              <ToggleButton
                key={panel}
                pressed={panel === "tokens"}
                data-panel-button={panel}
              >
                {text.panels[panel]}
              </ToggleButton>
            ))}
          </div>
          <p className="bench-help" data-panel-help>
            {text.panelHelp.tokens}
          </p>
          <div className="bench-actions">
            <ActionButton data-previous>{text.previous}</ActionButton>
            <ActionButton data-next>{text.next}</ActionButton>
          </div>
          <div className="tiny-panel" data-panel="tokens" />
          <div className="tiny-panel" data-panel="tree" hidden />
          <div className="tiny-panel" data-panel="run" hidden>
            <div className="bench-actions">
              <ActionButton primary data-run>
                {text.run}
              </ActionButton>
              <ActionButton data-step>{text.step}</ActionButton>
              <ActionButton data-reset-run>{text.resetRun}</ActionButton>
            </div>
            <h3 className="rv-label tiny-label">{text.outputLabel}</h3>
            <pre
              className="tiny-output"
              data-output
              data-scroll-region
              data-scroll-label={text.outputLabel}
            />
            <h3 className="rv-label tiny-label">{text.traceLabel}</h3>
            <div className="tiny-scroll" data-trace />
          </div>
        </BenchBand>
      </LabBench>
      <noscript>{text.noscript}</noscript>
    </div>
  );
}
