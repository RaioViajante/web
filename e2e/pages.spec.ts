import { test, expect } from "@playwright/test";
import { audit } from "./audit";
import {
  expectedDocumentLocale,
  inventory,
  missingPath,
  searchPath,
  sites,
  viewports,
} from "./support";

test("missing-page language policy is host-specific", () => {
  expect(expectedDocumentLocale("root", "/pt/e2e-missing-page")).toBe("pt-BR");
  expect(expectedDocumentLocale("dump", "/pt/e2e-missing-page")).toBe("pt-BR");
  expect(expectedDocumentLocale("docs", "/pt/e2e-missing-page")).toBe("en");
  expect(expectedDocumentLocale("lab", "/pt/e2e-missing-page")).toBe("en");
  expect(expectedDocumentLocale("docs", "/pt/guide/")).toBe("pt-BR");
});

// Every sitemap document, every search page and one missing route of each app,
// at both viewports: axe, browser health, horizontal overflow and broken images
// (see audit.ts). The page list is read from each app's own sitemap at run time.
for (const site of sites)
  for (const [name, { width, height }] of Object.entries(viewports))
    test(`${site} pages at ${width}px (${name})`, async ({ browser }) => {
      const { paths, search, searches, missing } = await inventory(site);
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const problems: string[] = [];
      const targets = [
        ...paths,
        search,
        `${search}?q=sweep`,
        missingPath,
        ...searches,
        ...missing,
      ];
      for (const path of new Set(targets))
        problems.push(...(await audit(page, site, path, width)));
      await context.close();
      console.log(
        `[${site}] ${new Set(targets).size} pages at ${width}px, ${problems.length} problems`,
      );
      expect(problems.join("\n"), `${problems.length} problems`).toBe("");
    });
