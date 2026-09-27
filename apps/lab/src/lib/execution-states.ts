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
export function newExecution(): SampleExecution {
  return {
    status: "QUEUED",
    startedAt: null,
    finishedAt: null,
    exitCode: null,
    errorMessage: null,
  };
}
export function transition(
  state: SampleExecution,
  operation: Operation,
  exitCode: number,
  errorMessage: string,
  now: string,
): SampleExecution {
  if (operation === "start") {
    if (state.status !== "QUEUED")
      throw new Error("Only queued executions can be started");
    return { ...state, status: "RUNNING", startedAt: now };
  }
  if (operation === "succeed") {
    if (state.status !== "RUNNING")
      throw new Error("Only running executions can succeed");
    return { ...state, status: "SUCCEEDED", exitCode, finishedAt: now };
  }
  if (operation === "fail") {
    if (state.status !== "RUNNING")
      throw new Error("Only running executions can fail");
    // Java String.isBlank uses Character.isWhitespace, not JavaScript trim.
    if (
      /^[\u0009-\u000d\u001c-\u0020\u1680\u2000-\u2006\u2008-\u200a\u2028\u2029\u205f\u3000]*$/u.test(
        errorMessage,
      )
    ) {
      throw new Error("Error message must not be blank");
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
    throw new Error("Only queued or running executions can be cancelled");
  return { ...state, status: "CANCELLED", finishedAt: now };
}
