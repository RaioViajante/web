// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Footer, Shell, SoundToggle } from "../components/Shell";
import { Pager } from "../components/page";
import { NotFoundPage } from "../components/templates";
import { SearchPage } from "../components/search";
import { catalogFor } from "../catalog";
import { initSound } from "../sound/init";
import { getSoundPlayer } from "../sound/player";
import { attachSearch } from "../search/client";

/** Any method returns another stub, so the synth can build its graph. */
function stub(): unknown {
  return new Proxy(function () {}, {
    get: (_target, key) =>
      key === "currentTime" ? 0 : key === "state" ? "running" : stub(),
    set: () => true,
    apply: () => stub(),
  });
}
(globalThis as unknown as { AudioContext: unknown }).AudioContext =
  function FakeAudioContext() {
    return stub();
  };
(window as unknown as { matchMedia: unknown }).matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
});

beforeEach(() => {
  getSoundPlayer().setEnabled(false);
  document.cookie = "rv-sound=; Max-Age=0; Path=/";
});
afterEach(() => {
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
  document.cookie = "rv-sound=; Max-Age=0; Path=/";
});

const html = (node: React.ReactElement) => {
  document.body.innerHTML = renderToStaticMarkup(node);
  return document.body;
};

describe("Shell", () => {
  const pt = {
    pages: [{ label: "início", href: "/pt" }],
    toc: [{ label: "um", href: "#um" }],
    experiments: [{ label: "teste", href: "/pt/x" }],
  };
  it("renders shared English chrome, with the real nav unchanged", () => {
    const body = html(
      <Shell
        site="docs"
        locale="en"
        pages={[{ label: "docs", href: "/" }]}
        toc={pt.toc}
        experiments={pt.experiments}
      >
        x
      </Shell>,
    );
    expect(body.querySelector(".rv-skip")?.textContent).toBe("Skip to content");
    expect(
      [...body.querySelectorAll(".rv-nav > .rv-label")].map(
        (n) => n.textContent,
      ),
    ).toEqual(["PAGES", "ON THIS PAGE", "EXPERIMENTS"]);
    expect(body.querySelector("nav[aria-label='on this page']")).not.toBeNull();
    expect(
      body.querySelector("nav[data-nav='pages'] a")?.getAttribute("href"),
    ).toBe("/");
    expect(
      body.querySelector("footer nav[aria-label='Legal']")?.textContent,
    ).toContain("Terms of Use");
    expect(
      body.querySelector("[data-lang-state]")?.getAttribute("data-lang-state"),
    ).toBe("disclosure");
  });

  it("renders shared Portuguese chrome around app-owned items, with no English fallback", () => {
    const body = html(
      <Shell
        site="docs"
        locale="pt-BR"
        pages={pt.pages}
        toc={pt.toc}
        experiments={pt.experiments}
      >
        x
      </Shell>,
    );
    const text = body.textContent ?? "";
    expect(body.querySelector(".rv-skip")?.textContent).toBe(
      "Pular para o conteúdo",
    );
    expect(text).toContain("PÁGINAS");
    expect(text).toContain("NESTA PÁGINA");
    expect(text).toContain("EXPERIMENTOS");
    expect(body.querySelector("nav[aria-label='nesta página']")).not.toBeNull();
    expect(
      body.querySelector("nav[data-nav='pages']")?.getAttribute("aria-label"),
    ).toBe("páginas");
    expect(
      body.querySelector("footer nav[aria-label='Informações legais']")
        ?.textContent,
    ).toContain("Termos de Uso · Política de Privacidade");
    expect(body.querySelector(".rv-sound button")?.textContent).toContain(
      "SOM",
    );
    for (const english of [
      "PAGES",
      "Skip to content",
      "Terms of Use",
      "SOUND",
      "ON THIS PAGE",
    ])
      expect(text).not.toContain(english);
  });

  it("names the language of a legal page that differs from the render, and the English site links", () => {
    const body = html(
      <Shell
        site="docs"
        locale="pt-BR"
        pages={pt.pages}
        termsLocale="en"
        privacyLocale="en"
      >
        x
      </Shell>,
    );
    const legal = [
      ...body.querySelectorAll("footer nav[aria-label='Informações legais'] a"),
    ];
    expect(legal.map((a) => a.getAttribute("hreflang"))).toEqual(["en", "en"]);
    expect(legal[0]!.textContent).toBe("Termos de Uso (em inglês)");
    const sites = [
      ...body.querySelectorAll(
        "footer nav[aria-label='Sites do RaioViajante'] a",
      ),
    ];
    expect(sites.map((a) => a.getAttribute("hreflang"))).toEqual([
      "pt-BR",
      "pt-BR",
      "pt-BR",
      "pt-BR",
    ]);
    expect(sites.map((a) => a.textContent)).toEqual([
      "raioviajante.com",
      "dump",
      "docs",
      "lab",
    ]);
  });

  it("English footer links carry no language qualifier", () => {
    const body = html(
      <Shell site="docs" locale="en" pages={[]}>
        x
      </Shell>,
    );
    expect(body.querySelector("footer")?.innerHTML).not.toContain("hreflang");
  });
});

