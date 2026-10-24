// Root's Portuguese (pt-BR) editorial copy. App-owned and manually authored:
// the shared UI strings live in packages/design's catalog. Only pages that ship
// in Portuguese appear here (Home, About, Projects, Contact, Gallery, This site,
// Setup, Terms, Privacy, Search and the 404). The legal documents' bodies live
// in their pages, beside the English originals. Names, handles, the email
// address and tool names are not translated.

import type { GalleryCopy } from "./gallery.ts";
import { projects, type Project, type ProjectName } from "./projects.ts";
import type { RouteKey } from "./routes.ts";
import { localizedPath, participates } from "../../../site/locales.ts";
import { siteOrigins, type SiteId } from "../../../site/sites.ts";

/** A localized cross-host destination needs both deployments to participate. */
function portugueseHome(site: Exclude<SiteId, "root">) {
  return participates("root", "pt-BR") && participates(site, "pt-BR")
    ? {
        href: `${siteOrigins[site]}${localizedPath(site, "pt-BR", "/")}`,
        hrefLang: "pt-BR" as const,
      }
    : { href: siteOrigins[site], hrefLang: "en" as const };
}

export const ptDumpHome = portugueseHome("dump");
export const ptDocsHome = portugueseHome("docs");
export const ptLabHome = portugueseHome("lab");

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
  projects: {
    title: "projetos",
    description:
      "Projetos e experimentos de software do RaioViajante, de ferramentas a linguagens de programação.",
  },
  contact: {
    title: "contato",
    description:
      "Entre em contato com RaioViajante por e-mail para conversar sobre ideias, dúvidas, feedback ou colaboração.",
  },
  gallery: {
    title: "galeria",
    description:
      "Uma coleção pessoal de ilustrações de personagens, desenhos e experimentos visuais.",
  },
  "this-site": {
    title: "este site",
    description:
      "Como o raioviajante.com é construído, projetado e conectado ao Dump, Docs e Lab.",
  },
  setup: {
    title: "setup",
    description:
      "Os computadores, as ferramentas e os softwares do setup de trabalho de RaioViajante.",
  },
  terms: {
    title: "termos de uso",
    description:
      "Termos de Uso de raioviajante.com: escopo, conteúdo, código e destinos externos.",
  },
  privacy: {
    title: "política de privacidade",
    description:
      "Política de Privacidade de raioviajante.com: preferências, dados, contato e seus direitos.",
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
  projects: "Projetos e trabalhos",
  contact: "Formas de entrar em contato",
  gallery: "Arte e imagens",
  "this-site": "Como este site é construído",
  setup: "Ferramentas e setup",
};

export const ptNavigation = [
  { key: "home" as const, label: "início" },
  { key: "about" as const, label: "sobre" },
  { key: "projects" as const, label: "projetos" },
  { key: "contact" as const, label: "contato" },
  { key: "gallery" as const, label: "galeria" },
  { key: "this-site" as const, label: "este site" },
];

