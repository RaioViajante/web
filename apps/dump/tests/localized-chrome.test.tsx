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

  it("states the entity and contact unchanged and keeps the English source headings out of the page", () => {
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

describe("legal wording grounded in the implementation", () => {
  const text = (element: React.ReactElement) => {
    const view = render(element);
    const body = view.container.textContent!.replace(/\s+/g, " ");
    view.unmount();
    return body;
  };

  it("claims all rights reserved for posts and illustrations only; documentation is licensed separately", () => {
    expect(text(<Terms />)).toContain(
      "Posts and illustrations belong to RaioViajante unless a page says otherwise.",
    );
    expect(text(<Terms />)).not.toMatch(/documentation/i);
    expect(text(<TermsPt />)).toContain(
      "Textos e ilustrações pertencem a RaioViajante, salvo indicação em contrário em alguma página. Todos os direitos estão reservados e esses conteúdos não são cobertos pela licença MIT do repositório, que se aplica apenas ao código-fonte.",
    );
    expect(text(<TermsPt />)).not.toMatch(/documentação/i);
  });

  it("describes search, the old sound value and the sign-in return like the code does", () => {
    const en = text(<Privacy />);
    const pt = text(<PrivacyPt />);
    // Search runs locally; the cross-site scope reads other indexes only.
    expect(en).toContain(
      "Search runs in your browser. The “everywhere” scope also reads the search indexes of the other RaioViajante sites; what you type is not sent to those sites.",
    );
    expect(pt).toContain(
      "A busca funciona no seu navegador. O escopo “todos os sites” também lê os índices de busca dos outros sites do RaioViajante; o que você digita não é enviado a esses sites.",
    );
    // The legacy local-storage sound value, worded as on Root.
    expect(en).toContain(
      "Older versions of the site kept the same sound choice in your browser's local storage. The site only reads that old value until you next switch sound, which removes it.",
    );
    expect(pt).toContain(
      "Versões anteriores do site guardavam essa mesma escolha de som no armazenamento local do seu navegador. O site apenas lê esse valor antigo até você alternar o som novamente, o que o remove.",
    );
    // Comments load at once when returning from GitHub sign-in (Comments.tsx).
    expect(en).toContain(
      "when you come back to an article after signing in with GitHub",
    );
    expect(pt).toContain(
      "quando você volta ao texto depois de entrar com o GitHub, ou quando você clica em Carregar comentários",
    );
    expect(pt).toContain("No caminho até a página");
  });
});
