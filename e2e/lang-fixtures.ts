import { createRequire } from "node:module";
import type { Page } from "@playwright/test";
import { LanguageControl } from "../packages/design/components/lang";

// The real shared LanguageControl, rendered to static markup in Node (the same
// way the apps render it on the server) and put into a real, styled app page.
// Nothing here is hand-written markup, and no production route or participation
// setting changes: the participation lookup is injected into the render only.
const design = createRequire(
  new URL("../packages/design/package.json", import.meta.url),
);
const React = design("react");
const { renderToStaticMarkup } = design("react-dom/server");

type Props = Parameters<typeof LanguageControl>[0];

export function renderLanguageControl(props: Partial<Props> = {}) {
  return renderToStaticMarkup(
    React.createElement(LanguageControl, {
      site: "docs",
      locale: "en",
      isParticipating: () => true,
      ...props,
    }),
  ) as string;
}

/** Replaces the page's real LANG status with the given real control markup. */
export async function mountLanguageControl(page: Page, html: string) {
  await page.evaluate((markup) => {
    document.querySelector(".rv-sound .rv-lang")!.outerHTML = markup;
  }, html);
}

/** Tabs from the top of the page until the target has focus (keyboard only). */
export async function tabTo(page: Page, selector: string) {
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    if (
      await page
        .locator(selector)
        .evaluate((el) => el === document.activeElement)
    )
      return;
  }
  throw new Error(`${selector} was not reachable with Tab`);
}
