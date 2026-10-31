import {
  LabBench,
  BenchBand,
  ActionButton,
  ToggleButton,
} from "@raioviajante/design/components";
import { LOCALES, type LocaleId } from "../../../../../site/locales";
import { foreignLang } from "../../lib/copy";
import { fill } from "../../lib/template";
import { catalogCounter, countTable } from "../../lib/scheduler-count";
import { schedulerCopy, type SchedulerCopy } from "../../lib/scheduler-copy";
import {
  LIMITS,
  makeJob,
  presets,
  type JobConfig,
} from "../../lib/scheduler-sim";

const first = presets[0]!;

/** One job's inputs. The script clones the rendered `<template>` copy for new jobs. */
function JobFields({
  job,
  text,
  identifierLang,
}: {
  job: JobConfig;
  text: SchedulerCopy;
  identifierLang: string | undefined;
}) {
  const number = (
    field: keyof SchedulerCopy["fieldHelp"],
    value: number,
    min: number,
    max: number,
  ) => (
    <label>
      <span className="rv-label">{text.fields[field]}</span>
      <input
        className="rv-input"
        type="number"
        inputMode="numeric"
        step={1}
        min={min}
        max={max}
        defaultValue={value}
        data-field={field}
        required
      />
      <span className="sched-hint">{text.fieldHelp[field]}</span>
    </label>
  );
  return (
    <fieldset className="sched-job" data-job data-id={job.id}>
      <legend>
        {text.jobLegend} <span data-job-id>{job.id}</span>
      </legend>
      <div className="sched-fields">
        {number("duration", job.duration, 1, LIMITS.maxDuration)}
        {number("timeout", job.timeout, 0, LIMITS.maxTimeout)}
        {number("maxRetries", job.maxRetries, 0, LIMITS.maxRetries)}
        <label>
          <span className="rv-label">{text.fields.backoff}</span>
          <select
            className="rv-input"
            data-field="backoff"
            defaultValue={job.backoff}
            lang={identifierLang}
          >
            {(["none", "fixed", "exponential"] as const).map((kind) => (
              <option key={kind} value={kind}>
                {text.backoffOptions[kind]}
              </option>
            ))}
          </select>
        </label>
        {number("backoffBase", job.backoffBase, 1, LIMITS.maxBackoffBase)}
        {number("failAttempts", job.failAttempts, 0, LIMITS.maxFailAttempts)}
        <label>
          <span className="rv-label">{text.fields.failureKind}</span>
          <select
            className="rv-input"
            data-field="failureKind"
            defaultValue={job.failureKind}
            lang={identifierLang}
          >
            {(["error", "hang"] as const).map((kind) => (
              <option key={kind} value={kind}>
                {text.failureOptions[kind]}
              </option>
            ))}
          </select>
        </label>
        {number("submitAt", job.submitAt, 0, LIMITS.maxSubmitAt)}
      </div>
      <ActionButton
        data-remove
        aria-label={fill(text.removeJob, { id: job.id })}
      >
        {fill(text.removeJob, { id: job.id })}
      </ActionButton>
    </fieldset>
  );
}

export function SchedulerBench({ locale }: { locale: LocaleId }) {
  const text = schedulerCopy[locale];
  const identifierLang = foreignLang(locale, "en");
  // The prose below the bench is rendered by the page; the script needs the rest.
  const clientCopy: Partial<SchedulerCopy> = { ...text };
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
      data-scheduler
      data-locale={locale}
      data-copy={JSON.stringify({
        intlLocale: LOCALES[locale].intlLocale,
        counts: countTable(catalogCounter(text, LOCALES[locale].intlLocale)),
        ...clientCopy,
      })}
    >
      <LabBench caption={text.caption}>
        <BenchBand label={text.presetsBand}>
          <div
            className="bench-actions"
            role="group"
            aria-label={text.presetsAria}
          >
            {presets.map((preset) => (
              <ToggleButton
                key={preset.id}
                className="sched-preset"
                pressed={preset.id === first.id}
                data-preset={preset.id}
              >
                {text.presets[preset.id].name}
              </ToggleButton>
            ))}
          </div>
          <p className="bench-help" data-preset-hint>
            {text.presets[first.id].hint}
          </p>
        </BenchBand>
        <BenchBand label={text.configBand}>
          <div className="bench-inputs sched-concurrency">
            <label>
              <span className="rv-label">{text.concurrencyLabel}</span>
              <input
                className="rv-input"
                id="sched-concurrency"
                type="number"
                inputMode="numeric"
                step={1}
                min={1}
                max={LIMITS.maxConcurrency}
                defaultValue={first.config.concurrency}
                required
              />
              <span className="sched-hint">{text.concurrencyHelp}</span>
            </label>
          </div>
          <div data-jobs>
            {first.config.jobs.map((job) => (
              <JobFields
                key={job.id}
                job={job}
                text={text}
                identifierLang={identifierLang}
              />
            ))}
          </div>
          <template data-job-template>
            <JobFields
              job={makeJob("job-0")}
              text={text}
              identifierLang={identifierLang}
            />
          </template>
          <div className="bench-actions">
            <ActionButton data-add>{text.addJob}</ActionButton>
          </div>
        </BenchBand>
        <BenchBand label={text.controlsBand}>
          <div className="bench-actions">
            <ActionButton primary data-step>
              {text.step}
            </ActionButton>
            <ActionButton data-run>{text.run}</ActionButton>
            <ActionButton data-reset>{text.reset}</ActionButton>
          </div>
          <div className="sched-speed">
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
          <p className="bench-help">
            {text.tickLabel} <strong data-tick>0</strong>
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
        <BenchBand label={text.timelineBand}>
          <div
            className="sched-scroll"
            data-scroll-region
            data-scroll-label={text.timelineCaption}
            data-timeline
          />
          <ul className="sched-legend">
            {(
              [
                "waiting",
                "queued",
                "running",
                "done",
                "failed",
                "cancelled",
              ] as const
            ).map((cell) => (
              <li key={cell}>
                <span className="sched-key" data-cell={cell}>
                  {text.marks[cell]}
                </span>{" "}
                {text.legend[cell]}
              </li>
            ))}
          </ul>
        </BenchBand>
        <BenchBand label={text.statusBand}>
          <div
            className="sched-scroll"
            data-scroll-region
            data-scroll-label={text.statusBand}
            data-jobs-table
          />
        </BenchBand>
        <BenchBand label={text.logBand}>
          <ol className="bench-history sched-log" data-log />
        </BenchBand>
      </LabBench>
      <noscript>{text.noscript}</noscript>
    </div>
  );
}
