import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Footer,
  LeaderRow,
  NotFoundPage,
  Pager,
  Shell,
  type LinkComponent,
} from "../components";

const Link: LinkComponent = ({ href, children, ...props }) => (
  <a href={href} data-app-link="" {...props}>
    {children}
  </a>
);

describe("linkComponent", () => {
  it("renders internal navigation, footer and rows with the app's link", () => {
    const html = renderToStaticMarkup(
      <Shell
        site="root"
        linkComponent={Link}
        pages={[{ label: "about", href: "/about" }]}
      >
        <LeaderRow
          label="setup"
          value="gear"
          href="/setup"
          linkComponent={Link}
        />
      </Shell>,
    );
    const marked = html.match(/data-app-link=""[^>]*href|href="[^"]+"[^>]*/g);
    expect(marked).not.toBeNull();
    for (const href of ["/about", "/terms", "/privacy", "/setup"]) {
      expect(html).toMatch(new RegExp(`<a href="${href}" data-app-link=""`));
    }
  });

  it("keeps other sites and mail on plain anchors", () => {
    const html = renderToStaticMarkup(
      <Footer site="root" linkComponent={Link} />,
    );
    expect(html).toContain(
      '<a href="https://dump.raioviajante.com" data-sound',
    );
    expect(html).toContain('<a href="mailto:mail@raioviajante.com"');
    expect(html).not.toContain(
      'href="https://dump.raioviajante.com" data-app-link',
    );
    expect(html).not.toContain(
      'href="mailto:mail@raioviajante.com" data-app-link',
    );
  });

  it("uses plain anchors when the app passes none", () => {
    const html = renderToStaticMarkup(
      <Pager
        next={{ label: "next", title: "orbit", href: "/orbit" }}
        prev={{ label: "previous", title: "sweep", href: "/sweep" }}
      />,
    );
    expect(html).not.toContain("data-app-link");
    expect(html).toContain('href="/orbit"');
  });

  it("passes it to the 404 rows", () => {
    const html = renderToStaticMarkup(
      <NotFoundPage
        site="root"
        line="x"
        linkComponent={Link}
        tryInstead={[{ label: "root", value: "start over", href: "/" }]}
      />,
    );
    expect(html).toContain('<a href="/" data-app-link=""');
  });
});