describe("sound toggle", () => {
  it.each([
    [
      "en",
      "SOUND OFF",
      "Sound off. Click to enable.",
      "SOUND ON",
      "Sound on. Click to mute.",
    ],
    [
      "pt-BR",
      "SOM DESLIGADO",
      "Som desligado. Clique para ativar.",
      "SOM LIGADO",
      "Som ligado. Clique para silenciar.",
    ],
  ] as const)(
    "%s: server copy survives load and toggling",
    (locale, off, offAria, on, onAria) => {
      const body = html(<SoundToggle locale={locale} />);
      const button = body.querySelector<HTMLButtonElement>(
        "[data-sound-toggle]",
      )!;
      expect(button.textContent).toBe(off);
      expect(button.getAttribute("aria-label")).toBe(offAria);
      const stop = initSound();
      expect(button.textContent).toBe(off);
      button.click();
      expect(button.getAttribute("aria-pressed")).toBe("true");
      expect(button.textContent).toBe(on);
      expect(button.getAttribute("aria-label")).toBe(onAria);
      button.click();
      expect(button.textContent).toBe(off);
      expect(button.getAttribute("aria-label")).toBe(offAria);
      stop();
    },
  );

  it("stores no locale: only the existing sound cookie is written", () => {
    const body = html(<SoundToggle locale="pt-BR" />);
    const stop = initSound();
    body.querySelector<HTMLButtonElement>("[data-sound-toggle]")!.click();
    expect(document.cookie).toBe("rv-sound=on");
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    stop();
  });
});

describe("Pager and 404", () => {
  const link = { title: "título", href: "/x" };
  it("uses the locale's shared defaults, and an app-owned label wins", () => {
    for (const locale of ["en", "pt-BR"] as const) {
      const { pager } = catalogFor(locale);
      const body = html(
        <Pager
          locale={locale}
          prev={link}
          next={{ ...link, label: "App label" }}
        />,
      );
      expect(body.querySelector("nav")?.getAttribute("aria-label")).toBe(
        pager.aria,
      );
      const labels = [...body.querySelectorAll(".rv-label")].map(
        (n) => n.textContent,
      );
      expect(labels).toEqual([pager.previous, "App label"]);
    }
  });

  it("renders package-owned 404 copy in the locale and keeps app copy as supplied", () => {
    const props = {
      site: "docs",
      line: "linha do app",
      tryInstead: [{ label: "início", value: "voltar", href: "/pt/" }],
      ask: <span>pergunte</span>,
    } satisfies Omit<Parameters<typeof NotFoundPage>[0], "locale">;
    const pt = html(<NotFoundPage {...props} locale="pt-BR" />);
    const text = pt.textContent ?? "";
    for (const expected of [
      "404 · NÃO ENCONTRADO",
      "Procurei em todo lugar.",
      "solicitado",
      "não encontrado",
      "Tente isto",
      "Ou pergunte",
      "linha do app",
      "início",
      "pergunte",
    ])
      expect(text).toContain(expected);
    expect(pt.querySelector("img")?.getAttribute("alt")).toBe(
      catalogFor("pt-BR").notFound.art,
    );
    for (const english of [
      "I looked everywhere",
      "Try instead",
      "Or just ask",
      "NOT FOUND",
    ])
      expect(text).not.toContain(english);
    const en = html(<NotFoundPage {...props} locale="en" />);
    expect(en.textContent).toContain("I looked everywhere.");
  });
});

