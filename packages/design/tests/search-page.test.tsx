import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SearchPage } from "../components/search";

const lines = (html: string) =>
  Object.fromEntries(
    [
      ...html.matchAll(
        /data-search-suggestions="(\w+)"( hidden="")?>(.*?)<\/p>/g,
      ),
    ].map(([, scope, hidden, body]) => [
      scope,
      {
        hidden: Boolean(hidden),
        text: body!.replace(/<[^>]+>/g, ""),
      },
    ]),
  );

describe("empty search suggestions", () => {
  it("offers this site's own terms first and the other sites' for everywhere", () => {
    const html = renderToStaticMarkup(<SearchPage site="docs" />);
    expect(lines(html)).toEqual({
      site: { hidden: false, text: "try sweep, cli, tokens or commits." },
      everywhere: {
        hidden: true,
        text: "try setup, assembly or classifier.",
      },
    });
  });

  it("never suggests a site's own signature term under everywhere", () => {
    const signature = {
      root: "setup",
      dump: "assembly",
      docs: "cli",
      lab: "classifier",
    } as const;
    for (const site of ["root", "dump", "docs", "lab"] as const) {
      const html = renderToStaticMarkup(<SearchPage site={site} />);
      const terms = lines(html)
        .everywhere!.text.slice(4, -1)
        .split(/, | or /);
      expect(terms).toHaveLength(3);
      expect(terms).not.toContain(signature[site]);
    }
  });
});
