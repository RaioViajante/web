import assert from "node:assert/strict";
import test from "node:test";
import { SITES } from "../packages/design/components/sites.ts";
import { identity } from "../seo/structured-data.ts";
import { siteOrigins } from "./headers.ts";

// The four production origins are written down in more than one place
// (security/headers.ts for the CSP and policies, packages/design for the footer,
// related rows and search, seo/ for the person identity). Moving them into one
// place is repository polish; until then this keeps them from drifting. Only
// the site identity and origin are compared, not contact or company data.
test("design SITES and security siteOrigins describe the same four origins", () => {
  assert.deepEqual(
    Object.fromEntries(SITES.map((site) => [site.id, site.href])),
    siteOrigins,
  );
});

test("the person identity lives on the root origin", () => {
  assert.equal(new URL(identity.url).origin, siteOrigins.root);
  assert.equal(new URL(identity.id).origin, siteOrigins.root);
});
