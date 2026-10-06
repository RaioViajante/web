import { readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ActionButton,
  Callout,
  CodeBlock,
  highlightBlock,
  IndexHeader,
  LabBench,
  LegalPage,
  NotFoundPage,
  Pager,
  RelatedRows,
  Section,
  Shell,
  StateMark,
} from "../components";

const css = ["tokens", "base", "blocks"]
  .map((name) =>
    readFileSync(new URL(`../styles/${name}.css`, import.meta.url), "utf8"),
  )
  .join("\n");

function classesIn(html: string) {
  return new Set(
    [...html.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)),
  );
}

const pages = [
  { label: "posts", href: "/" },
  { label: "archive", href: "/archive" },
];

describe("Shell", () => {
  const html = renderToStaticMarkup(
    <Shell
      site="dump"
      pages={pages}
      currentPage="/archive"
      toc={[{ label: "Code", href: "#code", number: "01." }]}
      experiments={[
        { label: "filename classifier", href: "/001", number: "001" },
      ]}
    >
      <p>content</p>
    </Shell>,
  );

  it("numbers PAGES, marks the current page and keeps the order", () => {
    expect(html).toContain(
      '<span class="rv-nav__num">00.</span><span>posts</span>',
    );
    expect(html).toMatch(
      /aria-current="page"[^>]*><span class="rv-nav__num">01\./,
    );
    expect(html.indexOf("PAGES")).toBeLessThan(html.indexOf("ON THIS PAGE"));
    expect(html.indexOf("ON THIS PAGE")).toBeLessThan(
      html.indexOf("EXPERIMENTS"),
    );
  });

  it("puts the sound toggle first, centered over the content column, then content, then the footer", () => {
    expect(html.indexOf("rv-sound")).toBeLessThan(html.indexOf("rv-sidebar"));
    const column = html.slice(html.indexOf('class="rv-column"'));
    expect(column.indexOf("content")).toBeLessThan(column.indexOf("rv-footer"));
    expect(html).not.toMatch(/SITES/);
  });

  it("renders the four sites, email, CNPJ and this site's legal pages", () => {
    expect(html).toContain('href="https://raioviajante.com"');
    expect(html).toContain(
      'href="https://dump.raioviajante.com" data-sound="nav" aria-current="page"',
    );
    expect(html).toContain("mail@raioviajante.com");
    expect(html).toContain("CNPJ: 53.021.377/0001-93");
    expect(html).toContain('href="/terms"');
    expect(html).toContain('href="/privacy"');
  });

  it("places the search slot last inside PAGES", () => {
    const withSearch = renderToStaticMarkup(
      <Shell
        site="lab"
        pages={pages}
        pagesExtra={
          <a className="rv-search" href="/search">
            search
          </a>
        }
      >
        x
      </Shell>,
    );
    const pagesNav = withSearch.slice(
      withSearch.indexOf('aria-label="pages"'),
      withSearch.indexOf("</nav>"),
    );
    expect(pagesNav.lastIndexOf("rv-search")).toBeGreaterThan(
      pagesNav.lastIndexOf("archive"),
    );
  });
});

describe("page parts", () => {
  it("index header uses the shared avatar with explicit dimensions", () => {
    const html = renderToStaticMarkup(
      <IndexHeader name="dump" line="a memory dump" />,
    );
    expect(html).toContain('width="112" height="112"');
    expect(html).toContain("rv-header--index");
  });

  it("related rows point at the other sites", () => {
    const html = renderToStaticMarkup(
      <RelatedRows
        items={[
          {
            title: "Sweep",
            site: "docs",
            href: "https://docs.raioviajante.com/sweep",
          },
        ]}
      />,
    );
    expect(html).toContain("docs ↗");
  });

  it("pager shows caps label above title", () => {
    const html = renderToStaticMarkup(
      <Pager
        prev={{ label: "PREVIOUS", title: "A", href: "/a" }}
        next={{ label: "NEXT", title: "B", href: "/b" }}
      />,
    );
    expect(html.indexOf("PREVIOUS")).toBeLessThan(html.indexOf(">A<"));
  });
});

