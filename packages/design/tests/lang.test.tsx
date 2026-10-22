// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { LocaleId } from "../../../site/locales";
import { LanguageControl } from "../components/lang";

const both = () => true;
const only =
  (...ids: LocaleId[]) =>
  (_site: string, locale: LocaleId) =>
    ids.includes(locale);

function render(props: Partial<Parameters<typeof LanguageControl>[0]>) {
  document.body.innerHTML = renderToStaticMarkup(
    <LanguageControl site="docs" locale="en" {...props} />,
  );
  return document.body;
}
const state = (body: HTMLElement) =>
  body.querySelector<HTMLElement>("[data-lang-state]")!.dataset.langState;

describe("LANG: participation first", () => {
  it("A: an English page before Portuguese activation is a status, not a link", () => {
    for (const site of ["root", "docs", "lab"] as const) {
      const body = render({ site }); // real registry: pt-BR is not participating
      expect(state(body)).toBe("status");
      expect(body.textContent).toContain("LANG EN");
      expect(body.querySelector("a, details, button, summary")).toBeNull();
    }
  });

  it("Dump offers only its declared Portuguese counterpart with the real registry", () => {
    const home = render({ site: "dump", counterpart: "/pt" });
    expect(state(home)).toBe("link");
    expect(home.querySelector("a")?.getAttribute("href")).toBe("/pt");
    const missing = render({ site: "dump" });
    expect(state(missing)).toBe("disclosure");
    expect(missing.querySelector("details a")?.getAttribute("href")).toBe(
      "/pt",
    );
  });

  it("B: a directly visited pre-activation Portuguese page is LANG PT, noninteractive", () => {
    const body = render({ locale: "pt-BR", counterpart: "/about/" });
    expect(state(body)).toBe("status");
    expect(body.textContent).toContain("LANG PT");
    expect(body.querySelector("a, details, summary")).toBeNull();
  });

  it("I: participation wins over a supplied counterpart, whichever locale is missing", () => {
    expect(
      render({
        counterpart: "/pt/about/",
        isParticipating: only("en"),
      }).querySelector("a"),
    ).toBeNull();
    expect(
      render({
        counterpart: "/pt/about/",
        isParticipating: only("pt-BR"),
      }).querySelector("a"),
    ).toBeNull();
    expect(
      render({
        locale: "pt-BR",
        counterpart: "/about/",
        isParticipating: only("en"),
      }).querySelector("a"),
    ).toBeNull();
  });

  it("the status has an accessible name and no fake disabled link", () => {
    const body = render({});
    expect(body.querySelector(".rv-sr-only")?.textContent).toBe(
      "Language: English",
    );
    expect(body.querySelector("[aria-disabled]")).toBeNull();
  });
});

describe("LANG: both locales participate", () => {
  it("C: EN page with a Portuguese counterpart links straight to it", () => {
    const body = render({ counterpart: "/pt/about/", isParticipating: both });
    const link = body.querySelector("a")!;
    expect(state(body)).toBe("link");
    expect(link.getAttribute("href")).toBe("/pt/about/");
    expect(link.getAttribute("lang")).toBe("pt-BR");
    expect(link.getAttribute("hreflang")).toBe("pt-BR");
    expect(link.textContent).toBe("Português (Brasil)");
    expect(body.querySelector("details")).toBeNull();
  });

  it("D: PT page with an English counterpart links straight to it", () => {
    const body = render({
      locale: "pt-BR",
      counterpart: "/about/",
      isParticipating: both,
    });
    const link = body.querySelector("a")!;
    expect(link.getAttribute("href")).toBe("/about/");
    expect(link.getAttribute("lang")).toBe("en");
    expect(link.getAttribute("hreflang")).toBe("en");
    expect(link.textContent).toBe("English");
    expect(body.querySelector("nav")!.getAttribute("aria-label")).toBe(
      "Idioma. Atual: Português (Brasil)",
    );
  });

  it("E: an English-only page discloses and offers the Portuguese home, apart from any translation", () => {
    const body = render({ isParticipating: both });
    expect(state(body)).toBe("disclosure");
    const summary = body.querySelector("summary")!;
    expect(summary.querySelector("[lang='pt-BR']")?.textContent).toBe(
      "Português (Brasil)",
    );
    expect(body.querySelector("p")?.textContent).toBe(
      "This page is not available in Portuguese.",
    );
    const home = body.querySelector("details a")!;
    expect(home.getAttribute("href")).toBe("/pt/"); // Docs keeps its trailing slash
    expect(home.getAttribute("hreflang")).toBe("pt-BR");
    expect(home.textContent).toBe("Go to Portuguese home →");
  });

  it("F: a Portuguese-only page is symmetric toward the English home", () => {
    const body = render({
      site: "root",
      locale: "pt-BR",
      isParticipating: both,
    });
    expect(body.querySelector("p")?.textContent).toBe(
      "Esta página não está disponível em inglês.",
    );
    const home = body.querySelector("details a")!;
    expect(home.getAttribute("href")).toBe("/"); // Root, no trailing-slash home change
    expect(home.getAttribute("hreflang")).toBe("en");
    expect(home.textContent).toBe("Ir para a página inicial em inglês →");
    expect(body.querySelector("summary [lang='en']")?.textContent).toBe(
      "English",
    );
  });

  it("E/F use each host's home form", () => {
    expect(
      render({ site: "root", isParticipating: both })
        .querySelector("details a")!
        .getAttribute("href"),
    ).toBe("/pt");
    expect(
      render({ site: "dump", isParticipating: both })
        .querySelector("details a")!
        .getAttribute("href"),
    ).toBe("/pt");
    expect(
      render({ site: "lab", isParticipating: both })
        .querySelector("details a")!
        .getAttribute("href"),
    ).toBe("/pt/");
  });

  it("G/H: search links to the other search page, carrying no query on the server", () => {
    const en = render({ site: "docs", search: true, isParticipating: both });
    expect(en.querySelector("a")!.getAttribute("href")).toBe("/pt/search/");
    expect(en.querySelector("a")!.hasAttribute("data-lang-search")).toBe(true);
    const pt = render({
      site: "root",
      locale: "pt-BR",
      search: true,
      isParticipating: both,
    });
    expect(pt.querySelector("a")!.getAttribute("href")).toBe("/search");
    expect(pt.querySelector("details")).toBeNull();
  });

  it("never guesses a counterpart from the path", () => {
    const body = render({ isParticipating: both });
    expect(body.querySelector("a")?.getAttribute("href")).not.toBe(
      "/pt/about/",
    );
    expect(state(body)).toBe("disclosure");
  });

  it("uses native disclosure and no script or React state", () => {
    const html = renderToStaticMarkup(
      <LanguageControl site="docs" locale="en" isParticipating={both} />,
    );
    expect(html).toContain("<details");
    expect(html).not.toMatch(/<script|onclick|aria-expanded/);
  });
});