describe("search copy", () => {
  async function mount(
    locale: "en" | "pt-BR",
    fetchMock: ReturnType<typeof vi.fn>,
  ) {
    document.body.innerHTML = renderToStaticMarkup(
      <SearchPage site="docs" locale={locale} />,
    );
    vi.stubGlobal("fetch", fetchMock);
    const stop = attachSearch();
    const page = document.querySelector<HTMLElement>("[data-search-page]")!;
    return { page, stop };
  }

  it("renders every shared search string in Portuguese on the server", () => {
    const body = html(<SearchPage site="docs" locale="pt-BR" />);
    const text = body.textContent ?? "";
    for (const expected of [
      "PERGUNTE AO RAIOVIAJANTE",
      "busca",
      "BUSCAR",
      "este site",
      "todos os sites",
      "o que você precisa consultar?",
      "talvez eu ainda não tenha construído isso.",
      "tente",
    ])
      expect(text).toContain(expected);
    expect(body.querySelector("input")?.getAttribute("placeholder")).toBe(
      "digite para buscar",
    );
    expect(body.querySelector("[role=group]")?.getAttribute("aria-label")).toBe(
      "Escopo da busca",
    );
    for (const english of [
      "ASK RAIOVIAJANTE",
      "type to search",
      "this site",
      "maybe I haven",
      "try ",
    ])
      expect(
        text + (body.querySelector("input")?.getAttribute("placeholder") ?? ""),
      ).not.toContain(english);
    expect(body.querySelector(".rv-search-suggestions")?.textContent).toMatch(
      / ou /,
    );
  });

  it("loads the current Portuguese index independently of participation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] });
    const { page, stop } = await mount("pt-BR", fetchMock);
    await vi.waitFor(() => expect(page.dataset.searchState).toBe("ready"));
    expect(document.querySelector("[data-search-bubble]")?.textContent).toBe(
      "o que você precisa consultar?",
    );
    expect(fetchMock).toHaveBeenCalledWith("/pt/search-index.json", {
      mode: "cors",
    });
    stop();
  });

  it("words an unavailable current host in the page locale", async () => {
    const { page, stop } = await mount(
      "pt-BR",
      vi.fn().mockResolvedValue({ ok: false }),
    );
    await vi.waitFor(() =>
      expect(page.dataset.searchState).toBe("unavailable"),
    );
    expect(document.querySelector("[data-search-bubble]")?.textContent).toBe(
      "a busca está indisponível agora.",
    );
    stop();
  });

  it("formats counts, empties and notes in each locale", () => {
    const pt = catalogFor("pt-BR").search;
    const en = catalogFor("en").search;
    expect(en.found(1, "x")).toBe("found 1 thing about “x”!");
    expect(en.found(3, "x")).toBe("found 3 things about “x”!");
    expect(pt.found(1, "x")).toBe("encontrei 1 coisa sobre “x”!");
    expect(pt.found(3, "x")).toBe("encontrei 3 coisas sobre “x”!");
    expect(pt.unreachable("docs")).toBe(
      "não consegui acessar docs: mostrando o resto.",
    );
    expect(pt.notPublished("lab", "português")).toBe(
      "lab: ainda sem resultados em português.",
    );
    expect(en.unreachable("docs, lab")).toBe(
      "couldn't reach docs, lab: showing the rest.",
    );
  });
});

describe("LANG search query carrying", () => {
  const withBoth = () => import("../components/lang");
  it("adds q, and only q, to the server-rendered search link from the input", async () => {
    const { LanguageControl } = await withBoth();
    document.body.innerHTML =
      renderToStaticMarkup(
        <LanguageControl
          site="docs"
          locale="en"
          search
          isParticipating={() => true}
        />,
      ) + renderToStaticMarkup(<SearchPage site="docs" locale="en" />);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => [] }),
    );
    window.history.replaceState({}, "", "/search/?scope=everywhere&utm=x#frag");
    const stop = attachSearch();
    const link = document.querySelector<HTMLAnchorElement>(
      "a[data-lang-search]",
    )!;
    expect(link.getAttribute("href")).toBe("/pt/search/");
    const input = document.querySelector<HTMLInputElement>(
      "[data-search-input]",
    )!;
    input.value = "configuração nova";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(link.getAttribute("href")).toBe(
      "/pt/search/?q=configura%C3%A7%C3%A3o+nova",
    );
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(link.getAttribute("href")).toBe("/pt/search/");
    stop();
  });
});

