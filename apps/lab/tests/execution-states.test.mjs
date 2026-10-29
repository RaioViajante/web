import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ExecutionRejection,
  isAllowed,
  newExecution,
  operations,
  transition,
} from "../src/lib/execution-states.ts";
import { availabilityText } from "../src/lib/execution-view.ts";
import { executionCopy } from "../src/lib/bench-copy.ts";

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

// Localized wording never replaces Orbit's own messages: each rejection keeps
// the English `message` it always had and adds a stable code.
const rejection = (run) => {
  try {
    run();
  } catch (error) {
    return error;
  }
  assert.fail("expected a rejection");
};
test("rejections carry Orbit's message and a code every locale words", () => {
  const cases = [
    [
      () => transition(states.RUNNING, "start", 0, "", later),
      "not-queued",
      "Only queued executions can be started",
    ],
    [
      () => transition(states.QUEUED, "succeed", 0, "", later),
      "not-running-succeed",
      "Only running executions can succeed",
    ],
    [
      () => transition(states.QUEUED, "fail", 0, "x", later),
      "not-running-fail",
      "Only running executions can fail",
    ],
    [
      () => transition(states.RUNNING, "fail", 0, " ", later),
      "blank-message",
      "Error message must not be blank",
    ],
    [
      () => transition(states.SUCCEEDED, "cancel", 0, "", later),
      "not-cancellable",
      "Only queued or running executions can be cancelled",
    ],
  ];
  for (const [run, code, message] of cases) {
    const error = rejection(run);
    assert.ok(error instanceof ExecutionRejection);
    assert.ok(error instanceof Error);
    assert.equal(error.code, code);
    assert.equal(error.message, message);
    assert.equal(executionCopy.en.reasons[code], message);
    assert.ok(executionCopy["pt-BR"].reasons[code]);
    assert.notEqual(executionCopy["pt-BR"].reasons[code], message);
  }
  assert.deepEqual(
    Object.keys(executionCopy["pt-BR"].reasons).sort(),
    [...cases.map(([, code]) => code), "exit-code-range"].sort(),
  );
});

test("isAllowed mirrors transition for every state and operation", () => {
  for (const [status, state] of Object.entries(states))
    for (const operation of operations) {
      let accepted = true;
      try {
        transition(state, operation, 0, "failure", later);
      } catch {
        accepted = false;
      }
      assert.equal(
        isAllowed(status, operation),
        accepted,
        `${operation} from ${status}`,
      );
    }
});

test("the availability line is worded in the bench's language", () => {
  assert.equal(
    availabilityText(executionCopy.en, "QUEUED"),
    "Accepted now: start, cancel. Rejected now: succeed, fail.",
  );
  assert.equal(
    availabilityText(executionCopy.en, "SUCCEEDED"),
    "Accepted now: none. Rejected now: start, succeed, fail, cancel.",
  );
  assert.equal(
    availabilityText(executionCopy["pt-BR"], "QUEUED"),
    "Aceitas agora: iniciar, cancelar. Rejeitadas agora: concluir com sucesso, falhar.",
  );
  assert.equal(
    availabilityText(executionCopy["pt-BR"], "FAILED"),
    "Aceitas agora: nenhuma. Rejeitadas agora: iniciar, concluir com sucesso, falhar, cancelar.",
  );
  assert.equal(
    availabilityText(executionCopy["pt-BR"], "RUNNING"),
    "Aceitas agora: concluir com sucesso, falhar, cancelar. Rejeitadas agora: iniciar.",
  );
});
