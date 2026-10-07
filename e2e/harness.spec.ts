import { expect, test } from "@playwright/test";
import { audit } from "./audit";

// Controls: the audit must actually catch what it claims to. Each defect is
// injected into a real page while it loads, and the audit has to name it.
test("the page audit reports injected defects", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const problems = await audit(page, "docs", "/", 390, async (p) => {
    await p.addInitScript(() => {
      addEventListener("DOMContentLoaded", () => {
        document.body.insertAdjacentHTML(
          "beforeend",
          '<img src="/does-not-exist.png" width="20" height="20">' + // no alt, broken
            "<button></button>", // no accessible name
        );
        // Inline style attributes are blocked by the CSP; CSSOM is allowed.
        const wide = document.createElement("div");
        wide.textContent = "wide";
        wide.style.width = "900px";
        document.body.append(wide);
        console.error("injected console error");
        setTimeout(() => {
          throw new Error("injected page error");
        });
      });
    });
  });
  const all = problems.join("\n");
  for (const expected of [
    /axe image-alt/,
    /axe button-name/,
    /horizontal document overflow/,
    /content outside the viewport/,
    /broken image .*does-not-exist/,
    /console\.error: injected console error/,
    /page error: injected page error/,
  ])
    expect(all).toMatch(expected);
  await context.close();
});
