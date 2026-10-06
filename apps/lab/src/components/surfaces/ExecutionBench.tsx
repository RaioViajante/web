import {
  LabBench,
  BenchBand,
  StateMark,
  ActionButton,
  TableBlock,
} from "@raioviajante/design/components";
export function ExecutionBench() {
  return (
    <div data-execution>
      <LabBench
        caption="bench · simulated in this browser"
        where={<ActionButton data-new>new example</ActionButton>}
      >
        <BenchBand>
          <div className="bench-states" aria-label="Execution lifecycle">
            <StateMark current>QUEUED</StateMark>
            <small>start →</small>
            <StateMark>RUNNING</StateMark>
            <small>succeed / fail →</small>
            <StateMark>SUCCEEDED</StateMark>
            <StateMark>FAILED</StateMark>
            <small>cancel from queued or running →</small>
            <StateMark>CANCELLED</StateMark>
          </div>
          <div className="bench-inputs">
            <label>
              <span className="rv-label">Exit code · succeed / fail</span>
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
              <span className="rv-label">Failure message</span>
              <input
                className="rv-input"
                id="failure-message"
                defaultValue="Example failure"
              />
            </label>
          </div>
          <div className="bench-actions">
            {["start", "succeed", "fail", "cancel"].map((action) => (
              <ActionButton
                key={action}
                primary={action === "start"}
                state={
                  action === "succeed" || action === "fail"
                    ? "rejected"
                    : "accepted"
                }
                data-operation={action}
              >
                {action}
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
            Sample execution. Try an operation, including one this state
            rejects.
          </p>
          <p className="bench-help" data-availability>
            Accepted now: start, cancel. Rejected now: succeed, fail.
          </p>
          <p className="bench-help">
            Solid buttons are accepted. Dotted buttons remain clickable to show
            the rejection.
          </p>
        </BenchBand>
        <BenchBand label="State">
          <dl className="bench-fields">
            {[
              "status",
              "startedAt",
              "finishedAt",
              "exitCode",
              "errorMessage",
            ].map((field) => (
              <div key={field} style={{ display: "contents" }}>
                <dt>{field}</dt>
                <dd data-field={field}>
                  {field === "status" ? "QUEUED" : "—"}
                </dd>
              </div>
            ))}
          </dl>
          <p className="bench-help">Times come from this browser’s clock.</p>
        </BenchBand>
        <BenchBand label="History">
          <ol className="bench-history" data-history>
            <li>created → QUEUED</li>
          </ol>
        </BenchBand>
      </LabBench>
      <div className="transition-rules">
        <TableBlock>
          <caption>Transition rules · Orbit cd97666</caption>
          <thead>
            <tr>
              {["action", "from", "to", "sets"].map((title) => (
                <th key={title} scope="col">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["start", "QUEUED", "RUNNING", "startedAt"],
              ["succeed", "RUNNING", "SUCCEEDED", "finishedAt, exitCode"],
              [
                "fail",
                "RUNNING",
                "FAILED",
                "finishedAt, exitCode, nonblank errorMessage",
              ],
              ["cancel", "QUEUED · RUNNING", "CANCELLED", "finishedAt"],
            ].map((row) => (
              <tr
                key={row[0]}
                data-rule={row[0]}
                className={
                  row[0] === "start" || row[0] === "cancel"
                    ? "is-available"
                    : undefined
                }
              >
                {row.map((cell, index) =>
                  index === 0 ? (
                    <th scope="row" key={index}>
                      {cell}
                    </th>
                  ) : (
                    <td key={index}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </TableBlock>
      </div>
      <noscript>Enable JavaScript to try the lifecycle operations.</noscript>
    </div>
  );
}
