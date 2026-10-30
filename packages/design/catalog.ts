import { isLocaleId, type LocaleId } from "../../site/locales";
import type { SiteId } from "../../site/sites";

// The shared UI strings of the four sites, one complete catalog per registry
// locale (docs/i18n.md, "Shared UI catalogs"). `Record<LocaleId, SharedCatalog>`
// makes a missing locale or key a type error, and there is no fallback: a
// locale without its catalog throws instead of rendering English. Keys are
// English identifiers; values are public copy. Only presentation strings that
// `packages/design` itself renders live here. Page prose, taglines, project and
// experiment text, legal bodies and app-specific voice stay in the apps.

/** The callout kinds of the soft blocks; `blocks/build.ts` derives its type from this list. */
export type CalloutKindId =
  "note" | "important" | "warning" | "deprecated" | "til" | "careful";

export interface SharedCatalog {
  shell: {
    skip: string;
    pages: string;
    pagesAria: string;
    onThisPage: string;
    onThisPageAria: string;
    experiments: string;
    experimentsAria: string;
  };
  footer: {
    sitesAria: string;
    legalAria: string;
    terms: string;
    privacy: string;
    /** Qualifier for a link whose destination is in another language. */
    inLanguage: (language: string) => string;
  };
  sound: {
    label: string;
    on: string;
    off: string;
    /** Accessible name and action for the toggle. */
    aria: (enabled: boolean) => string;
  };
  clock: {
    /** Accessible description before the quiet, non-live time value. */
    aria: (location: string) => string;
  };
  lang: {
    /** Accessible name of the control while it is only a status. */
    statusAria: (current: string) => string;
    /** Accessible name of the navigation holding the choice. */
    navAria: (current: string) => string;
    /** Accessible name when the compact control links to a counterpart. */
    switchAria: (current: string, target: string) => string;
    /** Accessible name when the compact control opens availability details. */
    availabilityAria: (current: string, target: string) => string;
    /** Language names as written in this catalog's language, by locale. */
    names: Record<LocaleId, string>;
    unavailable: (target: string) => string;
    home: (target: string) => string;
  };
  search: {
    navLabel: string;
    eyebrow: string;
    heading: string;
    inputLabel: string;
    placeholder: string;
    scopeAria: string;
    thisSite: string;
    everywhere: string;
    prompts: Record<SiteId, string>;
    characterAlt: string;
    emptyArtAlt: string;
    empty: string;
    tryPrefix: string;
    or: string;
    found: (count: number, query: string) => string;
    nothing: string;
    /** The current host's index could not be read. */
    unavailable: string;
    /** The current host does not publish this locale yet (not an error). */
    skipped: (language: string) => string;
    /** Other hosts that could not be reached; the rest still search. */
    unreachable: (sites: string) => string;
    /** Other hosts that do not publish the locale yet. */
    notPublished: (sites: string, language: string) => string;
  };
  /** Chrome of the shared legal template; the legal text itself stays in the apps. */
  legal: {
    label: string;
    line: (host: string) => string;
    updated: (date: string) => string;
    applies: string;
    inShort: string;
  };
  pager: {
    aria: string;
    previous: string;
    next: string;
  };
  /**
   * Controls and labels of the soft blocks (docs/blocks.md): rendered into the
   * markup at build time for the page's locale, and repainted by the block
   * behavior from the catalog selected by `<html lang>` when a page was built
   * without a locale.
   */
  blocks: {
    copy: string;
    copyCommands: string;
    /** Feedback shown on the copy button for a moment after copying. */
    copied: string;
    /** Accessible name of the file tab list of a tabbed block. */
    files: string;
    /** Tab label for a panel without a file name. */
    fileNumber: (index: number) => string;
    /** Label of the control that expands a collapsed block. */
    showAll: (lines: number) => string;
    showLess: string;
    /** The highlighted lines of the meta row, a single line or a range. */
    line: (line: number) => string;
    lines: (from: number, to: number) => string;
    callouts: Record<CalloutKindId, string>;
    /** Accessible name of the footnote list. */
    footnotes: string;
    /** Accessible name of a footnote's link back to its reference (`1`, `1-2`). */
    footnoteBack: (reference: string) => string;
    /** Accessible names of keyboard-scrollable regions (wide code and tables). */
    scrollCode: string;
    scrollTable: string;
  };
  notFound: {
    label: string;
    title: string;
    art: string;
    requested: string;
    requestedState: string;
    tryInstead: string;
    ask: string;
  };
}

