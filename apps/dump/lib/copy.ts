import { localeById, type LocaleId } from "../../../site/locales";
import { commentsUiCopy, type CommentsUiCopy } from "./comments-copy";
import type { RouteKey } from "./routes";

// Dump's editorial and interface copy, one complete object per locale. Shared
// chrome (navigation labels, footer, search prompts, pager) comes from
// packages/design's catalog; everything below is Dump's own text. A missing key
// in any locale fails type checking, and there is no fallback that could show
// English inside a Portuguese page.

export interface PageSeoCopy {
  title: string;
  description: string;
}

export interface NotFoundLink {
  label: string;
  value: string;
  href: string;
  hrefLang?: LocaleId;
}

export interface DumpCopy {
  pageSeo: Record<RouteKey, PageSeoCopy>;
  tagPageSeo: {
    title: (label: string) => string;
    description: (label: string) => string;
  };
  /** Title of the RSS autodiscovery link, so readers can tell the feeds apart. */
  feedLinkTitle: string;
  shell: { posts: string; archive: string; tags: string };
  home: {
    line: string;
    empty: string;
    latest: string;
    series: string;
    follow: string;
    feed: string;
    code: string;
    parts: (count: number) => string;
    /** Accessible names of the flipping avatar (the shared defaults are English). */
    avatar: { label: string; reduced: string };
  };
  archive: {
    label: string;
    title: string;
    emptyLine: string;
    empty: string;
    since: (count: number, firstDate: string) => string;
  };
  tags: {
    label: string;
    title: string;
    line: string;
    recurring: string;
    once: string;
    empty: string;
    pageLabel: string;
    posts: (count: number) => string;
  };
  post: {
    label: string;
    published: string;
    updated: string;
    tags: string;
    series: string;
    source: string;
    edit: string;
    keepReading: string;
    related: string;
    labTry: string;
    minutesRead: (minutes: number) => string;
    comments: string;
    commentsPowered: string;
    commentsUi: CommentsUiCopy;
  };
  notFound: {
    metadata: PageSeoCopy;
    line: string;
    tryInstead: readonly NotFoundLink[];
  };
}

/**
 * "one" or "other" for a count in a locale. Zero always takes the plural
 * form: CLDR files 0 under Portuguese "one", but "0 textos" is what a reader
 * expects.
 */
export function pluralCategory(
  locale: LocaleId,
  count: number,
): "one" | "other" {
  if (count === 0) return "other";
  return new Intl.PluralRules(localeById(locale).intlLocale).select(count) ===
    "one"
    ? "one"
    : "other";
}

