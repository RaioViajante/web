import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";

// The real shared LanguageControl, rendered to static markup in Node (the same
// way the apps render it on the server) and put into a real, styled app page.
// Nothing here is hand-written markup, and no production route or participation
// setting changes: the participation lookup is injected into the render only.
//
// The component is loaded through Vite's SSR loader, which compiles its JSX
// with the design package's own tsconfig. Importing the .tsx directly would
// make Playwright apply its component-testing JSX transform to it instead.
const design = createRequire(
  new URL("../packages/design/package.json", import.meta.url),
);

type Props = Record<string, unknown>;

/** Renders each named LanguageControl state once, then stops the loader. */
export async function renderLanguageControls<T extends Record<string, Props>>(
  states: T,
): Promise<Record<keyof T, string>> {
  const { createServer } = design("vite");
  const React = design("react");
  const { renderToStaticMarkup } = design("react-dom/server");
  const root = fileURLToPath(new URL("../packages/design/", import.meta.url));
  const server = await createServer({
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    server: { middlewareMode: true, hmr: false, watch: null },
  });
  try {
    const { LanguageControl } = await server.ssrLoadModule(
      "/components/lang.tsx",
    );
    return Object.fromEntries(
      Object.entries(states).map(([name, props]) => [
        name,
        renderToStaticMarkup(
          React.createElement(LanguageControl, {
            site: "docs",
            locale: "en",
            isParticipating: () => true,
            ...props,
          }),
        ) as string,
      ]),
    ) as Record<keyof T, string>;
  } finally {
    await server.close();
  }
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