export const ptHome = {
  line: "com curiosidade de sobra para construir por conta própria.",
  links: "Links",
  projects: "Projetos",
  latestWriting: "Últimos textos",
  noWriting: "Ainda não há textos em português.",
  englishWriting: "Ver os textos em inglês no Dump →",
  otherLinks: "Outros links",
  setupValue: "equipamento",
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

const ptProjectCopy: Record<
  ProjectName,
  Pick<Project, "description" | "kind" | "stack" | "status">
> = {
  Hum: {
    description:
      "Um player de música para terminal construído em Rust. Uma exploração de como pode ser uma interface de música focada sem sair da linha de comando.",
    kind: "software / música",
    stack: "rust",
    status: "explorando",
  },
  Sweep: {
    description:
      "Uma ferramenta em Python para organizar arquivos pessoais com regras previsíveis. Estou trabalhando na configuração e nos limites de segurança antes de dar à ferramenta mais autonomia sobre o sistema de arquivos.",
    kind: "ferramenta / automação",
    stack: "python",
    status: "ativo",
  },
  Orbit: {
    description:
      "Um back-end de execução de tarefas construído com Java e Spring. No momento, ele modela tarefas, execuções e transições de estado válidas; o agendamento e a execução de processos ainda estão por vir.",
    kind: "back-end / execução de tarefas",
    stack: "java / spring",
    status: "ativo",
  },
  Yanawa: {
    description:
      "Uma linguagem de programação orientada a aplicações em fase de projeto. O trabalho atual é definir sua forma e seu comportamento antes de implementar o compilador.",
    kind: "design de linguagem",
    stack: "design de linguagem",
    status: "explorando",
  },
  Dump: {
    description:
      "textos técnicos, anotações e coisas aprendidas do jeito difícil",
    kind: "escrita / notas técnicas",
    stack: "next.js / mdx",
    status: "ativo",
  },
};

/** Localized presentation layered over the stable English project facts. */
export const ptProjects: Project[] = projects.map((project) => ({
  ...project,
  ...ptProjectCopy[project.name],
}));

export const ptProjectsPage = {
  label: "projetos",
  title: "Projetos",
  line: "Ferramentas, experimentos de software e textos.",
  sectionTitle: "Projetos",
  type: "Tipo:",
  repository: "Repositório:",
  url: "URL:",
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

export const ptContact = {
  label: "contato",
  title: "Vamos conversar",
  line: "Ideias, dúvidas, feedback ou só um oi.",
  primaryTitle: "Contato principal",
  primary:
    "Esta é a melhor forma de falar comigo sobre código aberto, algo que poderíamos construir juntos ou uma dúvida sobre o que fiz, escrevi ou documentei. Correções, feedback e um simples oi também são bem-vindos.",
  messageTitle: "Uma boa primeira mensagem",
  messageItems: [
    "O que você tem em mente",
    "Um link relevante para um projeto, texto ou documentação, se houver",
    "Que tipo de conversa ou colaboração você procura",
    "Qualquer prazo importante",
  ],
  firstStepTitle: "Um primeiro passo simples",
  firstStep:
    "Algumas linhas de contexto bastam para começar. Não precisa preparar um briefing formal.",
};

export const ptGallery = {
  label: "galeria",
  title: "Um quebra-cabeça visual",
  line: "Ilustrações, personagens e cenas do mundo do RaioViajante, organizadas como um quadro.",
};

/** Artwork titles stay as supplied (proper names and artistic titles); everything else is translated. */
export const ptGalleryCopy: GalleryCopy = {
  categories: {
    branding: {
      title: "Identidade visual",
      description:
        "O personagem, em adesivos. Alguns têm uma função nestes sites: passe o mouse para ver onde.",
      note: "folha de adesivos + quadros do avatar",
    },
    profiles: {
      title: "Perfis",
      description: "Onde o RaioViajante aparece fora destes sites.",
      note: "fotos de perfil",
    },
    personal: {
      title: "Pessoais",
      description:
        "Desenhados sem outro motivo além da vontade. Fixados na ordem em que surgiram.",
      note: "ilustrações",
    },
  },
  stickerAlt: "Adesivo do RaioViajante: {title}",
  alts: {
    "profile-laptop":
      "RaioViajante coçando a cabeça diante de um laptop, com dois pontos de interrogação ao lado",
    "profile-hmm": "RaioViajante com a mão no queixo, olhando para cima",
    lab: "RaioViajante de jaleco segurando um frasco verde entre tanques luminosos etiquetados com linguagens",
    portrait:
      "Retrato pintado de RaioViajante com uma camiseta escura sobre fundo roxo",
    castle:
      "RaioViajante correndo por um cemitério em direção a um castelo sob a lua cheia",
    cow: "Uma vaca fofa dizendo muhh sobre fundo roxo",
    cats: "Três gatos pretos de olhos laranja, um deles segurando um peixe",
    sunset:
      "RaioViajante tocando ukulele sob uma árvore, ao pôr do sol, à beira-mar",
    calves: "Dois bezerros brincando, um deles pulando",
    hospital:
      "RaioViajante em uma cama de hospital ao lado de um monitor que exibe código binário",
    mirror: "RaioViajante olhando para um espelho que o reflete como um burro",
  },
  uses: {
    "gallery cover": "capa da galeria",
    "404 · every site": "404 · todos os sites",
    "search · every site": "busca · todos os sites",
    "empty search": "busca vazia",
    "profile picture": "foto de perfil",
  },
  linkLabels: { source: "Código dos Vídeos" },
  kinds: {
    branding: { type: "adesivo", group: "identidade visual" },
    profiles: { type: "foto de perfil", group: "perfis" },
    personal: { type: "pessoal", group: "pessoais" },
  },
  ui: {
    sections: "Seções da coleção",
    collection: "Coleção",
    reveal: "Mostrar a coleção de arte",
    coverAlt: "RaioViajante sob uma placa que diz “work of art”",
    hintOpen: "clique para guardar tudo",
    hintClosed: "clique no adesivo",
    avatar: "Avatar",
    avatarFlip: "Virar o avatar do RaioViajante",
    avatarStill: "Personagem ilustrado do RaioViajante",
    avatarMeta: "páginas iniciais · 10 quadros",
    avatarFrames: "Animação do avatar, dez quadros",
    avatarFrame: "Quadro {n} do avatar",
    view: "Ver {title}",
    profilesOf: "Perfis de {title}",
    close: "fechar",
    download: "baixar",
    previous: "Obra anterior",
    next: "Próxima obra",
    usedOn: "usado em",
    downloadLabel: "Download",
    downloadTitle: "Leve um pouco de arte com você",
    downloadIntro: "Escolha as categorias que quiser. Só elas são salvas.",
    legend: "Categorias",
    files: { one: "{n} arquivo", other: "{n} arquivos" },
    clear: "limpar seleção",
    selectAll: "selecionar tudo",
    saves: "Será salvo como {filename}.",
    savesFolders: "Será salvo como {filename}, com uma pasta por categoria.",
    nothing: "Nada selecionado ainda.",
    packing: "Compactando {i} de {n}…",
    saved: "{filename} salvo, {files}.",
    failed: "Não foi possível salvar a coleção. Tente novamente.",
    busy: "compactando…",
    zip: "baixar .zip",
    zipCount: "baixar .zip · {files}",
  },
};

export const ptThisSite = {
  label: "este site",
  title: "raioviajante.com",
  line: "Um pequeno espaço para meus projetos, textos e experimentos.",
  siteTitle: "O site",
  site: "Este é o ponto de partida para os sites do RaioViajante. Ele reúne meus projetos, textos recentes, ilustrações e informações de contato em um só lugar. Os textos ficam no Dump, a documentação no Docs e os experimentos no Lab. Cada um tem seu próprio site e propósito.",
  builtTitle: "Como é construído",
  builtItems: [
    "Next.js, React e TypeScript no próprio site",
    "CSS para o layout, a tipografia e a identidade visual",
    "Ilustrações originais para o personagem e a galeria",
    "O feed RSS público do Dump para mostrar os últimos textos na página inicial",
    "Som opcional, com a preferência salva no seu navegador",
  ],
  repositoryTitle: "Repositório",
  repositoryBefore:
    "O código deste site e dos outros apps web do RaioViajante está no ",
  repositoryAfter:
    ". Para informações sobre o uso dos textos ou das ilustrações do site, consulte os ",
  terms: "Termos de Uso",
};

/** Portuguese names of the English gear categories; product names stay as supplied. */
export const ptGearCategories: Record<string, string> = {
  laptop: "notebook",
  monitor: "monitor",
  keyboard: "teclado",
  mouse: "mouse",
  earbuds: "fones de ouvido",
  microphone: "microfone",
  webcam: "webcam",
  hub: "hub",
  console: "console",
  "acoustic guitar": "violão",
};

export const ptSetup = {
  label: "setup",
  title: "Setup",
  line: "As ferramentas que uso na minha mesa e na estrada.",
  gearTitle: "Lista de equipamentos",
  disclosure:
    "Alguns links abaixo são links de afiliado. Se você comprar por eles, posso receber uma comissão, sem custo adicional para você.",
  empty: "Estou montando a lista.",
  link: "Link:",
  noLink: "Nenhum link confiável disponível.",
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
      value: ptDumpHome.hrefLang === "pt-BR" ? "textos" : "textos (em inglês)",
      ...ptDumpHome,
    },
    {
      label: "docs",
      value:
        ptDocsHome.hrefLang === "pt-BR"
          ? "documentação"
          : "documentação (em inglês)",
      ...ptDocsHome,
    },
    {
      label: "lab",
      value:
        ptLabHome.hrefLang === "pt-BR"
          ? "experimentos"
          : "experimentos (em inglês)",
      ...ptLabHome,
    },
  ],
};
