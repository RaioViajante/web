import assert from "node:assert/strict";
import test from "node:test";
import { isJsonLd, scriptElements, scriptOpenTags } from "./html-scripts.mjs";

test("script tags are found whatever their casing", () => {
  const html =
    '<p>x</p><SCRIPT>alert(1)</SCRIPT><ScRiPt src="/a.js"></ScRiPt ><script nonce="n">1</script>';
  assert.equal(scriptOpenTags(html).length, 3);
  assert.deepEqual(
    scriptElements(html).map((s) => s.body),
    ["alert(1)", "", "1"],
  );
});

test("an end tag may carry whitespace or attributes and still ends the script", () => {
  const html = "<script>a</script\t\n bar><script>b</script >";
  assert.deepEqual(
    scriptElements(html).map((s) => s.body),
    ["a", "b"],
  );
});

test("a script with attributes keeps them, and similar tags are not scripts", () => {
  const html =
    '<script async src="/a.js"></script><scripts></scripts><noscript></noscript>';
  assert.deepEqual(scriptOpenTags(html), [' async src="/a.js"']);
});

test("JSON-LD is recognised in any casing and quoting, and nothing else is", () => {
  assert.ok(isJsonLd(' type="application/ld+json"'));
  assert.ok(isJsonLd(" TYPE='Application/LD+JSON'"));
  assert.ok(!isJsonLd(' type="module"'));
  assert.ok(!isJsonLd(' data-type="application/ld+json-not"'));
  assert.ok(!isJsonLd(' src="/application/ld+json.js"'));
});