export const catalogs = {
  en: {
    shell: {
      skip: "Skip to content",
      pages: "PAGES",
      pagesAria: "pages",
      onThisPage: "ON THIS PAGE",
      onThisPageAria: "on this page",
      experiments: "EXPERIMENTS",
      experimentsAria: "experiments",
    },
    footer: {
      sitesAria: "RaioViajante sites",
      legalAria: "Legal",
      terms: "Terms of Use",
      privacy: "Privacy Policy",
      inLanguage: (language) => `in ${language}`,
    },
    sound: {
      label: "SOUND",
      on: "ON",
      off: "OFF",
      aria: (enabled) =>
        `Sound ${enabled ? "on" : "off"}. Click to ${enabled ? "mute" : "enable"}.`,
    },
    clock: {
      aria: (location) => `Owner's local time in ${location}`,
    },
    lang: {
      statusAria: (current) => `Language: ${current}`,
      navAria: (current) => `Language. Current: ${current}`,
      switchAria: (current, target) =>
        `Language: ${current}. Switch to ${target}.`,
      availabilityAria: (current, target) =>
        `Language: ${current}. Check ${target} availability.`,
      names: { en: "English", "pt-BR": "Portuguese" },
      unavailable: (target) => `This page is not available in ${target}.`,
      home: (target) => `Go to ${target} home →`,
    },
    search: {
      navLabel: "search",
      eyebrow: "ASK RAIOVIAJANTE",
      heading: "search",
      inputLabel: "SEARCH",
      placeholder: "type to search",
      scopeAria: "Search scope",
      thisSite: "this site",
      everywhere: "everywhere",
      prompts: {
        root: "what are you looking for?",
        dump: "what are you curious about?",
        docs: "what do you need to look up?",
        lab: "what do you want to poke at?",
      },
      characterAlt: "RaioViajante wondering, with a hand on his chin",
      emptyArtAlt: "RaioViajante and a cat looking through a pile of notes",
      empty: "maybe I haven't built it yet.",
      tryPrefix: "try",
      or: "or",
      found: (count, query) =>
        `found ${count} ${count === 1 ? "thing" : "things"} about “${query}”!`,
      nothing: "hmm… nothing yet.",
      unavailable: "search is unavailable right now.",
      skipped: (language) => `there are no ${language} results yet.`,
      unreachable: (sites) => `couldn't reach ${sites}: showing the rest.`,
      notPublished: (sites, language) =>
        `${sites}: no ${language} results yet.`,
    },
    legal: {
      label: "LEGAL",
      line: (host) => `${host} · the short version first`,
      updated: (date) => `last updated ${date}`,
      applies: "applies to this site",
      inShort: "In short",
    },
    pager: {
      aria: "Previous and next",
      previous: "← Previous",
      next: "Next →",
    },
    blocks: {
      copy: "copy",
      copyCommands: "copy commands",
      copied: "copied",
      files: "Files",
      fileNumber: (index) => `file ${index}`,
      showAll: (lines) => `show all ${lines} lines`,
      showLess: "show less",
      line: (line) => `line ${line}`,
      lines: (from, to) => `lines ${from}–${to}`,
      callouts: {
        note: "Note",
        important: "Important",
        warning: "Warning",
        deprecated: "Deprecated",
        til: "TIL",
        careful: "Careful",
      },
      footnotes: "Footnotes",
      footnoteBack: (reference) => `Back to reference ${reference}`,
      scrollCode: "Code, scrolls sideways",
      scrollTable: "Table, scrolls sideways",
    },
    notFound: {
      label: "404 · NOT FOUND",
      title: "I looked everywhere.",
      art: "RaioViajante shrugging, surrounded by question marks, under a sign that reads 404 page not found",
      requested: "requested",
      requestedState: "not found",
      tryInstead: "Try instead",
      ask: "Or just ask",
    },
  },
  "pt-BR": {
    shell: {
      skip: "Pular para o conteúdo",
      pages: "PÁGINAS",
      pagesAria: "páginas",
      onThisPage: "NESTA PÁGINA",
      onThisPageAria: "nesta página",
      experiments: "EXPERIMENTOS",
      experimentsAria: "experimentos",
    },
    footer: {
      sitesAria: "Sites do RaioViajante",
      legalAria: "Informações legais",
      terms: "Termos de Uso",
      privacy: "Política de Privacidade",
      inLanguage: (language) => `em ${language}`,
    },
    sound: {
      label: "SOM",
      on: "LIGADO",
      off: "DESLIGADO",
      aria: (enabled) =>
        `Som ${enabled ? "ligado" : "desligado"}. Clique para ${enabled ? "silenciar" : "ativar"}.`,
    },
    clock: {
      aria: (location) => `Hora local do proprietário em ${location}`,
    },
    lang: {
      statusAria: (current) => `Idioma: ${current}`,
      navAria: (current) => `Idioma. Atual: ${current}`,
      switchAria: (current, target) =>
        `Idioma: ${current}. Mudar para ${target}.`,
      availabilityAria: (current, target) =>
        `Idioma: ${current}. Verificar disponibilidade em ${target}.`,
      names: { en: "inglês", "pt-BR": "português" },
      unavailable: (target) => `Esta página não está disponível em ${target}.`,
      home: (target) => `Ir para a página inicial em ${target} →`,
    },
    search: {
      navLabel: "busca",
      eyebrow: "PERGUNTE AO RAIOVIAJANTE",
      heading: "busca",
      inputLabel: "BUSCAR",
      placeholder: "digite para buscar",
      scopeAria: "Escopo da busca",
      thisSite: "este site",
      everywhere: "todos os sites",
      prompts: {
        root: "o que você está procurando?",
        dump: "sobre o que você está curioso?",
        docs: "o que você precisa consultar?",
        lab: "no que você quer mexer?",
      },
      characterAlt: "RaioViajante pensativo, com a mão no queixo",
      emptyArtAlt:
        "RaioViajante e um gato procurando em uma pilha de anotações",
      empty: "talvez eu ainda não tenha construído isso.",
      tryPrefix: "tente",
      or: "ou",
      found: (count, query) =>
        `${count === 1 ? "encontrei 1 coisa" : `encontrei ${count} coisas`} sobre “${query}”!`,
      nothing: "hmm… nada por enquanto.",
      unavailable: "a busca está indisponível agora.",
      skipped: (language) => `ainda não há resultados em ${language}.`,
      unreachable: (sites) =>
        `não consegui acessar ${sites}: mostrando o resto.`,
      notPublished: (sites, language) =>
        `${sites}: ainda sem resultados em ${language}.`,
    },
    legal: {
      label: "JURÍDICO",
      line: (host) => `${host} · a versão curta primeiro`,
      updated: (date) => `última atualização ${date}`,
      applies: "vale para este site",
      inShort: "Em resumo",
    },
    pager: {
      aria: "Anterior e próximo",
      previous: "← Anterior",
      next: "Próximo →",
    },
    blocks: {
      copy: "copiar",
      copyCommands: "copiar comandos",
      copied: "copiado",
      files: "Arquivos",
      fileNumber: (index) => `arquivo ${index}`,
      showAll: (lines) =>
        lines === 1 ? "mostrar a linha" : `mostrar as ${lines} linhas`,
      showLess: "mostrar menos",
      line: (line) => `linha ${line}`,
      lines: (from, to) => `linhas ${from}–${to}`,
      callouts: {
        note: "Nota",
        important: "Importante",
        warning: "Aviso",
        deprecated: "Obsoleto",
        til: "Aprendi hoje",
        careful: "Cuidado",
      },
      footnotes: "Notas de rodapé",
      footnoteBack: (reference) => `Voltar para a referência ${reference}`,
      scrollCode: "Código, rola para o lado",
      scrollTable: "Tabela, rola para o lado",
    },
    notFound: {
      label: "404 · NÃO ENCONTRADO",
      title: "Procurei em todo lugar.",
      art: "RaioViajante dando de ombros, cercado de pontos de interrogação, sob uma placa que diz 404 página não encontrada",
      requested: "solicitado",
      requestedState: "não encontrado",
      tryInstead: "Tente isto",
      ask: "Ou pergunte",
    },
  },
} as const satisfies Record<LocaleId, SharedCatalog>;

/** The catalog of a locale. A locale without one is a bug: it throws, it never falls back. */
export function catalogFor(locale: LocaleId): SharedCatalog {
  if (!isLocaleId(locale))
    throw new RangeError(`Unsupported locale ${JSON.stringify(locale)}`);
  const catalog: SharedCatalog | undefined = catalogs[locale];
  if (!catalog) throw new RangeError(`No shared catalog for ${locale}`);
  return catalog;
}
