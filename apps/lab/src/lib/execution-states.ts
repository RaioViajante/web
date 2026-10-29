/** Browser reproduction of Orbit cd97666; no commands or persistence. */
export type ExecutionStatus =
  "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
export type Operation = "start" | "succeed" | "fail" | "cancel";
export interface SampleExecution {
  status: ExecutionStatus;
  startedAt: string | null;
  finishedAt: string | null;
  exitCode: number | null;
  errorMessage: string | null;
}
/**
 * Why Orbit's guards refuse an operation. The English `message` is Orbit's own
 * wording and stays as thrown; the code lets each locale word the reason
 * without matching on text.
 */
export type RejectionCode =
  | "not-queued"
  | "not-running-succeed"
  | "not-running-fail"
  | "blank-message"
  | "not-cancellable";

export class ExecutionRejection extends Error {
  readonly code: RejectionCode;
  constructor(code: RejectionCode, message: string) {
    super(message);
    this.name = "ExecutionRejection";
    this.code = code;
  }
}

export function newExecution(): SampleExecution {
  return {
    status: "QUEUED",
    startedAt: null,
    finishedAt: null,
    exitCode: null,
    errorMessage: null,
  };
}
/** Whether Orbit's guards accept `operation` in `status`, mirroring `transition`. */
export function isAllowed(
  status: ExecutionStatus,
  operation: Operation,
): boolean {
  if (operation === "start") return status === "QUEUED";
  if (operation === "cancel")
    return status === "QUEUED" || status === "RUNNING";
  return status === "RUNNING";
}

export const operations: readonly Operation[] = [
  "start",
  "succeed",
  "fail",
  "cancel",
];

export function transition(
  state: SampleExecution,
  operation: Operation,
  exitCode: number,
  errorMessage: string,
  now: string,
): SampleExecution {
  if (operation === "start") {
    if (state.status !== "QUEUED")
      throw new ExecutionRejection(
        "not-queued",
        "Only queued executions can be started",
      );
    return { ...state, status: "RUNNING", startedAt: now };
  }
  if (operation === "succeed") {
    if (state.status !== "RUNNING")
      throw new ExecutionRejection(
        "not-running-succeed",
        "Only running executions can succeed",
      );
    return { ...state, status: "SUCCEEDED", exitCode, finishedAt: now };
  }
  if (operation === "fail") {
    if (state.status !== "RUNNING")
      throw new ExecutionRejection(
        "not-running-fail",
        "Only running executions can fail",
      );
    // Java String.isBlank uses Character.isWhitespace, not JavaScript trim.
    if (
      /^[\u0009-\u000d\u001c-\u0020\u1680\u2000-\u2006\u2008-\u200a\u2028\u2029\u205f\u3000]*$/u.test(
        errorMessage,
      )
    ) {
      throw new ExecutionRejection(
        "blank-message",
        "Error message must not be blank",
      );
    }
    return {
      ...state,
      status: "FAILED",
      exitCode,
      errorMessage,
      finishedAt: now,
    };
  }
  if (state.status !== "QUEUED" && state.status !== "RUNNING")
    throw new ExecutionRejection(
      "not-cancellable",
      "Only queued or running executions can be cancelled",
    );
  return { ...state, status: "CANCELLED", finishedAt: now };
}
