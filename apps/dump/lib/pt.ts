import type { RouteKey } from "./routes";

export const ptPageSeo: Partial<
  Record<RouteKey, { title: string; description: string }>
> = {
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
  search: {
    title: "Busca",
    description:
      "Busque textos no dump e páginas em português no ecossistema RaioViajante.",
  },
};

export const ptCopy = {
  shell: {
    posts: "textos",
    archive: "arquivo",
    tags: "tags",
  },
  home: {
    line: "um despejo de memória, tomara que legível.",
    latest: "Mais recente",
    series: "Séries",
    part: "parte",
    parts: "partes",
    follow: "Acompanhe",
    code: "código ↗",
    empty: "Ainda não há textos publicados em português.",
  },
  archive: {
    label: "Arquivo",
    title: "Tudo",
    emptyLine: "Todos os textos, do mais recente ao mais antigo.",
    empty: "Ainda não há textos publicados em português.",
  },
  tags: {
    label: "Tags",
    title: "Assuntos",
    line: "O que continua aparecendo, ordenado por frequência.",
    recurring: "Recorrentes",
    once: "Uma vez até agora",
    empty: "Ainda não há tags publicadas em português.",
    pageLabel: "Tag",
    post: "texto",
    posts: "textos",
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
    minute: "min de leitura",
    comments: "Comentários",
    commentsUi: {
      waiting:
        "Os comentários carregam do giscus (GitHub Discussions) quando você chega a esta seção.",
      manual:
        "Os comentários são fornecidos pelo giscus (GitHub Discussions). Carregá-los conecta ao giscus.app e ao GitHub.",
      loading: "Carregando comentários…",
      failed: "Não foi possível carregar os comentários.",
      load: "Carregar comentários",
      retry: "Tentar novamente",
    },
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
        value: "início (em inglês)",
        href: "https://raioviajante.com",
        hrefLang: "en",
      },
    ],
  },
} as const;
