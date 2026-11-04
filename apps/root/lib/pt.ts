// Root's Portuguese (pt-BR) editorial copy. App-owned and manually authored:
// the shared UI strings live in packages/design's catalog. Only pages that ship
// in Portuguese appear here (Home, About, Projects, All projects, Contact,
// Gallery, This site, Setup, Terms, Privacy, Search and the 404). The legal documents' bodies live
// in their pages, beside the English originals. Names, handles, the email
// address and tool names are not translated.

import type { GalleryCopy } from "./gallery.ts";
import type { ProjectsCopy } from "./projects.ts";
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
      "O que o RaioViajante constrói: Mochifile, Ordelis, Refrain e Orbit, cada um com um pequeno esboço para testar, e um espaço para trabalhos com clientes.",
  },
  "projects-all": {
    title: "todos os projetos",
    description:
      "Todos os projetos do RaioViajante, de ferramentas de arquivo e música a uma linguagem de programação e um jogo, com filtros por tipo.",
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
  "projects-all": "Todos os projetos, por tipo",
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

/** Every word of the projects pages, the home cards and the sketches. */
export const ptProjectsCopy: ProjectsCopy = {
  projects: {
    mochifile: {
      meta: "ferramentas de arquivo / web",
      tagline: "ferramentas de arquivo no navegador",
      description:
        "Ferramentas de arquivo para tarefas do dia a dia, para quem só quer resolver o problema. Os arquivos são processados no seu navegador, sem envio. Hoje há uma ferramenta, que comprime uma imagem até um tamanho-alvo; outras estão planejadas.",
      summary:
        "Comprime uma imagem até um tamanho-alvo, direto no navegador. Outras ferramentas estão planejadas.",
      status: "pré-lançamento",
      action: "Abrir o Mochifile",
      actionShort: "mochifile.com",
    },
    ordelis: {
      meta: "agentes de código / orquestração",
      tagline: "um espaço de trabalho para agentes de código",
      description:
        "Um espaço de trabalho local para desktop que coordena agentes de programação com IA: planejar uma tarefa, deixar os agentes trabalharem nela, revisar as evidências e decidir o que entra. Ainda é cedo: o desktop mostra dados de exemplo, e o runtime de agentes em que ele se apoia só roda pela linha de comando.",
      summary:
        "Um espaço de trabalho para desktop que coordena agentes de programação, com uma pessoa revisando e decidindo.",
      status: "início do desenvolvimento",
      action: "Ler a documentação",
      actionShort: "a documentação",
    },
    refrain: {
      meta: "diário musical / pessoal",
      tagline: "um diário musical pessoal",
      description:
        "Meu diário musical pessoal: avaliações, reflexões e memórias sobre álbuns, músicas, artistas e bandas. Começou como um trabalho de Engenharia de Software na faculdade. Uma parte já funciona no meu computador; ainda não está online.",
      summary:
        "Meu diário musical pessoal: álbuns, músicas, artistas e as memórias em volta deles.",
      status: "em desenvolvimento",
      action: "Ler como começou",
      actionShort: "como começou",
    },
    orbit: {
      meta: "back-end / execuções de jobs",
      tagline: "execuções de jobs e seus estados",
      description:
        "Um agendador de jobs self-hosted em fase inicial. Hoje ele guarda jobs, registra execuções e aplica as transições válidas entre os estados delas: na fila, executando, concluída, falhou e cancelada. O agendamento e a execução dos jobs ainda estão planejados.",
      summary:
        "Guarda jobs e registra como cada execução passa de um estado a outro. O agendamento ainda está planejado.",
      status: "início do desenvolvimento",
      action: "Testar o experimento",
      actionShort: "o experimento no lab",
    },
    yanawa: {
      meta: "linguagem de programação",
      tagline: "uma linguagem de programação, no papel",
      description:
        "Uma linguagem experimental, com tipagem forte, para construir aplicações. Ela existe como documentos de design; ainda não há compilador.",
      summary:
        "Minha linguagem autoral, com tipagem forte e foco em aplicações. Ainda em design: não há compilador.",
      status: "em design",
      actionShort: "a documentação",
    },
    sweep: {
      meta: "CLI / Python",
      tagline: "um organizador de arquivos para o terminal",
      description:
        "Uma ferramenta de linha de comando em Python que organiza os arquivos de uma pasta em diretórios por categoria, de acordo com a extensão.",
      summary:
        "Organiza os arquivos de uma pasta em diretórios por categoria. O preview mostra o plano sem mover nada.",
      status: "ativo",
      actionShort: "a documentação",
    },
    hum: {
      meta: "música / terminal",
      tagline: "um player de música para terminal",
      description:
        "Um player de música local para o terminal, em Rust. Ele está sendo planejado e especificado; o player em si ainda não foi construído.",
      summary:
        "Um player de música local para o terminal, em Rust. Ainda em planejamento: o player não foi construído.",
      status: "em planejamento",
      actionShort: "repositório",
    },
    morrowferry: {
      meta: "jogo / narrativa",
      tagline: "um jogo narrativo em pixel art",
      description:
        "Um jogo narrativo curto em pixel art sobre um velho barqueiro e um menino que procura alguém.",
      summary:
        "Um jogo narrativo curto em pixel art sobre um velho barqueiro e um menino que procura alguém. Melancólico, um pouco estranho e acolhedor.",
      status: "em desenvolvimento",
    },
  },
  categories: {
    tools: "ferramentas",
    music: "música",
    systems: "sistemas",
    languages: "linguagens",
    games: "jogos",
  },
  noLink: "sem link público ainda",
  englishOnly: " (em inglês)",
  page: {
    label: "projetos",
    title: "Projetos",
    line: "O que eu construo para mim, e o que construo com clientes.",
    mine: "Meus projetos",
    lead: "Quatro coisas que estou construindo agora. Cada card tem um pequeno esboço que roda no seu navegador: ele mostra a ideia, não o projeto de verdade.",
    viewAll: "Ver todos os projetos",
    clients: "Para clientes",
    clientsLead:
      "Trabalhos feitos com e para clientes. Os cases aparecem aqui quando estiverem escritos e liberados para publicação.",
    clientsEmpty: "Nenhum case de cliente publicado ainda.",
    clientsEmptyNote: "Cada um vai contar o que foi pedido e o que foi feito.",
    caseLabel: "case",
    caseSoon: "Case em breve",
    cta: "Tem um projeto em mente? Escreva para",
  },
  all: {
    back: "Projetos",
    label: "projetos / todos",
    title: "Todos os projetos",
    line: "Uma coleção pessoal do que eu construo: ferramentas, música, linguagens, jogos e experimentos.",
    heading: "Todos os projetos",
    filters: "Filtrar projetos por tipo",
    all: "todos",
    count: { one: "{n} projeto", other: "{n} projetos" },
    cta: "Quer conversar sobre algum deles? Escreva para",
  },
  home: {
    heading: "Meus projetos",
    more: "Mais projetos e trabalhos para clientes",
  },
  art: {
    label: {
      mochifile:
        "Esboço do Mochifile: uma foto comprimida até um tamanho-alvo, com valores de exemplo; converter e redimensionar chegam em breve",
      ordelis:
        "Esboço do Ordelis: a etapa de revisão planejada, em que você aprova o trabalho dos agentes ou o devolve",
      refrain:
        "Esboço do Refrain: um diário musical desenhado à mão e um disco",
      orbit:
        "Esboço do Orbit: execuções passando de um estado a outro, simuladas no seu navegador",
      yanawa:
        "Esboço do yanawa: uma linha de sintaxe de design dividida em tokens e em uma árvore sintática",
      sweep:
        "Esboço do Sweep: um exemplo de execução organizando quatro arquivos em pastas",
      hum: "Esboço do Hum: o player planejado, com um visualizador em movimento",
      morrowferry:
        "Esboço do Morrowferry: um barqueiro e um menino em um barco iluminado por uma lanterna, à noite",
    },
    example: "valores de exemplo",
    simulated: "simulado no seu navegador",
    mochifile: {
      tools: "Ferramentas do Mochifile",
      compress: "Comprimir",
      convert: "Converter",
      resize: "Redimensionar",
      format: "formato",
      width: "largura",
      soon: "em breve no Mochifile",
      local: "no seu navegador",
      original: "original",
      result: "resultado",
      file: "foto",
      target: "tamanho-alvo",
      under: "abaixo de {size}",
      before: "antes",
      after: "depois",
    },
    ordelis: {
      note: "fluxo planejado · esboço",
      task: "tarefa",
      agents: "agentes",
      review: "revisão",
      taskTitle: "Adicionar busca na página de configurações",
      plan: "planejar",
      implement: "implementar",
      test: "testar",
      implementing: "implementando · 3 de 4",
      writingTests: "escrevendo testes",
      revising: "revisando com as suas notas",
      done: "pronto",
      another: "outro agente",
      anotherNote: "entra quando precisar",
      files: "6 arquivos",
      testsPassing: "testes passando",
      lintClean: "lint sem erros",
      openComment: "1 comentário aberto",
      you: "você",
      waiting: "Esperando a sua revisão.",
      approved: "Aprovado por você. Pronto para o merge.",
      returned: "Devolvido com as suas notas.",
      approve: "Aprovar",
      requestChanges: "Pedir mudanças",
    },
    refrain: {
      albums: "álbuns",
      artists: "artistas",
      memories: "memórias",
      title: "faixa a faixa",
      tagline: "algumas músicas levam a gente de volta.",
      play: "tocar",
      stop: "parar",
      record: "o disco",
    },
    orbit: {
      header: "orbit · estados de execução",
      queued: "na fila",
      running: "executando",
      succeeded: "concluída",
      failed: "falhou",
      cancelled: "cancelada",
      finished: "fim",
      queue: "Enfileirar um job",
      cancel: "Cancelar",
      idle: "Nada na fila. Enfileire um job.",
      full: "Seis execuções ao mesmo tempo é o limite aqui.",
      log: "Mudanças de estado",
      counts: "Execuções por estado",
    },
    yanawa: {
      note: "sintaxe de design · nada executa isso ainda",
      tokens: "tokens",
      tree: "árvore sintática",
    },
    sweep: {
      files: ["foto.png", "relatorio.pdf", "arquivo.tar.gz", "musica.mp3"],
      done: "exemplo · 4 movidos · 0 ignorados",
    },
    hum: {
      note: "interface planejada",
      nowPlaying: "tocando agora",
      track: "musica.flac",
      volume: "vol",
    },
  },
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
    candle:
      "RaioViajante de capa de chuva amarela segurando uma vela acesa ao lado de uma lanterna no escuro",
    ferry:
      "RaioViajante em um barco a remo com um barqueiro encapuzado, rumo a casas em forma de xícara sob a lua cheia, em preto e branco",
    forest:
      "RaioViajante com uma lanterna em uma floresta roxa de outono, observado por uma criatura peluda gigante e pequenas criaturas sombrias",
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