const copy = {
  en: {
    pageSeo: {
      home: {
        title: "dump — a memory dump, hopefully readable.",
        description:
          "Computer science notes, projects, devlogs, and technology writing by RaioViajante.",
      },
      archive: {
        title: "Archive",
        description:
          "Every post on dump, newest first, grouped by year and month.",
      },
      tags: {
        title: "Tags",
        description: "Browse dump posts by recurring topics and technologies.",
      },
      terms: {
        title: "Terms of Use",
        description: "The short version of how to use dump.raioviajante.com.",
      },
      privacy: {
        title: "Privacy Policy",
        description: "What dump.raioviajante.com stores and who sees it.",
      },
      search: {
        title: "Search",
        description:
          "Search posts on dump and pages across the RaioViajante ecosystem.",
      },
    },
    tagPageSeo: {
      title: (label) => `Posts tagged "${label}"`,
      description: (label) =>
        `Technical writing and project notes tagged "${label}" on dump.`,
    },
    feedLinkTitle: "dump RSS",
    shell: { posts: "posts", archive: "archive", tags: "tags" },
    home: {
      line: "a memory dump, hopefully readable.",
      empty: "No posts yet.",
      latest: "Latest",
      series: "Series",
      follow: "Follow along",
      feed: "feed",
      code: "code ↗",
      parts: (count) =>
        `${count} ${pluralCategory("en", count) === "one" ? "part" : "parts"}`,
      avatar: {
        label: "Flip RaioViajante avatar",
        reduced: "Illustrated RaioViajante character",
      },
    },
    archive: {
      label: "Archive",
      title: "Everything",
      emptyLine: "Every post, newest first.",
      empty: "No posts yet.",
      since: (count, firstDate) =>
        `${count} ${pluralCategory("en", count) === "one" ? "post" : "posts"} since ${firstDate}.`,
    },
    tags: {
      label: "Tags",
      title: "Topics",
      line: "What keeps showing up, sorted by how often.",
      recurring: "Recurring",
      once: "Once so far",
      empty: "No tags yet.",
      pageLabel: "Tag",
      posts: (count) =>
        `${count} ${pluralCategory("en", count) === "one" ? "post" : "posts"}`,
    },
    post: {
      label: "Post",
      published: "published",
      updated: "updated",
      tags: "tags",
      series: "series",
      source: "source",
      edit: "edit on GitHub ↗",
      keepReading: "Keep reading",
      related: "Related by tag",
      labTry: "Try it",
      minutesRead: (minutes) => `${minutes} min read`,
      comments: "Comments",
      commentsPowered: "Powered by GitHub Discussions.",
      commentsUi: commentsUiCopy.en,
    },
    notFound: {
      metadata: {
        title: "404 — not found",
        description: "This page could not be found on dump.raioviajante.com.",
      },
      line: "this page moved, never existed, or I haven't written it yet.",
      tryInstead: [
        { label: "dump", value: "start over", href: "/" },
        { label: "archive", value: "everything", href: "/archive" },
        { label: "tags", value: "topics", href: "/tags" },
        {
          label: "raioviajante.com",
          value: "home",
          href: "https://raioviajante.com",
        },
      ],
    },
  },
  "pt-BR": {
    pageSeo: {
      home: {
        title: "dump — um despejo de memória, tomara que legível.",
        description:
          "Notas sobre computação, projetos, desenvolvimento e tecnologia por RaioViajante.",
      },
      archive: {
        title: "Arquivo",
        description:
          "Todos os textos do dump, do mais recente ao mais antigo, agrupados por ano e mês.",
      },
      tags: {
        title: "Tags",
        description: "Explore os textos do dump por assunto e tecnologia.",
      },
      terms: {
        title: "Termos de Uso",
        description: "A versão curta de como usar dump.raioviajante.com.",
      },
      privacy: {
        title: "Política de Privacidade",
        description: "O que dump.raioviajante.com guarda e quem vê.",
      },
      search: {
        title: "Busca",
        description:
          "Busque textos no dump e páginas em português no ecossistema RaioViajante.",
      },
    },
    tagPageSeo: {
      title: (label) => `Textos com a tag "${label}"`,
      description: (label) =>
        `Textos técnicos e notas de projeto com a tag "${label}" no dump.`,
    },
    feedLinkTitle: "dump RSS (português)",
    shell: { posts: "textos", archive: "arquivo", tags: "tags" },
    home: {
      line: "um despejo de memória, tomara que legível.",
      empty: "Ainda não há textos publicados em português.",
      latest: "Mais recente",
      series: "Séries",
      follow: "Acompanhe",
      feed: "feed",
      code: "código ↗",
      parts: (count) =>
        `${count} ${pluralCategory("pt-BR", count) === "one" ? "parte" : "partes"}`,
      avatar: {
        label: "Virar o avatar do RaioViajante",
        reduced: "Personagem ilustrado do RaioViajante",
      },
    },
    archive: {
      label: "Arquivo",
      title: "Tudo",
      emptyLine: "Todos os textos, do mais recente ao mais antigo.",
      empty: "Ainda não há textos publicados em português.",
      since: (count, firstDate) =>
        `${count} ${pluralCategory("pt-BR", count) === "one" ? "texto" : "textos"} desde ${firstDate}.`,
    },
    tags: {
      label: "Tags",
      title: "Assuntos",
      line: "O que continua aparecendo, ordenado por frequência.",
      recurring: "Recorrentes",
      once: "Uma vez até agora",
      empty: "Ainda não há tags publicadas em português.",
      pageLabel: "Tag",
      posts: (count) =>
        `${count} ${pluralCategory("pt-BR", count) === "one" ? "texto" : "textos"}`,
    },
    post: {
      label: "Texto",
      published: "publicado",
      updated: "atualizado",
      tags: "tags",
      series: "série",
      source: "fonte",
      edit: "editar no GitHub ↗",
      keepReading: "Continue lendo",
      related: "Relacionados por tag",
      labTry: "Experimente",
      minutesRead: (minutes) => `${minutes} min de leitura`,
      comments: "Comentários",
      commentsPowered: "Com tecnologia do GitHub Discussions.",
      commentsUi: commentsUiCopy["pt-BR"],
    },
    notFound: {
      metadata: {
        title: "404 — página não encontrada",
        description: "Esta página não foi encontrada no dump.",
      },
      line: "esta página mudou, nunca existiu ou eu ainda não escrevi sobre ela.",
      tryInstead: [
        { label: "dump", value: "começar de novo", href: "/pt" },
        { label: "arquivo", value: "todos os textos", href: "/pt/archive" },
        { label: "tags", value: "assuntos", href: "/pt/tags" },
        {
          label: "raioviajante.com",
          value: "início",
          href: "https://raioviajante.com/pt",
        },
      ],
    },
  },
} as const satisfies Record<LocaleId, DumpCopy>;

/** Dump's copy for a locale. The record is exhaustive over `LocaleId`. */
export function dumpCopy(locale: LocaleId): DumpCopy {
  return copy[locale];
}
