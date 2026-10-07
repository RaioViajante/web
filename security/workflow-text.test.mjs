import assert from "node:assert/strict";
import test from "node:test";
import { topLevelPermissionsAreReadOnly as readOnly } from "./workflow-text.mjs";

test("exactly contents: read passes, with or without blank lines after it", () => {
  assert.ok(
    readOnly("name: CI\npermissions:\n  contents: read\nconcurrency:\n"),
  );
  assert.ok(
    readOnly("permissions:\n  contents: read\n\n\n   \nenv:\n  A: b\n"),
  );
});

test("anything more, different or missing is rejected", () => {
  for (const text of [
    "permissions:\n  contents: read\n  id-token: write\nenv:\n",
    "permissions:\n  contents: write\nenv:\n",
    "permissions: read-all\nenv:\n",
    "permissions:\n  contents: read\n",
    "permissions:\n  contents: read\n\n\n",
    "name: CI\njobs:\n",
    "jobs:\n  a:\n    permissions:\n      contents: read\n",
  ]) {
    assert.ok(!readOnly(text), JSON.stringify(text));
  }
});

test("many blank lines are handled in linear time", () => {
  const text = `permissions:\n  contents: read\n${"\n \n\t\n".repeat(200000)}`;
  const started = Date.now();
  assert.ok(!readOnly(text));
  assert.ok(Date.now() - started < 1000, "scanning must not backtrack");
  assert.ok(readOnly(`${text}env:\n`));
});
