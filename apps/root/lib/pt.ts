// Root's Portuguese (pt-BR) editorial copy. App-owned and manually authored:
// the shared UI strings live in packages/design's catalog. Only pages that ship
// in Portuguese appear here (Home, About, Projects, All projects, the Stucco. case, Contact,
// Gallery, This site, Setup, Terms, Privacy, Search and the 404). The legal documents' bodies live
// in their pages, beside the English originals. Names, handles, the email
// address and tool names are not translated.

import type { GalleryCopy } from "./gallery.ts";
import type { ProjectsCopy } from "./projects.ts";
import type { StuccoCopy } from "./stucco.ts";
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
  "projects-stucco": {
    title: "Stucco. · para clientes",
    description:
      "Case de site e identidade visual para um estúdio de gesso e drywall, mostrado como demo conceitual com marca fictícia.",
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
  "projects-stucco": "Case: site e marca para um estúdio de gesso",
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
    films: {
      note: "filmes",
      description: "Os filmes que vi e o que achei deles.",
    },
    music: {
      note: "música",
      description: "As músicas às quais sempre volto.",
    },
    references: {
      note: "referências",
      description: "Referências visuais que gosto de guardar.",
    },
    ai: {
      note: "IA",
      description: "Meu perfil para modelos e experimentos de IA.",
    },
    data: {
      note: "dados",
      description: "Meu perfil para datasets, notebooks e competições.",
    },
    notes: {
      note: "notas",
      description: "Notas curtas e checklists de quando construo coisas.",
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
  cases: {
    stucco: {
      scope: "site + marca · demo conceitual",
      summary:
        "Site e marca para um estúdio de gesso e drywall: slideshow na abertura, galeria filtrável com 47 projetos, páginas de serviço, formulário de orçamento, cartões de visita e de avaliação. A marca é fictícia; as fotos são trabalhos reais do estúdio.",
      action: "Ler o case",
    },
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
    "profile-headphones":
      "Desenho a traço de RaioViajante de cabelo cacheado e fones de ouvido, de olhos fechados",
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
    ferry:
      "RaioViajante em um barco a remo com um barqueiro encapuzado, rumo a casas em forma de xícara sob a lua cheia, em preto e branco",
    "long-way-home":
      "RaioViajante carregando uma lanterna por uma floresta roxa em direção a uma casa sob a lua, cercado por criaturas gentis com chifres e pequenas figuras sombrias",
    "songs-for-rain":
      "RaioViajante escrevendo ao lado de um gato preto, um violão e uma lanterna acesa enquanto chove do lado de fora da janela",
    "between-trees":
      "Uma floresta escura desenhada em finas linhas sépia, com um caminho estreito que desaparece entre árvores altas",
    "stillness-below":
      "Um lago escuro sob nuvens pesadas, desenhado em finas linhas sépia e emoldurado por galhos suspensos",
    midnight:
      "Retrato pintado de um gato preto e peludo, com olhos dourados, sobre fundo roxo",
    "quiet-bells":
      "RaioViajante de capa de chuva amarela carregando uma vela diante de uma grande lanterna, sob sinos suspensos no escuro",
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

/** The Stucco. case page. The owner's Portuguese is the original of this copy. */
export const ptStuccoCopy: StuccoCopy = {
  kicker: "PARA CLIENTES · CASE 01",
  title: "Stucco.",
  intro:
    "Identidade visual, site e materiais de divulgação para um estúdio de gesso e drywall do interior de São Paulo. O objetivo era mostrar o padrão de acabamento das obras, aparecer nas buscas da região e transformar visitas em pedidos de orçamento pelo WhatsApp.",
  note: "Nesta demo, a marca, os contatos e os depoimentos são fictícios; as fotos são trabalhos reais do estúdio, usadas com autorização.",
  demo: {
    open: "Abrir a demo",
    hint: "Abre sobre esta página · 5 páginas · Esc para fechar",
    label: "Demo Stucco.",
    newTab: "Nova aba",
    close: "Fechar a demo",
    loading: "Carregando a demo…",
  },
  facts: [
    {
      term: "Ano",
      value: "2026",
      wide: false,
    },
    {
      term: "Status",
      value: "No ar",
      wide: false,
    },
    {
      term: "Meu papel",
      value: "Identidade visual, UI design e desenvolvimento front-end",
      wide: true,
    },
    {
      term: "Cliente",
      value: "Estúdio de gesso e drywall, nome preservado",
      wide: true,
    },
    {
      term: "Demo",
      value:
        "5 páginas em inglês, com marca fictícia. O site real é em português.",
      wide: true,
    },
  ],
  tour: {
    heading: "O tour",
    device: "Tamanho da tela",
    steps: "Etapas do tour",
    desktop: "desktop",
    mobile: "celular",
    previous: "Anterior",
    next: "Próximo",
    shotAlt: "Captura de tela da demo Stucco., {device}: {title}",
    groups: {
      home: "Início",
      menu: "Menu",
      services: "Serviços",
      projects: "Projetos",
      contact: "Contato",
    },
    captions: {
      desktop: {
        home: {
          title: "Início",
          caption:
            "O próprio trabalho do estúdio abre o site num slideshow, com legenda e contador em cada foto.",
        },
        menu: {
          title: "Menu",
          caption:
            "Um menu de altura total desliza sobre a página, com os links principais e o telefone do estúdio.",
        },
        featured: {
          title: "Projetos em destaque",
          caption:
            "Um carrossel de ambientes em destaque, cada um com o seu serviço e um link para a galeria completa.",
        },
        homeServices: {
          title: "Serviços na home",
          caption:
            "Os cinco serviços em grade, cada um com foto, número e uma frase.",
        },
        servicesPage: {
          title: "Página de serviços",
          caption:
            "Cada serviço ganha uma foto grande com um cartão branco por cima: descrição, soluções e um link de orçamento.",
        },
        service: {
          title: "Página de serviço",
          caption:
            "Um modelo para todos os serviços, abrindo com uma foto de largura total.",
        },
        serviceIntro: {
          title: "Abertura do serviço",
          caption:
            "Foto e cartão areia se sobrepõem, com o botão de orçamento ali mesmo.",
        },
        serviceOthers: {
          title: "Outros serviços",
          caption:
            "Os outros quatro serviços fecham a página, cada um com o seu número.",
        },
        projectsFilter: {
          title: "Filtro e detalhes",
          caption:
            "Filtrado por molduras externas. Passar o mouse numa foto mostra o nome e uma nota curta.",
        },
        contact: {
          title: "Contato",
          caption:
            "Formulário de orçamento ao lado do telefone, e-mail e horário do estúdio.",
        },
        contactSent: {
          title: "Pedido enviado",
          caption:
            "Depois do envio, o formulário agradece o visitante pelo nome. Na demo nada é enviado nem guardado.",
        },
      },
      mobile: {
        home: {
          title: "Início",
          caption: "O mesmo slideshow, no tamanho do celular.",
        },
        intro: {
          title: "Apresentação",
          caption:
            "No celular a foto fica acima do texto, e o botão continua ao alcance.",
        },
        featured: {
          title: "Projetos em destaque",
          caption:
            "O carrossel mantém o contador, as barras de progresso e as setas no celular.",
        },
        craft: {
          title: "Padrão",
          caption: "O cartão amarelo de destaque, empilhado embaixo da foto.",
        },
        signature: {
          title: "Assinatura",
          caption: "O logo animado: o quadrado amarelo cai no lugar.",
        },
        faq: {
          title: "Perguntas",
          caption: "As perguntas abrem e fecham no lugar, com um toque.",
        },
        footer: {
          title: "Rodapé",
          caption:
            "Endereço, horário, serviços e as cidades atendidas, tudo fictício.",
        },
        menuSvc: {
          title: "Menu numa página de serviço",
          caption: "O menu marca a seção em que você está.",
        },
        services: {
          title: "Serviços",
          caption:
            "Cada serviço ganha uma foto, uma frase e as principais soluções.",
        },
        gallery: {
          title: "Galeria do serviço",
          caption:
            "Cada página de serviço mostra os próprios projetos numa galeria.",
        },
        others: {
          title: "Outros serviços",
          caption: "Os outros serviços fecham a página, dois a dois.",
        },
        projects: {
          title: "Projetos",
          caption: "47 ambientes numa coluna só, com os filtros logo acima.",
        },
        contact: {
          title: "Contato",
          caption:
            "Telefone, e-mail e horário vêm primeiro, sobre uma foto inteira.",
        },
        chips: {
          title: "Formulário",
          caption:
            "As opções são botões grandes, feitos para o dedo, então o formulário é rápido de preencher no celular.",
        },
        sent: {
          title: "Pedido enviado",
          caption:
            "Depois do envio, o formulário agradece o visitante pelo nome. Na demo nada é enviado nem guardado.",
        },
      },
    },
  },
  brief: {
    heading: "O pedido do cliente",
    lead: "O estúdio vivia de indicação e redes sociais. Não havia um lugar que reunisse as obras, explicasse cada serviço ou deixasse claro em quais cidades a empresa atende. O cliente pediu:",
    items: [
      "um site com cara de escritório de arquitetura, não de prestador genérico;",
      "rápido e fácil de usar no celular, onde está a maior parte do público;",
      "um caminho curto até o orçamento, direto no WhatsApp;",
      "presença nas buscas do Google nas cidades atendidas;",
      "uma forma simples de conseguir mais avaliações no Google.",
    ],
    note: "No meio do projeto, a marca mudou de nome para homenagear o fundador. Todo o sistema visual foi adaptado ao nome novo.",
  },
  goals: {
    heading: "Objetivos",
    items: [
      "Valorizar o trabalho com fotos grandes e uma galeria organizada por serviço.",
      "Explicar os cinco serviços de forma clara, cada um com sua página.",
      "Gerar pedidos de orçamento qualificados, que já chegam com as informações da obra.",
      "Ganhar visibilidade nas buscas locais da região.",
      "Manter a mesma identidade no site, nos impressos e nas redes.",
    ],
  },
  done: {
    heading: "O que foi feito",
    groups: [
      {
        title: "Identidade visual",
        items: [
          "Logo em blocos tipográficos com um ponto amarelo, que funciona em positivo, em negativo e sobre amarelo.",
          "Uma versão animada do logo, em que o ponto cai no lugar e os blocos se reorganizam. Ela virou a assinatura do site.",
          "Paleta de grafite, preto, bege e amarelo, tipografia Barlow e uma linguagem de blocos e “pixels” que se repete em toda a marca.",
          "Guia de estilo com cores, tipografia, componentes e regras de uso.",
        ],
      },
      {
        title: "Site",
        items: [
          "25 páginas: home, página geral de serviços, uma página para cada um dos cinco serviços, galeria de projetos, sobre, regiões atendidas, oito páginas de cidade, contato, FAQ, avaliação, política de privacidade e página 404.",
          "Galeria em mosaico com mais de 45 obras, filtros por serviço e detalhes de cada projeto ao toque.",
          "Formulário de orçamento em três etapas, com opções clicáveis para serviço, tipo de imóvel, etapa da obra e área. Ao enviar, o WhatsApp abre com a mensagem já escrita.",
          "Botão de orçamento sempre visível, cabeçalho compacto que aparece na rolagem e botão flutuante do WhatsApp.",
          "Animações de revelação ligadas à rolagem, como blocos sobrepostos e fotos que se abrem como cortina. Elas respeitam a configuração de redução de movimento do sistema.",
        ],
      },
      {
        title: "SEO local",
        items: [
          "Uma página de serviço para cada especialidade, com conteúdo próprio, perguntas frequentes e links para os outros serviços.",
          "Página de regiões atendidas com mapa dos 165 municípios num raio de 150 km, montado a partir de dados oficiais do IBGE, com links para as páginas de cidade.",
          "Oito páginas de cidade com texto, distância e perguntas frequentes próprios, ligadas entre si e aos serviços.",
          "Títulos e estrutura de cabeçalhos organizados por página, texto alternativo descritivo em todas as fotos e imagens otimizadas para carregar rápido no celular.",
          "Fluxo de avaliações no Google, que fortalece o perfil da empresa nas buscas locais. A página de avaliação fica fora do índice do Google.",
        ],
      },
      {
        title: "Avaliações",
        items: [
          "Página dedicada que leva o cliente direto para avaliar a empresa no Google.",
          "QR code impresso no cartão de avaliação e num adesivo de 20 × 28 cm para os carros da equipe.",
        ],
      },
      {
        title: "Impressos e redes",
        items: [
          "Cartão de visita e cartão de avaliação no formato 9 × 5 cm, com sangria e marcas de corte, prontos para a gráfica.",
          "Adesivo de QR code para os carros, que já são envelopados com a marca.",
          "Ícone de perfil, carrossel de primeiro post e sugestão de bio para as redes.",
          "Favicon em todos os tamanhos.",
        ],
      },
      {
        title: "Entrega para desenvolvimento",
        items: [
          "Pacote de referência em inglês com todas as páginas, tokens de cor e tipografia, imagens nomeadas e o logo animado pronto para uso.",
        ],
      },
    ],
  },
  brand: {
    heading: "A marca",
    lead: "Peças impressas e de redes sociais feitas para o estúdio, mostradas com o nome fictício Stucco. Todos os QR codes levam para um endereço de exemplo reservado.",
    cover:
      "Logotipo, monograma e o quadrado amarelo que atravessa todas as peças.",
    coverAlt:
      "Identidade Stucco.: logotipo, monograma, cartão de visita, cartão de avaliação e o site no celular",
    mockup: "mockup",
    art: "arte",
    front: "frente",
    back: "verso",
    icon: "ícone do perfil",
    post: "primeiro post",
    pieces: {
      business: {
        title: "Cartão de visita",
        spec: "9 × 5 cm · pronto para a gráfica, com sangria e marcas de corte",
      },
      review: {
        title: "Cartão de avaliação",
        spec: "9 × 5 cm · um QR direto para a avaliação no Google, em três passos",
      },
      car: {
        title: "Adesivo de QR para o carro",
        spec: "20 × 28 cm · para os carros da equipe, já envelopados com a marca",
      },
      social: {
        title: "Perfil social",
        spec: "Ícone do perfil e o primeiro post do carrossel",
      },
    },
  },
  tech: {
    heading: "Tecnologias",
    rows: [
      {
        term: "Site",
        value: "Astro",
      },
      {
        term: "Demo do portfólio",
        value: "HTML, CSS e JavaScript puros, sem build e sem dependências",
      },
      {
        term: "Animações",
        value: "CSS com animações ligadas à rolagem",
      },
      {
        term: "Fonte",
        value: "Barlow, hospedada no próprio site",
      },
      {
        term: "Mapa",
        value: "Dados de municípios do IBGE",
      },
      {
        term: "Repositório",
        value: "GitHub",
      },
    ],
  },
  result: {
    heading: "Resultado",
    lead: "Marca, site e materiais funcionam como um único sistema, do logo ao formulário de orçamento. O estúdio passou a ter:",
    items: [
      "um portfólio organizado por serviço;",
      "páginas pensadas para aparecer nas buscas de cada cidade da região;",
      "um caminho de dois toques até o orçamento no WhatsApp;",
      "um fluxo de avaliações que começa num cartão ou no carro da equipe e termina no Google.",
    ],
  },
  cta: "Tem um projeto assim? Escreva para",
  backAll: "Voltar para projetos",
};
