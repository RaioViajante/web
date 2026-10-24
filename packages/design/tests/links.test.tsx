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
        locale="en"
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
      <Footer locale="en" site="root" linkComponent={Link} />,
    );
    expect(html).toContain(
      '<a data-testid="footer-site-link" href="https://dump.raioviajante.com" data-sound',
    );
    expect(html).toContain(
      '<a data-testid="footer-email-link" href="mailto:mail@raioviajante.com"',
    );
    expect(html).not.toContain(
      'href="https://dump.raioviajante.com" data-app-link',
    );
    expect(html).not.toContain(
      'href="mailto:mail@raioviajante.com" data-app-link',
    );
  });

  it("uses full-document links for same-host legal destinations in another language", () => {
    const html = renderToStaticMarkup(
      <Footer
        locale="pt-BR"
        site="root"
        termsLocale="en"
        privacyLocale="en"
        linkComponent={Link}
      />,
    );
    for (const href of ["/terms", "/privacy"]) {
      expect(html).toContain(
        `<a data-testid="footer-legal-link" href="${href}" data-sound`,
      );
      expect(html).not.toContain(`href="${href}" data-app-link`);
    }
  });

  it("uses plain anchors when the app passes none", () => {
    const html = renderToStaticMarkup(
      <Pager
        locale="en"
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
        locale="en"
        site="root"
        line="x"
        linkComponent={Link}
        tryInstead={[{ label: "root", value: "start over", href: "/" }]}
      />,
    );
    expect(html).toContain('<a href="/" data-app-link=""');
  });

  it("passes hreflang through 404 recovery rows", () => {
    const html = renderToStaticMarkup(
      <NotFoundPage
        locale="pt-BR"
        site="root"
        line="x"
        tryInstead={[
          { label: "docs", value: "em inglês", href: "/docs", hrefLang: "en" },
        ]}
      />,
    );
    expect(html).toContain('href="/docs"');
    expect(html).toContain('hrefLang="en"');
  });
});
