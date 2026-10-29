import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";

import PrivacyPt from "@/app/pt/privacy/page";
import TermsPt from "@/app/pt/terms/page";
import Privacy from "@/app/privacy/page";
import Terms from "@/app/terms/page";
import { DumpShell } from "@/components/DumpShell";

const legal = (name: string) => screen.getByRole("navigation", { name });

describe("<DumpShell /> footer", () => {
  it("links Portuguese legal pages without an English qualifier", () => {
    render(
      <DumpShell locale="pt-BR" current="/pt">
        <p>conteúdo</p>
      </DumpShell>,
    );
    const nav = legal("Informações legais");
    const terms = nav.querySelector("a[href='/pt/terms']")!;
    const privacy = nav.querySelector("a[href='/pt/privacy']")!;
    expect(terms).toHaveTextContent(/^Termos de Uso$/);
    expect(privacy).toHaveTextContent(/^Política de Privacidade$/);
    expect(terms.getAttribute("hreflang")).toBeNull();
    expect(nav.textContent).not.toMatch(/em inglês/);
  });

  it("keeps the English footer links exactly as they were", () => {
    render(
      <DumpShell current="/">
        <p>content</p>
      </DumpShell>,
    );
    const nav = legal("Legal");
    expect(nav.querySelector("a[href='/terms']")).toHaveTextContent(
      /^Terms of Use$/,
    );
    expect(nav.querySelector("a[href='/privacy']")).toHaveTextContent(
      /^Privacy Policy$/,
    );
  });

  it("gives each legal page a language counterpart", () => {
    const en = render(<Terms />);
    expect(en.container.querySelector(".rv-lang a")?.getAttribute("href")).toBe(
      "/pt/terms",
    );
    en.unmount();
    const pt = render(<TermsPt />);
    expect(pt.container.querySelector(".rv-lang a")?.getAttribute("href")).toBe(
      "/terms",
    );
    pt.unmount();
    const privacy = render(<Privacy />);
    expect(
      privacy.container.querySelector(".rv-lang a")?.getAttribute("href"),
    ).toBe("/pt/privacy");
    privacy.unmount();
    const privacyPt = render(<PrivacyPt />);
    expect(
      privacyPt.container.querySelector(".rv-lang a")?.getAttribute("href"),
    ).toBe("/privacy");
  });
});

describe("Portuguese legal pages", () => {
  const sectionTitles = (container: HTMLElement) =>
    [...container.querySelectorAll("h2")].map((h) =>
      h.textContent!.replace(/^\d+\.(\d+)?/, ""),
    );

  it("mirror the English sections one to one, with the same facts", () => {
    for (const [English, Portuguese] of [
      [Terms, TermsPt],
      [Privacy, PrivacyPt],
    ] as const) {
      const en = render(<English />);
      const english = sectionTitles(en.container);
      const emails = en.container.querySelectorAll("a[href^='mailto:']").length;
      en.unmount();
      const pt = render(<Portuguese />);
      expect(sectionTitles(pt.container)).toHaveLength(english.length);
      expect(pt.container.querySelectorAll("a[href^='mailto:']")).toHaveLength(
        emails,
      );
      expect(pt.container.querySelectorAll("h1")).toHaveLength(1);
      pt.unmount();
    }
  });

  it("states the entity and contact unchanged and keeps English authoritative text out of the page", () => {
    render(<TermsPt />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Termos de Uso" }),
    ).toBeInTheDocument();
    expect(document.body.textContent).toContain("CNPJ 53.021.377/0001-93");
    expect(document.body.textContent).toContain("mail@raioviajante.com");
    expect(document.body.textContent).not.toMatch(/Who runs this/);
  });

  it("uses the Portuguese chrome of the shared template", () => {
    render(<PrivacyPt />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Política de Privacidade",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Em resumo")).toBeInTheDocument();
  });
});

describe("locale branching", () => {
  it("keeps boolean locale flags and inline English fallbacks out of components", () => {
    const dir = join(process.cwd(), "components");
    for (const file of readdirSync(dir)) {
      const source = readFileSync(join(dir, file), "utf8");
      expect({ file, flag: /\bportuguese\b/.test(source) }).toEqual({
        file,
        flag: false,
      });
      expect({
        file,
        ternary: /locale (?:===|!==) DEFAULT_LOCALE\s*\?/.test(source),
      }).toEqual({ file, ternary: false });
    }
  });
});
