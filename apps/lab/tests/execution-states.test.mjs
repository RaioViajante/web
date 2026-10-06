import assert from "node:assert/strict";
import { test } from "node:test";
import { newExecution, transition } from "../src/lib/execution-states.ts";

// Verified against Execution.java and ExecutionTest.java at Orbit cd97666.
const now = "2026-09-13T12:00:00.000Z";
const later = "2026-09-13T12:01:00.000Z";
const states = {
  QUEUED: newExecution(),
  RUNNING: transition(newExecution(), "start", 0, "", now),
};
states.SUCCEEDED = transition(states.RUNNING, "succeed", 7, "", later);
states.FAILED = transition(states.RUNNING, "fail", 0, "failure", later);
states.CANCELLED = transition(states.QUEUED, "cancel", 0, "", later);
const allowed = {
  start: ["QUEUED"],
  succeed: ["RUNNING"],
  fail: ["RUNNING"],
  cancel: ["QUEUED", "RUNNING"],
};
const destinations = {
  start: "RUNNING",
  succeed: "SUCCEEDED",
  fail: "FAILED",
  cancel: "CANCELLED",
};
for (const [status, state] of Object.entries(states)) {
  for (const operation of Object.keys(allowed)) {
    test(`${operation} from ${status}`, () => {
      const original = structuredClone(state);
      if (!allowed[operation].includes(status)) {
        assert.throws(() => transition(state, operation, 5, "failure", later));
      } else {
        const result = transition(state, operation, 5, "failure", later);
        assert.deepEqual(result, {
          ...state,
          status: destinations[operation],
          ...(operation === "start"
            ? { startedAt: later }
            : { finishedAt: later }),
          ...(["succeed", "fail"].includes(operation) ? { exitCode: 5 } : {}),
          ...(operation === "fail" ? { errorMessage: "failure" } : {}),
        });
      }
      assert.deepEqual(state, original);
    });
  }
}
for (const message of ["", " ", "\t\n", "\u2003", "\u001c"]) {
  test(`rejects Java-blank failure ${JSON.stringify(message)}`, () => {
    const original = structuredClone(states.RUNNING);
    assert.throws(
      () => transition(states.RUNNING, "fail", 0, message, later),
      /must not be blank/,
    );
    assert.deepEqual(states.RUNNING, original);
  });
}
test("Java considers nonbreaking space a nonblank message", () => {
  assert.equal(
    transition(states.RUNNING, "fail", 0, "\u00a0", later).errorMessage,
    "\u00a0",
  );
});
test("exit code does not decide success or failure", () => {
  assert.equal(
    transition(states.RUNNING, "succeed", -2147483648, "", later).exitCode,
    -2147483648,
  );
  assert.equal(
    transition(states.RUNNING, "fail", 0, "failure", later).status,
    "FAILED",
  );
  assert.equal(
    transition(states.RUNNING, "fail", 2147483647, "failure", later).exitCode,
    2147483647,
  );
});
test("queued cancellation has no start time", () => {
  assert.equal(states.CANCELLED.startedAt, null);
});
