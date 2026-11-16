// Root's Portuguese (pt-BR) editorial copy. App-owned and manually authored:
// the shared UI strings live in packages/design's catalog. Only pages that ship
// in Portuguese appear here (Home, About, Projects, All projects, the Stucco.
// and Quadra cases, Contact,
// Gallery, This site, Setup, Terms, Privacy, Search and the 404). The legal documents' bodies live
// in their pages, beside the English originals. Names, handles, the email
// address and tool names are not translated.

import { aboutNow, toolsUnder, type AboutCopy } from "./about.ts";
import type { ContactCopy } from "./contact.ts";
import type { GalleryCopy } from "./gallery.ts";
import type { ProjectsCopy } from "./projects.ts";
import type { QuadraCopy } from "./quadra.ts";
import type { StuccoCopy } from "./stucco.ts";
import type { OtherSite } from "./this-site.ts";
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
      "O que o RaioViajante constrói: Mochifile, Ordelis, Refrain, Orbit e mais quatro projetos, e os cases de trabalhos para clientes e acadêmicos.",
  },
  "projects-stucco": {
    title: "Stucco. · para clientes",
    description:
      "Case de site e identidade visual para um estúdio de gesso e drywall, mostrado como demo conceitual com marca fictícia.",
  },
  "projects-quadra": {
    title: "Quadra · projeto acadêmico",
    description:
      "Case de um sistema de eventos e reserva de espaços para uma faculdade, feito por duas pessoas como projeto acadêmico e reimaginado como produto fictício, com uma demo de front-end.",
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
  "projects-quadra": "Case: sistema de eventos e reservas para uma faculdade",
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
      description:
        "Uma linguagem experimental, com tipagem forte, para construir aplicações. Ela existe como documentos de design; ainda não há compilador.",
      summary:
        "Minha linguagem autoral, com tipagem forte e foco em aplicações. Ainda em design: não há compilador.",
      status: "em design",
      action: "Ler a documentação",
      actionShort: "a documentação",
    },
    sweep: {
      meta: "CLI / Python",
      description:
        "Uma ferramenta de linha de comando em Python que organiza os arquivos de uma pasta em diretórios por categoria, de acordo com a extensão.",
      summary:
        "Organiza os arquivos de uma pasta em diretórios por categoria. O preview mostra o plano sem mover nada.",
      status: "ativo",
      action: "Ler a documentação",
      actionShort: "a documentação",
    },
    hum: {
      meta: "música / terminal",
      description:
        "Um player de música local para o terminal, em Rust. Ele está sendo planejado e especificado; o player em si ainda não foi construído.",
      summary:
        "Um player de música local para o terminal, em Rust. Ainda em planejamento: o player não foi construído.",
      status: "em planejamento",
      action: "Abrir o repositório",
      actionShort: "repositório",
    },
    morrowferry: {
      meta: "jogo / narrativa",
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
      line: "Site e marca para um estúdio de gesso e drywall.",
      summary:
        "Site e marca para um estúdio de gesso e drywall: slideshow na abertura, galeria filtrável com 47 projetos, páginas de serviço, formulário de orçamento, cartões de visita e de avaliação. A marca é fictícia; as fotos são trabalhos reais do estúdio.",
      action: "Ler o case",
    },
    quadra: {
      scope: "projeto acadêmico · produto + UI · demo conceitual",
      line: "Um sistema de eventos e reserva de espaços para uma faculdade.",
      summary:
        "Um sistema de eventos e reserva de espaços para uma faculdade, feito com o Rafael como projeto acadêmico e reimaginado como a Quadra, uma marca fictícia: calendário por períodos, pedidos com aprovação, check-in, análises e agenda pública.",
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
    lead: "O que estou construindo agora. Quatro aqui na frente, o resto a um clique.",
    more: "Ver mais {n} projetos",
    less: "Ver menos projetos",
    viewAll: "Ver todos os projetos",
    cases: "Cases",
    casesLead:
      "Trabalhos para clientes e projetos acadêmicos, cada um contado como um case.",
    caseLabel: "case",
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
    more: "Todos os projetos, inclusive para clientes",
  },
  art: {
    example: "valores de exemplo",
    simulated: "simulado no seu navegador",
    mochifile: { file: "foto" },
    ordelis: {
      note: "fluxo planejado · esboço",
      task: "tarefa",
      you: "você",
      approve: "Aprovar",
    },
    refrain: {
      kicker: "UM DIÁRIO MUSICAL · FEITO À MÃO",
      tagline: "algumas músicas levam a gente de volta.",
      note: "( lado A: as que ficam )",
    },
    orbit: {
      queued: "na fila",
      running: "executando",
      succeeded: "concluída",
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

export const ptAbout: AboutCopy = {
  label: "sobre",
  title: "Sobre",
  line: "com curiosidade de sobra para construir por conta própria.",
  avatarLabel: "Virar o avatar do RaioViajante",
  who: {
    heading: "Quem sou",
    paragraphs: [
      "Sou o Bryan. Na internet, sou também o RaioViajante, meu alter ego e uma forma de dar vida às coisas que passam pela minha cabeça.",
      "Gosto de criar coisas. Programo, desenho, escrevo e começo projetos que nem sempre sei onde vão terminar. Sou curioso demais para me prender a uma coisa só, e boa parte do que faço começa simplesmente porque tive vontade de tentar.",
      "Nem tudo que faço precisa ter uma finalidade. Algumas coisas existem porque achei bonitas, outras porque queria aprender, e algumas porque precisava colocar algum sentimento em algum lugar.",
      "Este site é um pouco de tudo isso. Um espaço para guardar minhas ideias, projetos, desenhos, pensamentos e tudo mais que eu encontrar pelo caminho. Ainda estou descobrindo muita coisa, e provavelmente sempre vou estar.",
    ],
  },
  work: {
    heading: "O que eu faço",
    lead: "Gosto de transformar ideias em coisas que existem, mesmo quando começo sem saber exatamente como.",
    rows: [
      {
        name: "Design de interfaces",
        note: "ideias, protótipos, experiências",
      },
      { name: "Front-end", note: "sites, interações, pequenos detalhes" },
      { name: "Back-end", note: "APIs, dados, regras de negócio" },
      {
        name: "Desenho e identidade",
        note: "personagens, ilustrações, stickers",
        to: "gallery",
      },
      {
        name: "Experimentos",
        note: "ferramentas, linguagens, ideias inacabadas",
        to: "lab",
      },
      {
        name: "Escrita",
        note: "descobertas, pensamentos, registros",
        to: "dump",
      },
    ],
  },
  writing: {
    heading: "O que escrevi sobre aprender",
    lead: "Do dump, onde anoto o que descubro enquanto construo.",
    posts: [
      {
        title: "Não existe printf aqui embaixo",
        note: "osdev",
        path: "/pt/posts/nao-existe-printf-aqui-embaixo",
      },
      {
        title:
          "Comecei a projetar uma linguagem antes de conseguir compilar uma",
        note: "compiladores",
        path: "/pt/posts/comecei-a-projetar-uma-linguagem-antes-de-conseguir-compilar-uma",
      },
      {
        title: "Meus cards de projeto estavam se adiantando aos meus projetos",
        note: "honestidade",
        path: "/pt/posts/meus-cards-de-projeto-estavam-se-adiantando-aos-meus-projetos",
      },
    ],
  },
  places: {
    heading: "Quatro lugares",
    lead: "Meu site pessoal estava tentando ser página inicial, caderno, site de documentação e laboratório ao mesmo tempo, então dividi.",
    notes: {
      root: "início e projetos",
      dump: "caderno",
      docs: "documentação",
      lab: "experimentos",
    },
  },
  now: { heading: "Agora", projects: aboutNow },
  tools: {
    heading: "Ferramentas",
    lead: "As ferramentas que uso para programar, desenhar, escrever, experimentar e organizar minhas ideias. Algumas fazem parte do meu dia a dia; outras aparecem quando um projeto precisa delas.",
    groups: toolsUnder([
      "Linguagens",
      "Front-end",
      "Back-end",
      "Banco de dados",
      "Testes",
      "Código e CI",
      "Infra e deploy",
      "Editores e terminal",
      "IA e agentes",
      "Design e desenho",
      "Ideias e anotações",
      "Inspiração",
      "Vídeo e animação",
      "Sistemas",
    ]),
    setupQuestion: "Curioso pelo resto do meu setup?",
    setupLink: "Ver o setup",
  },
  away: {
    heading: "Longe da tela",
    paragraphs: [
      "Fora do código, gosto de tocar violão, ler e assistir a filmes que ficam na cabeça por dias.",
      "E gosto muito de música. Daquelas que você escuta sozinho, volta anos depois e percebe que alguma coisa mudou. Tenho álbuns que significam muito para mim, mesmo quando não consigo explicar exatamente o motivo. Foi daí que nasceu o Refrain: um lugar para guardar esses álbuns e o que eles me lembram.",
      "Também desenho, quase sempre sem motivo nenhum além de querer. Parte disso foi parar na galeria.",
    ],
    rows: [
      { name: "Refrain", note: "diário musical", to: "refrain" },
      { name: "Galeria", note: "desenhos e personagens", to: "gallery" },
    ],
  },
  invite: {
    heading: "Tem um projeto em mente?",
    line: "Me conta o que você está construindo.",
    action: "Fale comigo",
  },
  englishNote: " (em inglês)",
};

export const ptContact: ContactCopy = {
  label: "contato",
  title: "Oi, aqui é o Bryan.",
  intro:
    "Se você chegou até aqui, provavelmente tem uma ideia, uma pergunta ou só vontade de conversar. Pode escrever. Projeto, música, um desenho, um texto do dump que te fez pensar em alguma coisa, tudo vale.",
  status: "Disponível para novos projetos",
  mail: {
    label: "e-mail",
    write: "Escrever um e-mail",
    copy: "Copiar endereço",
    copied: "Copiado",
    copyFailed: "Não deu para copiar. O endereço é {email}.",
    question: "Sobre o que você quer falar?",
    hint: "Escolhe um assunto, ou só escreve direto.",
    subjects: [
      {
        title: "Projeto novo",
        hint: "Conta o que é, pra quem é e pra quando.",
      },
      {
        title: "Freela",
        hint: "Fala do time, do que precisa e por quanto tempo.",
      },
      {
        title: "Colaboração",
        hint: "Me conta a ideia, mesmo que ainda esteja meio solta.",
      },
      {
        title: "Música",
        hint: "Me indica um álbum e conta por que ele importa.",
      },
      {
        title: "Desenho",
        hint: "Manda o que você desenha, ou o que quer que eu desenhe.",
      },
      {
        title: "Um texto",
        hint: "Qual post do dump? Discordar também vale.",
      },
      { title: "Só um oi", hint: "Oi. Só isso já é ótimo." },
    ],
    note: "Respondo em até 3 dias úteis.",
  },
  offers: {
    heading: "Coisas que topo fazer",
    lead: "Gosto de fazer tudo. Cada projeto é uma aventura nova, e se for algo que eu nunca fiz, eu aprendo fazendo.",
    subject: "Projeto: ",
    action: "escrever sobre isso",
    items: [
      {
        title: "Desenvolvimento",
        description: "Sites, apps e APIs, do protótipo ao deploy.",
      },
      {
        title: "Interfaces",
        description:
          "Fluxos, protótipos e os detalhes pequenos que fazem diferença.",
      },
      {
        title: "Design e identidade",
        description: "Marcas, personagens e sistemas visuais.",
      },
      {
        title: "Ilustrações",
        description: "Personagens, stickers, capas. Quase sempre no Procreate.",
      },
      {
        title: "Experimentos",
        description: "Ferramentas e linguagens que ainda não sabem o que são.",
      },
      {
        title: "Ideias criativas",
        description:
          "Projetos meio estranhos e colaborações sem formato definido.",
      },
    ],
  },
  pitch: {
    heading: "Se quiser propor algo",
    lead: "Não precisa de briefing formal. Escreve do jeito que você falaria. Isso aqui ajuda:",
    items: [
      "O que você está construindo, e para quem.",
      "Do que você precisa: design, desenvolvimento ou os dois.",
      "Quando gostaria de começar, e se há algum prazo.",
      "Uma faixa de orçamento, se você já tiver uma.",
      "Links do que já existe: um site, um arquivo, um rascunho.",
    ],
    exampleLabel: "uma primeira mensagem pode ser simples assim",
    example:
      "Oi, Bryan! Tenho uma lojinha de cerâmica e queria um site simples, com as peças e um jeito de encomendar. Ainda não tenho logo. Queria lançar antes de março. O orçamento é curto, mas dá pra conversar. Segue o Instagram da loja: …",
    nextLabel: "O que acontece depois",
    steps: [
      "Respondo em até 3 dias úteis, às vezes com umas perguntas.",
      "A gente conversa, por e-mail ou numa chamada, o que for mais fácil pra você.",
      "Mando uma proposta com escopo, prazo e valor. Se fizer sentido pros dois, a gente começa.",
    ],
  },
  free: {
    heading: "Não precisa ser trabalho",
    lead: "Também gosto de receber mensagem que não tem nada a ver com projeto.",
    items: [
      {
        title: "Música",
        description: "Me indica um álbum que mudou alguma coisa pra você.",
        subject: "Um álbum pra você",
      },
      {
        title: "Desenho",
        description: "Me mostra o que você desenha.",
        subject: "Desenho",
      },
      {
        title: "Textos",
        description: "Leu algo no dump e quer responder?",
        subject: "Sobre um texto do dump",
      },
      {
        title: "Qualquer coisa",
        description: "Uma pergunta, uma ideia, ou só um oi.",
        subject: "Oi",
      },
    ],
  },
  elsewhere: {
    heading: "Onde mais me encontrar",
    social: "Redes",
    ecosystem: "O ecossistema RaioViajante",
    feed: "feed do dump",
  },
  bye: "Valeu por passar aqui.",
  sticky: "Me escreve",
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
    sheetTitle: "Adesivos do RaioViajante",
    sheetCount: "{n} adesivos",
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
  site: "Este é o ponto de partida para os sites do RaioViajante. Ele reúne meus projetos, textos recentes, ilustrações e informações de contato em um só lugar. Os textos ficam no Dump, a documentação no Docs e os experimentos no Lab. Cada um tem seu próprio site e propósito, e os quatro compartilham o mesmo design, a mesma fonte e o mesmo som opcional.",
  builtTitle: "Como é construído",
  builtItems: [
    "Next.js, React e TypeScript no próprio site",
    "CSS para o layout, a tipografia e a identidade visual",
    "Ilustrações originais para o personagem e a galeria",
    "O feed RSS público do Dump para mostrar os últimos textos na página inicial",
    "Som opcional, com a preferência salva no seu navegador",
  ],
  /** Dump, Docs and Lab, in the English page's order. */
  otherSites: [
    {
      id: "dump",
      title: "Dump",
      link: ptDumpHome,
      holds: "reúne meus textos, em inglês e português.",
      built: [
        "Next.js, React e TypeScript, como este site",
        "Posts escritos como arquivos MDX no repositório",
        "Arquivo, tags e feed RSS em cada idioma",
        "Comentários pelo giscus, que os guarda no GitHub Discussions",
      ],
    },
    {
      id: "docs",
      title: "Docs",
      link: ptDocsHome,
      holds: "reúne a documentação técnica dos meus projetos.",
      built: [
        "Astro, que transforma os componentes compartilhados em páginas estáticas",
        "Páginas de projeto escritas a partir do código-fonte de cada projeto, não do README",
        "Duas páginas sobre estes próprios sites: a linguagem de design e as convenções do repositório",
      ],
    },
    {
      id: "lab",
      title: "Lab",
      link: ptLabHome,
      holds: "reúne experimentos interativos e curiosidades técnicas.",
      built: [
        "Astro, com pequenos scripts em TypeScript para cada experimento",
        "Cada experimento indica o projeto e a revisão de onde vem, ou avisa que foi escrito para o Lab como modelo didático",
        "Um rótulo diz se ele roda no seu navegador, se é simulado ou se mostra só o código-fonte",
      ],
    },
  ] satisfies readonly OtherSite[],
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
  tablet: "tablet",
  stylus: "caneta",
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

/** The Quadra case page. */
export const ptQuadraCopy: QuadraCopy = {
  kicker: "PROJETO ACADÊMICO · CASE 02",
  title: "Quadra",
  intro:
    "Um sistema de eventos e reserva de espaços para uma faculdade, feito por duas pessoas como projeto acadêmico e reimaginado aqui como um produto fictício. Os grupos pedem um espaço por data e período, a equipe de eventos aprova ou recusa, e tudo aparece num calendário só.",
  credit: { with: "Feito com", profile: "LinkedIn" },
  note: "Quadra e Valemont Institute são fictícios. A instituição do projeto original não é citada, e todas as pessoas, grupos e números da demo são inventados. O que vai além do sistema original aparece como conceito.",
  demo: {
    open: "Abrir a demo",
    hint: "Abre sobre esta página · cerca de 20 telas · Esc para fechar",
    label: "Demo Quadra",
    newTab: "Nova aba",
    close: "Fechar a demo",
    loading: "Carregando a demo…",
  },
  facts: [
    { term: "Ano", value: "2025", wide: false },
    { term: "Tipo", value: "Projeto acadêmico, duas pessoas", wide: false },
    {
      term: "Meu papel",
      value: "UI/UX design, front-end e desenvolvimento full-stack",
      wide: true,
    },
    {
      term: "Com",
      value: "Rafael: back-end, qualidade de software e integração contínua",
      wide: true,
    },
    {
      term: "Demo",
      value:
        "Cerca de 20 telas, só front-end. Os dados são fictícios e ficam no seu navegador.",
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
    shotAlt: "Quadra · {title} · {device}",
    groups: {
      access: "Acesso",
      overview: "Visão geral",
      calendar: "Calendário",
      reservations: "Reservas",
      requests: "Solicitações",
      events: "Eventos",
      spaces: "Espaços",
      people: "Pessoas",
      analytics: "Análises",
      admin: "Admin",
      public: "Público",
    },
    captions: {
      desktop: {
        login: {
          title: "Entrar",
          caption:
            "Uma conta de demonstração preenche o formulário. As linhas de quadra ao lado são a arte da marca, e o cartão mostra a semana da Quadra A.",
        },
        dashboard: {
          title: "Visão geral",
          caption:
            "O que precisa de decisão, quanto cada espaço está ocupado na semana e os períodos de hoje, numa tela só.",
        },
        calendar: {
          title: "Calendário",
          caption:
            "Todos os eventos numa grade de seis períodos por dia. Pedidos ainda em análise aparecem hachurados, e as aulas podem ser escondidas.",
        },
        drawer: {
          title: "Detalhes do evento",
          caption:
            "O evento abre ao lado do calendário, com horário, espaço, organizador e vagas.",
        },
        reserve: {
          title: "Pedindo um espaço",
          caption:
            "Escolha períodos livres na semana de um espaço e o formulário abre ao lado da grade.",
        },
        sent: {
          title: "Pedido enviado",
          caption:
            "O pedido mostra as etapas e fica marcado como seu na grade até alguém decidir.",
        },
        requests: {
          title: "Dois pedidos, um período",
          caption:
            "Quando dois grupos pedem o mesmo período, os pedidos aparecem lado a lado. Aprovar um recusa o outro, com uma nota explicando o motivo.",
        },
        event: {
          title: "Página do evento",
          caption:
            "A reserva, o histórico de aprovação, quem se inscreveu e os detalhes, numa página só.",
        },
        new: {
          title: "Novo evento",
          caption:
            "Seis passos curtos. Só dá para escolher espaços livres em todos os períodos marcados.",
        },
        spaces: {
          title: "Espaços",
          caption:
            "Cada espaço com a capacidade, a ocupação da semana e o que vem a seguir.",
        },
        space: {
          title: "A semana de um espaço",
          caption: "Clicar num período leva direto para a reserva.",
        },
        checkin: {
          title: "Check-in",
          caption:
            "A presença é marcada pela lista ou por uma leitura de ingresso simulada. Nenhuma câmera é usada.",
        },
        analytics: {
          title: "Análises",
          caption:
            "Quando os espaços ficam mais cheios, inscritos contra presentes e quais grupos usam quais espaços. Todos os números são da demo.",
        },
        users: {
          title: "Usuários e papéis",
          caption:
            "O que a pessoa é e o que ela pode fazer ficam separados. Ninguém muda o próprio papel.",
        },
        notes: {
          title: "Notificações",
          caption:
            "Pedidos, decisões e mudanças, agrupados por dia, cada um levando ao que se refere.",
        },
        agenda: {
          title: "Agenda pública",
          caption:
            "O que os visitantes veem sem entrar: um evento em destaque, filtros e uma lista por dia.",
        },
        pubevent: {
          title: "Página pública do evento",
          caption: "A inscrição é simulada e só muda esta página.",
        },
      },
      mobile: {
        login: {
          title: "Entrar",
          caption: "No celular, a arte da quadra vira um cabeçalho curto.",
        },
        dashboard: {
          title: "Visão geral",
          caption:
            "Os cartões empilham, e as duas ações principais ficam no topo.",
        },
        calendar: {
          title: "Calendário",
          caption: "A semana vira uma lista por dia.",
        },
        reserve: {
          title: "Reservas",
          caption: "Um dia por vez, com uma faixa de dias para trocar.",
        },
        requests: {
          title: "Solicitações",
          caption:
            "O pedido concorrente fica logo abaixo do que está sendo lido.",
        },
        checkin: {
          title: "Check-in",
          caption: "Linhas grandes e um botão por pessoa.",
        },
        analytics: {
          title: "Análises",
          caption: "Os gráficos viram uma coluna só.",
        },
        agenda: {
          title: "Agenda pública",
          caption: "A agenda mantém a tipografia grande no celular.",
        },
        pubevent: {
          title: "Evento público",
          caption:
            "Data, horário, local e o botão de inscrição, na ordem de leitura.",
        },
      },
    },
  },
  brief: {
    heading: "O desafio",
    lead: "Uma faculdade precisava de um lugar só para os seus eventos e para os espaços compartilhados onde eles acontecem. Cursos, grupos e atléticas reservam as mesmas quadras e salas, muitas vezes para a mesma noite. O sistema precisava:",
    items: [
      "deixar um grupo pedir um espaço numa data e período;",
      "dar à equipe de eventos um jeito claro de aprovar ou recusar cada pedido;",
      "mostrar todas as reservas num calendário só, sem reserva dupla;",
      "separar quem a pessoa é do que ela tem permissão para fazer.",
    ],
    note: "A instituição real não é citada neste case. Nomes, grupos, espaços e números da demo foram inventados para ele.",
  },
  goals: {
    heading: "Decisões de design",
    items: [
      "Uma grade de horários em todo lugar: seis períodos fixos por dia, iguais em todos os espaços, para que as reservas nunca se sobreponham por alguns minutos.",
      "Toda reserva é um pedido, e todo pedido termina numa resposta que quem pediu consegue ler.",
      "Mostrar o conflito antes da decisão, não depois.",
      "Separar tipo e papel: um aluno pode ser administrador e um professor pode ser usuário comum.",
      "Dar aos visitantes uma página própria. A agenda pública não pede conta.",
    ],
  },
  done: {
    heading: "Meu papel",
    lead: "O projeto foi feito em equipe, com front-end, back-end e qualidade divididos entre nós dois.",
    groups: [
      {
        title: "Eu · UI/UX design e desenvolvimento full-stack",
        items: [
          "Levantamento e interpretação dos requisitos.",
          "Prototipagem e planejamento das interfaces.",
          "Design de UI/UX e a experiência do usuário.",
          "Responsabilidade principal pelo desenvolvimento do front-end.",
          "Funcionalidades e regras de negócio no back-end.",
          "Integração com o banco de dados.",
          "Integração entre front-end e back-end.",
          "Testes, depuração e correção de bugs.",
          "Participação na arquitetura e na evolução do sistema.",
        ],
      },
      {
        title: "Rafael · desenvolvimento back-end e qualidade de software",
        items: [
          "Responsabilidade principal pelo back-end.",
          "Funcionalidades e regras de negócio.",
          "Integração com o banco de dados.",
          "Desenvolvimento e execução de testes, QA e validação das funcionalidades.",
          "Investigação e correção de bugs.",
          "Workflows no GitHub Actions, automação de testes e integração contínua.",
          "Colaboração na integração entre front-end e back-end.",
        ],
      },
      {
        title: "Juntos",
        items: [
          "Nós dois participamos do planejamento, das decisões técnicas, das funcionalidades, das regras de negócio, do banco de dados e da resolução de problemas.",
          "A divisão mostra onde cada um teve mais responsabilidade, não quem fez algo sozinho.",
        ],
      },
    ],
  },
  brand: {
    heading: "A identidade",
    lead: "Quadra é uma marca criada para este case. O nome vem da quadra esportiva, e a identidade sai de duas coisas em que o sistema se apoia: a quadra e a grade do calendário.",
    cover:
      "O símbolo é uma semana em quatro células: três reservadas, uma livre. Azul quadra, preto e lima sobre giz, com Schibsted Grotesk e Geist Mono.",
    coverAlt:
      "Identidade Quadra: o símbolo 2×2, o logotipo, quatro cores, a tipografia e os cinco estados da célula",
    boards: {
      slots: {
        title: "A célula",
        spec: "Uma célula pequena leva o estado de cada período por todas as telas",
      },
      spaces: {
        title: "Plantas dos espaços",
        spec: "Cada espaço é desenhado como uma planta em linha, no lugar de uma foto",
      },
      covers: {
        title: "Capas por categoria",
        spec: "Um padrão para cada tipo de evento",
      },
    },
  },
  tech: {
    heading: "Engenharia",
    lead: "As cinco primeiras linhas são do sistema original. A demo deste case é uma versão separada, só de front-end, feita para o portfólio, sem servidor e sem contas reais.",
    rows: [
      {
        term: "Sistema original",
        value:
          "PHP 8.3, Laravel 11, TypeScript, React e Tailwind CSS · API REST · MVC",
      },
      {
        term: "Banco de dados",
        value: "MySQL 8.4, Eloquent ORM, migrations, seeders e transactions",
      },
      {
        term: "Testes e CI",
        value:
          "Pest, PHPUnit, Playwright, PHPStan, Laravel Pint, GitHub Actions e Docker",
      },
      {
        term: "Segurança e autenticação",
        value:
          "Laravel Sanctum, controle de acesso por papel (RBAC), verificação em duas etapas (2FA), proteção contra CSRF, rate limiting e hash de senhas",
      },
      {
        term: "Deploy e infraestrutura",
        value:
          "Docker, Docker Compose, Nginx, GitHub Actions (CI/CD), AWS EC2, AWS RDS (MySQL), Amazon S3, Cloudflare (DNS/CDN) e HTTPS/TLS",
      },
      {
        term: "Demo",
        value: "HTML, CSS e JavaScript, sem build e sem dependências",
      },
      {
        term: "Dados da demo",
        value:
          "Gerados a partir de uma semente fixa, então toda visita abre na mesma semana",
      },
      {
        term: "Estado da demo",
        value:
          "Cada ação fica numa lista curta na página aberta e é refeita sobre os dados fixos. Recarregar ou um botão recomeça; nada fica guardado no navegador.",
      },
      {
        term: "Tipografia e ícones",
        value: "Schibsted Grotesk, Geist Mono e Tabler Icons",
      },
    ],
  },
  reimagined: {
    heading: "Reimaginação",
    lead: "A Quadra mantém o núcleo do sistema original e acrescenta ideias que viriam a seguir. Neste case, as duas coisas ficam separadas:",
    original: {
      title: "Do sistema original",
      items: [
        "eventos e os espaços que eles usam;",
        "reserva por data e período, incluindo os períodos da noite;",
        "pedidos que aguardam aprovação;",
        "tipos de usuário e papéis.",
      ],
    },
    concepts: {
      title: "Conceitos para o portfólio",
      items: [
        "a identidade Quadra e o design de todas as telas;",
        "a visão lado a lado de pedidos concorrentes;",
        "check-in com leitura de ingresso simulada;",
        "análises feitas com dados da demo;",
        "inscrição e lista de espera na agenda pública.",
      ],
    },
  },
  result: {
    heading: "O que a demo mostra",
    lead: "O case acompanha o sistema pelos dois lados: quem pede um espaço e quem decide. Na demo dá para:",
    items: [
      "pedir um período e acompanhar até a decisão;",
      "aprovar um de dois pedidos concorrentes e ver o calendário atualizar;",
      "criar um evento em seis passos;",
      "navegar pela agenda pública e se inscrever num evento.",
    ],
  },
  cta: "Tem um projeto assim? Escreva para",
  backAll: "Voltar para projetos",
};