describe("footer cross-site destinations", () => {
  const sitesOf = (
    site: "root" | "dump" | "docs" | "lab",
    locale: "en" | "pt-BR",
    participating: (site: string, locale: string) => boolean,
  ) => {
    const body = html(
      <Footer
        site={site}
        locale={locale}
        isParticipating={participating as never}
      />,
    );
    return [...body.querySelectorAll("footer nav:first-of-type a")].map((a) => [
      a.getAttribute("href"),
      a.getAttribute("hreflang"),
      a.textContent,
    ]);
  };
  const partial = (site: string, locale: string) =>
    locale === "en" || site === "root" || site === "docs";

  it("A: an English render keeps today's destinations, unqualified", () => {
    expect(sitesOf("docs", "en", () => true)).toEqual([
      ["https://raioviajante.com", null, "raioviajante.com"],
      ["https://dump.raioviajante.com", null, "dump"],
      ["https://docs.raioviajante.com", null, "docs"],
      ["https://lab.raioviajante.com", null, "lab"],
    ]);
  });

  it("B: a Portuguese render whose own app does not participate links English, labelled", () => {
    const none = (_site: string, locale: string) => locale === "en";
    expect(sitesOf("root", "pt-BR", none)).toEqual([
      ["https://raioviajante.com", "en", "raioviajante.com (em inglês)"],
      ["https://dump.raioviajante.com", "en", "dump (em inglês)"],
      ["https://docs.raioviajante.com", "en", "docs (em inglês)"],
      ["https://lab.raioviajante.com", "en", "lab (em inglês)"],
    ]);
    // A target participating is not enough while the current app is not.
    const onlyTargets = (site: string, locale: string) =>
      locale === "en" || site !== "root";
    expect(
      sitesOf("root", "pt-BR", onlyTargets).every(([, lang]) => lang === "en"),
    ).toBe(true);
  });

  it("C/G/F: with both participating, the localized home in the host's slash form", () => {
    expect(sitesOf("root", "pt-BR", () => true)).toEqual([
      ["https://raioviajante.com/pt", "pt-BR", "raioviajante.com"],
      ["https://dump.raioviajante.com/pt", "pt-BR", "dump"],
      ["https://docs.raioviajante.com/pt/", "pt-BR", "docs"],
      ["https://lab.raioviajante.com/pt/", "pt-BR", "lab"],
    ]);
  });

  it("D/E: each target is decided on its own (Root PT page; Root and Docs participate)", () => {
    expect(sitesOf("root", "pt-BR", partial)).toEqual([
      ["https://raioviajante.com/pt", "pt-BR", "raioviajante.com"],
      ["https://dump.raioviajante.com", "en", "dump (em inglês)"],
      ["https://docs.raioviajante.com/pt/", "pt-BR", "docs"],
      ["https://lab.raioviajante.com", "en", "lab (em inglês)"],
    ]);
  });

  it("uses the registry: every Portuguese footer links all four localized homes", () => {
    for (const site of ["root", "dump", "docs", "lab"] as const) {
      const active = html(<Footer site={site} locale="pt-BR" />);
      const links = [...active.querySelectorAll("footer nav:first-of-type a")];
      expect(links.map((link) => link.getAttribute("href"))).toEqual([
        "https://raioviajante.com/pt",
        "https://dump.raioviajante.com/pt",
        "https://docs.raioviajante.com/pt/",
        "https://lab.raioviajante.com/pt/",
      ]);
      expect(links.map((link) => link.getAttribute("hreflang"))).toEqual([
        "pt-BR",
        "pt-BR",
        "pt-BR",
        "pt-BR",
      ]);
    }
  });
});
