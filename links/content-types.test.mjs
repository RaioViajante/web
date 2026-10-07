import assert from "node:assert/strict";
import test from "node:test";
import { typeOk } from "./content-types.mjs";

const accepts = (kind, type) => typeOk[kind].test(type);

test("images must be image/* from the start of the header", () => {
  assert.ok(accepts("image", "image/png"));
  assert.ok(accepts("image", "image/webp; charset=binary"));
  assert.ok(!accepts("image", "text/html; boundary=image/png"));
  assert.ok(!accepts("image", "x-image/png"));
});

test("icons are image/* or an icon type, and nothing that merely follows", () => {
  assert.ok(accepts("icon", "image/x-icon"));
  assert.ok(accepts("icon", "image/png"));
  assert.ok(accepts("icon", "application/vnd.microsoft.icon"));
  assert.ok(!accepts("icon", "text/html"));
  assert.ok(!accepts("icon", "text/plain; note=image/"));
});

test("stylesheets, scripts, fonts and manifests accept their usual types", () => {
  assert.ok(accepts("stylesheet", "text/css; charset=utf-8"));
  assert.ok(!accepts("stylesheet", "text/html"));
  assert.ok(accepts("script", "text/javascript; charset=utf-8"));
  assert.ok(accepts("script", "application/javascript"));
  assert.ok(!accepts("script", "text/html"));
  assert.ok(accepts("font", "font/woff2"));
  assert.ok(accepts("font", "application/octet-stream"));
  assert.ok(!accepts("font", "text/html"));
  assert.ok(accepts("manifest", "application/manifest+json"));
  assert.ok(!accepts("manifest", "text/html"));
});
