import {
  LabBench,
  BenchBand,
  StateMark,
  ActionButton,
  TableBlock,
} from "@raioviajante/design/components";
import { executionCopy } from "../../lib/bench-copy";
import { foreignLang } from "../../lib/copy";
import {
  isAllowed,
  newExecution,
  operations,
  type ExecutionStatus,
} from "../../lib/execution-states";
import { availabilityText } from "../../lib/execution-view";
import type { LocaleId } from "../../../../../site/locales";

export function ExecutionBench({ locale }: { locale: LocaleId }) {
  const text = executionCopy[locale];
  // Orbit's status values and field names are English identifiers on every page.
  const identifierLang = foreignLang(locale, "en");
  const initial = newExecution();
  const mark = (status: ExecutionStatus) =>
    identifierLang ? <span lang={identifierLang}>{status}</span> : status;
  return (
    <div
      data-execution
      data-locale={locale}
      data-copy={JSON.stringify({
        operations: text.operations,
        availability: text.availability,
        none: text.none,
        defaultFailureMessage: text.defaultFailureMessage,
        messages: text.messages,
        reasons: text.reasons,
      })}
    >
      <LabBench
        caption={text.caption}
        where={<ActionButton data-new>{text.newExample}</ActionButton>}
      >
        <BenchBand>
          <div
            className="bench-states"
            role="group"
            aria-label={text.lifecycleAria}
          >
            <StateMark current>{mark("QUEUED")}</StateMark>
            <small>{text.lifecycle.start}</small>
            <StateMark>{mark("RUNNING")}</StateMark>
            <small>{text.lifecycle.finish}</small>
            <StateMark>{mark("SUCCEEDED")}</StateMark>
            <StateMark>{mark("FAILED")}</StateMark>
            <small>{text.lifecycle.cancel}</small>
            <StateMark>{mark("CANCELLED")}</StateMark>
          </div>
          <div className="bench-inputs">
            <label>
              <span className="rv-label">{text.exitCodeLabel}</span>
              <input
                className="rv-input"
                id="exit-code"
                type="number"
                step={1}
                min={-2147483648}
                max={2147483647}
                defaultValue={0}
                required
              />
            </label>
            <label>
              <span className="rv-label">{text.failureMessageLabel}</span>
              <input
                className="rv-input"
                id="failure-message"
                defaultValue={text.defaultFailureMessage}
              />
            </label>
          </div>
          <div className="bench-actions">
            {operations.map((action) => (
              <ActionButton
                key={action}
                primary={action === "start"}
                state={isAllowed("QUEUED", action) ? "accepted" : "rejected"}
                data-operation={action}
              >
                {text.operations[action]}
              </ActionButton>
            ))}
          </div>
          <p
            className="bench-feedback"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-feedback
          >
            {text.initialFeedback}
          </p>
          <p className="bench-help" data-availability>
            {availabilityText(text, initial.status)}
          </p>
          <p className="bench-help">{text.solidHelp}</p>
        </BenchBand>
        <BenchBand label={text.stateBand}>
          <dl className="bench-fields">
            {(
              [
                "status",
                "startedAt",
                "finishedAt",
                "exitCode",
                "errorMessage",
              ] as const
            ).map((field) => (
              <div key={field} style={{ display: "contents" }}>
                <dt lang={identifierLang}>{field}</dt>
                <dd
                  data-field={field}
                  lang={field === "status" ? identifierLang : undefined}
                >
                  {field === "status" ? initial.status : "—"}
                </dd>
              </div>
            ))}
          </dl>
          <p className="bench-help">{text.clockHelp}</p>
        </BenchBand>
        <BenchBand label={text.historyBand}>
          <ol className="bench-history" data-history>
            <li>{text.messages.created}</li>
          </ol>
        </BenchBand>
      </LabBench>
      <div className="transition-rules">
        <TableBlock>
          <caption>{text.rules.caption}</caption>
          <thead>
            <tr>
              {text.rules.headers.map((title) => (
                <th key={title} scope="col">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operations.map((operation) => {
              const id = (name: string) =>
                identifierLang ? (
                  <span lang={identifierLang}>{name}</span>
                ) : (
                  name
                );
              const rule = {
                start: ["QUEUED", "RUNNING", id("startedAt")],
                succeed: [
                  "RUNNING",
                  "SUCCEEDED",
                  <>
                    {id("finishedAt")}, {id("exitCode")}
                  </>,
                ],
                fail: [
                  "RUNNING",
                  "FAILED",
                  <>
                    {id("finishedAt")}, {id("exitCode")},{" "}
                    {text.rules.failSets.before}
                    {id("errorMessage")}
                    {text.rules.failSets.after}
                  </>,
                ],
                cancel: ["QUEUED · RUNNING", "CANCELLED", id("finishedAt")],
              }[operation];
              const label = text.operations[operation];
              return (
                <tr
                  key={operation}
                  data-rule={operation}
                  className={
                    isAllowed(initial.status, operation)
                      ? "is-available"
                      : undefined
                  }
                >
                  <th scope="row">
                    {label}
                    {label !== operation && (
                      <>
                        {" ("}
                        <span lang={identifierLang}>{operation}</span>
                        {")"}
                      </>
                    )}
                  </th>
                  <td lang={identifierLang}>{rule[0]}</td>
                  <td lang={identifierLang}>{rule[1]}</td>
                  <td>{rule[2]}</td>
                </tr>
              );
            })}
          </tbody>
        </TableBlock>
      </div>
      <noscript>{text.noscript}</noscript>
    </div>
  );
}