describe("blocks", () => {
  it("renders a highlighted code block", async () => {
    const model = await highlightBlock({
      code: "def f():\n  pass",
      lang: "python",
      meta: 'title="a.py"',
    });
    const html = renderToStaticMarkup(<CodeBlock model={model} />);
    expect(html).toContain("block__file");
    expect(html).toContain("tok-keyword");
  });

  it("renders callouts with their label", () => {
    const html = renderToStaticMarkup(
      <Callout kind="careful">Use a VM.</Callout>,
    );
    expect(html).toContain("callout--careful");
    expect(html).toContain("Careful");
  });
});

describe("lab", () => {
  it("marks rejected actions as dotted but still clickable", () => {
    const html = renderToStaticMarkup(
      <ActionButton state="rejected">cancel</ActionButton>,
    );
    expect(html).toContain("rv-btn--rejected");
    expect(html).not.toMatch(/\sdisabled[=>\s]/); // aria-disabled only: the click is still logged
  });

  it("fills only the current state", () => {
    const html = renderToStaticMarkup(
      <LabBench caption="runs here">
        <StateMark current>RUNNING</StateMark>
        <StateMark>QUEUED</StateMark>
      </LabBench>,
    );
    expect(html.match(/rv-state--current/g)).toHaveLength(1);
  });
});

describe("templates", () => {
  it("legal page: in short first, then numbered sections", () => {
    const html = renderToStaticMarkup(
      <LegalPage
        site="lab"
        title="Terms of Use"
        lastUpdated="[DATE]"
        inShort={[{ label: "reading", value: "free" }]}
        sections={[{ title: "Who runs this", body: <p>x</p> }]}
      />,
    );
    expect(html).toContain("last updated [DATE]");
    expect(html.indexOf("In short")).toBeLessThan(
      html.indexOf("Who runs this"),
    );
    expect(html).toContain("01.");
  });

  it("404 page: sticker, requested path slot, try instead", () => {
    const html = renderToStaticMarkup(
      <NotFoundPage
        site="docs"
        line="this page moved"
        tryInstead={[{ label: "docs home", value: "start over", href: "/" }]}
      />,
    );
    expect(html).toContain("I looked everywhere.");
    expect(html).toContain("data-requested-path");
    expect(html).toContain("Try instead");
    expect(html).toContain('width="300"');
  });
});

describe("styles", () => {
  it("defines every class the components render", async () => {
    const model = await highlightBlock({ code: "a", lang: "text" });
    const html = [
      renderToStaticMarkup(
        <Shell
          site="lab"
          pages={pages}
          toc={[{ label: "x", href: "#x" }]}
          experiments={[{ label: "y", href: "/y" }]}
        >
          <IndexHeader name="n" line="l" />
          <Section number="01." title="t">
            <Callout>c</Callout>
          </Section>
          <CodeBlock model={model} />
          <LabBench caption="c">
            <StateMark current>a</StateMark>
            <ActionButton state="rejected" primary>
              b
            </ActionButton>
          </LabBench>
          <NotFoundPage site="lab" line="l" tryInstead={[]} />
          <Pager next={{ label: "NEXT", title: "t", href: "/" }} />
        </Shell>,
      ),
    ].join("");
    const missing = [...classesIn(html)].filter(
      (name) => !css.includes(`.${name}`),
    );
    expect(missing).toEqual([]);
  });
});

describe("assets", () => {
  it("has no duplicate image files", () => {
    const seen = new Map<string, string>();
    const walk = (dir: string) => {
      for (const entry of readdirSync(
        new URL(`../assets/${dir}`, import.meta.url),
        { withFileTypes: true },
      )) {
        const path = `${dir}${entry.name}`;
        if (entry.isDirectory()) walk(`${path}/`);
        else {
          const key = readFileSync(
            new URL(`../assets/${path}`, import.meta.url),
          ).toString("base64");
          expect(
            seen.get(key),
            `${path} duplicates ${seen.get(key)}`,
          ).toBeUndefined();
          seen.set(key, path);
        }
      }
    };
    walk("");
  });
});
