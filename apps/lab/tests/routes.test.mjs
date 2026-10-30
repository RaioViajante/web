import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCALE_IDS, localeOfPath } from "../../../site/locales.ts";
import {
  declaredRoutes,
  routeCounterparts,
  routeKeys,
  routePath,
  routes,
} from "../src/lib/routes.ts";

test("every route is declared in every locale, in its own locale's tree, with Lab's trailing slash", () => {
  assert.deepEqual(routeKeys, ["home", "search", "terms", "privacy"]);
  for (const key of routeKeys)
    for (const locale of LOCALE_IDS) {
      const path = routePath(key, locale);
      assert.equal(localeOfPath(path), locale, `${key} ${locale}`);
      assert.ok(path.endsWith("/"), path);
    }
  assert.equal(routes.terms["pt-BR"], "/pt/terms/");
  assert.equal(routes.privacy["pt-BR"], "/pt/privacy/");
});

test("route counterparts are real, reciprocal and never the page itself", () => {
  const pages = declaredRoutes();
  assert.equal(pages.length, routeKeys.length * LOCALE_IDS.length);
  for (const page of pages) {
    assert.equal(page.counterparts.length, LOCALE_IDS.length - 1);
    for (const counterpart of page.counterparts) {
      assert.notEqual(counterpart.locale, page.locale);
      const back = routeCounterparts(page.key, counterpart.locale);
      assert.deepEqual(back, [{ locale: page.locale, path: page.path }]);
    }
  }
  assert.equal(new Set(pages.map(({ path }) => path)).size, pages.length);
});
