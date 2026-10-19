// Root's Portuguese (pt-BR) editorial copy. App-owned and manually authored:
// the shared UI strings live in packages/design's catalog. Only pages that ship
// in Portuguese appear here (Home, About, Search and the 404); the other Root
// pages are English-only. Names, handles, the email address and tool names are
// not translated.

import type { RouteKey } from "./routes.ts";

export const ptPageSeo: Partial<
  Record<RouteKey, { title: string; description: string }>
> = {
  home: {
    title: "raioviajante",
    description:
      "Casa pessoal de RaioViajante: projetos, textos técnicos, ilustrações e coisas construídas por curiosidade.",
  },
  about: {
    title: "sobre",
    description:
      "Sobre RaioViajante: curiosidade, computação e a construção independente de coisas.",
  },
  search: {
    title: "Busca",
    description: "Encontre páginas, projetos e textos do RaioViajante.",
  },
};

/** Search-index descriptions of the shipped Portuguese pages (search itself is not indexed). */
export const ptSearchDescriptions: Partial<Record<RouteKey, string>> = {
  home: "Casa pessoal e últimos textos",
  about: "Sobre RaioViajante",
};

export const ptNavigation = [
  { key: "home" as const, label: "início" },
  { key: "about" as const, label: "sobre" },
];

export const ptHome = {
  line: "com curiosidade de sobra para construir por conta própria.",
  links: "Links",
  latestWriting: "Últimos textos",
  noWriting: "Ainda não há textos em português.",
  englishWriting: "Ver os textos em inglês no Dump →",
  avatarLabel: "Virar o avatar do RaioViajante",
  /** Notes and descriptions of the primary links, keyed by their category. */
  linkCopy: {
    photos: {
      note: "fotos",
      description:
        "Fotos e atualizações rápidas das coisas que estou construindo.",
    },
    posts: {
      note: "posts",
      description: "Atualizações dos projetos que estou construindo.",
    },
    channel: {
      note: "canal",
      description:
        "Animações e vídeos sobre programação, de conceitos a coisas que estou construindo.",
    },
    shorts: {
      note: "vídeos curtos",
      description:
        "Animações curtas e comentários rápidos sobre ideias de programação.",
    },
    code: {
      note: "código",
      description: "Código, projetos e experimentos em andamento.",
    },
    source: {
      label: "Código dos Vídeos",
      note: "código-fonte",
      description: "Código-fonte que acompanha meus vídeos de programação.",
    },
    email: {
      note: "e-mail",
      description: "Escreva sobre uma ideia, uma dúvida ou uma colaboração.",
    },
  } as Record<string, { label?: string; note: string; description: string }>,
};

export const ptAbout = {
  label: "sobre",
  title: "Bryan",
  line: "A pessoa por trás do RaioViajante.",
  whoTitle: "Quem sou",
  who: "Sou o Bryan, desenvolvedor de software. Gosto de construir coisas para a web, testar ideias e entender como o software funciona. A curiosidade costuma me levar de uma pergunta a algo que posso fazer e com que posso aprender.",
  snapshotTitle: "Resumo rápido",
  snapshot: [
    {
      label: "Funções",
      value:
        "Atuo com engenharia de software e também estou começando a criar conteúdo.",
    },
    {
      label: "Foco atual",
      value:
        "Construir minhas próprias ferramentas, evoluir na programação e como pessoa, e melhorar no violão pelo caminho.",
    },
    {
      label: "Stack atual",
      value: "Java, Spring Boot, TypeScript, React e PostgreSQL.",
    },
    {
      label: "Temas",
      value:
        "Software, ferramentas para desenvolvedores, código aberto, web, IA, criação de conteúdo e música.",
    },
    {
      label: "Ferramentas de desenvolvimento",
      value: "VS Code, GitHub, Docker, pnpm e fluxos de trabalho no terminal.",
    },
    {
      label: "Ferramentas de IA",
      value: "ChatGPT, Codex, Claude, Kimi e OpenCode.",
    },
    {
      label: "O que valorizo",
      value:
        "Interfaces simples, documentação honesta e software fácil de raciocinar.",
    },
    {
      label: "O que costuma acontecer",
      value:
        "Construo algo, encontro três coisas de que não gosto, refaço e, eventualmente, dou por terminado.",
    },
  ],
  whyTitle: "Por que construo",
  why: "Programar é a forma que encontro de seguir essa curiosidade: desmontar uma ideia, entender um pouco mais e construir minha própria versão. Passo a maior parte do tempo com desenvolvimento web, sistemas de back-end e ferramentas para desenvolvedores. Java e TypeScript/JavaScript são terreno familiar; os projetos pessoais me dão espaço para explorar além deles.",
  siteTitle: "RaioViajante",
  siteBefore:
    "RaioViajante é o lugar onde reúno projetos, textos, documentação e coisas que descubro pelo caminho. Algumas ideias viram software. Outras viram anotações no ",
  siteMiddle1: ", documentação no ",
  siteMiddle2: " ou experimentos no ",
  englishNote: " (em inglês)",
  outsideTitle: "Fora do código",
  outside:
    "Gosto de música e de tocar violão, e arranjo tempo para filmes, livros e jogos. Fazem parte do meu mundo mesmo quando não têm nada a ver com software.",
};

export const ptNotFound = {
  metadata: {
    title: "404 — não encontrada",
    description: "Esta página não foi encontrada em raioviajante.com.",
  },
  line: "esta página mudou de lugar, nunca existiu ou ainda não foi construída.",
  tryInstead: [
    { label: "raioviajante.com", value: "recomeçar", href: "/pt" },
    {
      label: "dump",
      value: "textos (em inglês)",
      href: "https://dump.raioviajante.com",
      hrefLang: "en",
    },
    {
      label: "docs",
      value: "documentação (em inglês)",
      href: "https://docs.raioviajante.com",
      hrefLang: "en",
    },
    {
      label: "lab",
      value: "experimentos (em inglês)",
      href: "https://lab.raioviajante.com",
      hrefLang: "en",
    },
  ],
};
