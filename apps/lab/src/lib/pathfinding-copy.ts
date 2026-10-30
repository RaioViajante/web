import type { LocaleId } from "../../../../site/locales.ts";
import type { PluralForms } from "./plural-core.ts";
import type { Algorithm, SearchStatus, SizeName } from "./pathfinding.ts";

// Strings of the pathfinding playground, one complete catalog per registry
// locale. The page renders its locale's strings at build time (`data-copy`) and
// the plain TypeScript script only fills `{placeholders}`. Algorithm names
// (BFS, DFS, Dijkstra, A*) are technical identifiers and read the same in both.

export type Tool = "start" | "goal" | "wall" | "mud" | "erase";
export type CellKind = "ground" | "wall" | "mud" | "start" | "goal";

export interface PathfindingCopy {
  caption: string;
  toolsBand: string;
  toolsAria: string;
  tools: Record<Tool, string>;
  /** `{tool}`. */
  toolSelected: string;
  algorithmBand: string;
  algorithmAria: string;
  algorithmNames: Record<Algorithm, string>;
  /** One line under the chosen algorithm: what it guarantees. */
  algorithmNotes: Record<Algorithm, string>;
  sizeLabel: string;
  sizes: Record<SizeName, string>;
  gridBand: string;
  /** Accessible name of the grid. */
  gridLabel: string;
  /** `{row}`, `{column}`, `{kind}`, `{state}`; the state may be empty. */
  cellLabel: string;
  kinds: Record<CellKind, string>;
  cellStates: {
    frontier: string;
    expanded: string;
    path: string;
    current: string;
  };
  keyboardHelp: string;
  touchHelp: string;
  marks: Record<CellKind | "frontier" | "expanded" | "path", string>;
  legend: Record<CellKind | "frontier" | "expanded" | "path", string>;
  controlsBand: string;
  step: string;
  run: string;
  pause: string;
  resetSearch: string;
  clear: string;
  generate: string;
  compare: string;
  speedLabel: string;
  /** `{count}` cells per second. */
  speedValue: PluralForms;
  reducedMotionNote: string;
  statsBand: string;
  stats: {
    status: string;
    explored: string;
    frontier: string;
    moves: string;
    cost: string;
  };
  statusNames: Record<SearchStatus | "idle", string>;
  /** Shown for moves and cost when there is no path. */
  none: string;
  cellsExplored: PluralForms;
  movesOnPath: PluralForms;
  messages: {
    ready: string;
    /** `{algorithm}`, `{explored}`: after the first step. */
    started: string;
    /** `{algorithm}`, `{moves}`, `{cost}`, `{explored}`. */
    found: string;
    /** `{algorithm}`, `{explored}`. */
    unreachable: string;
    /** `{algorithm}`. */
    algorithmChanged: string;
    searchReset: string;
    cleared: string;
    /** `{seed}`. */
    generated: string;
    /** `{size}`. */
    sizeChanged: string;
    /** `{kind}`, `{row}`, `{column}`. */
    painted: string;
    /** `{which}`, `{row}`, `{column}`. */
    placed: string;
    startName: string;
    goalName: string;
    rejectedWall: string;
    rejectedSame: string;
    rejectedOther: string;
    finished: string;
    unchanged: string;
    editResets: string;
    running: string;
    paused: string;
  };
  compareBand: string;
  compareCaption: string;
  compareHeaders: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  compareYes: string;
  compareNo: string;
  compareNa: string;
  compareNote: string;
  conceptsHeading: string;
  concepts: readonly { term: string; text: string }[];
  limitsHeading: string;
  limits: readonly string[];
  noscript: string;
}

export const pathfindingCopy = {
  en: {
    caption: "bench · runs in this browser",
    toolsBand: "Draw",
    toolsAria: "Drawing tool",
    tools: {
      start: "start",
      goal: "goal",
      wall: "wall",
      mud: "mud · weight 5",
      erase: "erase",
    },
    toolSelected: "Tool: {tool}.",
    algorithmBand: "Algorithm",
    algorithmAria: "Algorithm",
    algorithmNames: {
      bfs: "BFS",
      dfs: "DFS",
      dijkstra: "Dijkstra",
      astar: "A*",
    },
    algorithmNotes: {
      bfs: "Queue, oldest first. Fewest moves. Ignores weights, so it can walk through mud.",
      dfs: "Stack, newest first. Finds a path if one exists, with no promise it is short.",
      dijkstra:
        "Cheapest total weight first. Optimal with weights. Explores in every direction.",
      astar:
        "Dijkstra plus a Manhattan-distance guess. Optimal here and usually explores less.",
    },
    sizeLabel: "Grid size",
    sizes: { small: "12 × 8", medium: "20 × 12", large: "30 × 16" },
    gridBand: "Grid",
    gridLabel: "Pathfinding grid",
    cellLabel: "row {row}, column {column}: {kind}{state}",
    kinds: {
      ground: "open",
      wall: "wall",
      mud: "mud, weight 5",
      start: "start",
      goal: "goal",
    },
    cellStates: {
      frontier: ", waiting in the frontier",
      expanded: ", explored",
      path: ", on the path",
      current: ", just explored",
    },
    keyboardHelp:
      "Keyboard: arrow keys move between cells, Home and End jump along the row, Enter or Space applies the selected tool.",
    touchHelp:
      "Touch: tap a cell to apply the tool. Dragging scrolls the page, so draw lines with a mouse or the keyboard.",
    marks: {
      ground: "",
      wall: "#",
      mud: "~",
      start: "S",
      goal: "G",
      frontier: "f",
      expanded: "·",
      path: "*",
    },
    legend: {
      ground: "open ground",
      wall: "wall, cannot be entered",
      mud: "mud, entering it costs 5",
      start: "start",
      goal: "goal",
      frontier: "frontier: discovered, not explored yet",
      expanded: "explored",
      path: "final path",
    },
    controlsBand: "Run",
    step: "step",
    run: "run",
    pause: "pause",
    resetSearch: "reset search",
    clear: "clear grid",
    generate: "generate",
    compare: "compare all four",
    speedLabel: "Speed",
    speedValue: {
      one: "{count} cell per second",
      other: "{count} cells per second",
    },
    reducedMotionNote:
      "Reduced motion is on: run finishes at once instead of animating. Step still explores one cell.",
    statsBand: "Result",
    stats: {
      status: "Status",
      explored: "Explored",
      frontier: "Frontier",
      moves: "Path moves",
      cost: "Path cost",
    },
    statusNames: {
      idle: "not started",
      running: "searching",
      found: "path found",
      unreachable: "no path",
    },
    none: "—",
    cellsExplored: {
      one: "{count} cell explored",
      other: "{count} cells explored",
    },
    movesOnPath: { one: "{count} move", other: "{count} moves" },
    messages: {
      ready:
        "Draw walls, move the start and the goal, pick an algorithm, then step or run.",
      started: "{algorithm} started. {explored}.",
      found:
        "{algorithm} found a path: {moves}, total weight {cost}. {explored}.",
      unreachable:
        "{algorithm} found no path. {explored}; every reachable cell was tried.",
      algorithmChanged: "{algorithm} selected. The search was reset.",
      searchReset: "Search reset. The grid is unchanged.",
      cleared: "Grid cleared. The start and the goal stay where they are.",
      generated: "Random grid {seed}. Some seeds have no path.",
      sizeChanged: "Grid size {size}. The grid was cleared.",
      painted: "{kind} at row {row}, column {column}.",
      placed: "{which} moved to row {row}, column {column}.",
      startName: "Start",
      goalName: "Goal",
      rejectedWall: "A wall cannot hold the start or the goal.",
      rejectedSame: "The start and the goal need different cells.",
      rejectedOther: "That cell cannot be changed.",
      finished: "The search is over. Reset it to run again.",
      unchanged: "Nothing changed: that cell already is {kind}.",
      editResets: "Editing the grid reset the search.",
      running: "Running.",
      paused: "Paused.",
    },
    compareBand: "Comparison",
    compareCaption: "All four algorithms on the current grid",
    compareHeaders: [
      "algorithm",
      "result",
      "explored",
      "moves",
      "weight",
      "fewest moves",
      "lowest weight",
    ],
    compareYes: "yes",
    compareNo: "no",
    compareNa: "—",
    compareNote:
      "Fewest moves: no path has fewer moves. Lowest weight: no path costs less. Without mud they are the same thing. Explored counts cells, not time.",
    conceptsHeading: "What to watch",
    concepts: [
      {
        term: "frontier and explored",
        text: "The frontier (f) holds cells that were discovered but not explored. Exploring a cell moves it to the explored set (·) and adds its new neighbors to the frontier. The algorithms differ only in which frontier cell they take next.",
      },
      {
        term: "BFS",
        text: "Takes the oldest frontier cell, so it grows in rings. With every move costing the same, the first path it finds has the fewest moves. It does not look at mud: draw a mud strip across the shortest route and it goes straight through.",
      },
      {
        term: "DFS",
        text: "Takes the newest frontier cell, so it commits to one direction until it hits a dead end. It finds a path whenever one exists, but not the shortest: on an empty grid it often wanders. Compare its path length with BFS.",
      },
      {
        term: "weighted and unweighted",
        text: "Unweighted algorithms count moves. Weighted ones add up the cost of the cells entered. With mud, the fewest moves and the lowest cost can be different paths, and only Dijkstra and A* optimize the second.",
      },
      {
        term: "Dijkstra",
        text: "Always explores the cell with the lowest total cost so far, which is why the first time it reaches the goal the cost is minimal. It has no idea where the goal is, so it spreads in every direction.",
      },
      {
        term: "A*",
        text: "Adds a guess of the remaining distance (Manhattan distance, never more than the true cost here because every cell costs at least 1). That keeps the result optimal while steering the search toward the goal. Press compare to see it explore fewer cells.",
      },
      {
        term: "tie-breaking",
        text: "Neighbors are tried in the order up, right, down, left. Equal priorities go to the entry queued first; A* first prefers the cell closer to the goal. This is why the same grid always gives the same search.",
      },
    ],
    limitsHeading: "Limits",
    limits: [
      "Movement is up, right, down and left only. There are no diagonals.",
      "Mud is the only weight, fixed at 5. Entering a cell costs its weight; the start cell is never charged.",
      "Grids hold at most 30 × 16 cells, and a search or a comparison finishes quickly on them.",
      "Explored counts are not timings. Real performance depends on the data structures, which this page keeps deliberately simple.",
      "Generated grids are repeatable by seed but are not guaranteed to have a path.",
    ],
    noscript: "The grid needs JavaScript to draw and run searches.",
  },
  "pt-BR": {
    caption: "bancada · executa neste navegador",
    toolsBand: "Desenhar",
    toolsAria: "Ferramenta de desenho",
    tools: {
      start: "início",
      goal: "destino",
      wall: "parede",
      mud: "lama · peso 5",
      erase: "apagar",
    },
    toolSelected: "Ferramenta: {tool}.",
    algorithmBand: "Algoritmo",
    algorithmAria: "Algoritmo",
    algorithmNames: {
      bfs: "BFS",
      dfs: "DFS",
      dijkstra: "Dijkstra",
      astar: "A*",
    },
    algorithmNotes: {
      bfs: "Fila, o mais antigo primeiro. Menor número de passos. Ignora pesos, então pode atravessar a lama.",
      dfs: "Pilha, o mais novo primeiro. Acha um caminho se ele existir, sem prometer que seja curto.",
      dijkstra:
        "Menor peso total primeiro. Ótimo com pesos. Explora em todas as direções.",
      astar:
        "Dijkstra mais um palpite pela distância de Manhattan. Ótimo aqui e em geral explora menos.",
    },
    sizeLabel: "Tamanho da grade",
    sizes: { small: "12 × 8", medium: "20 × 12", large: "30 × 16" },
    gridBand: "Grade",
    gridLabel: "Grade de busca de caminhos",
    cellLabel: "linha {row}, coluna {column}: {kind}{state}",
    kinds: {
      ground: "livre",
      wall: "parede",
      mud: "lama, peso 5",
      start: "início",
      goal: "destino",
    },
    cellStates: {
      frontier: ", esperando na fronteira",
      expanded: ", explorada",
      path: ", no caminho",
      current: ", acabou de ser explorada",
    },
    keyboardHelp:
      "Teclado: as setas movem entre as células, Home e End vão ao início e ao fim da linha, Enter ou Espaço aplica a ferramenta escolhida.",
    touchHelp:
      "Toque: toque numa célula para aplicar a ferramenta. Arrastar rola a página, então trace linhas com o mouse ou o teclado.",
    marks: {
      ground: "",
      wall: "#",
      mud: "~",
      start: "I",
      goal: "D",
      frontier: "f",
      expanded: "·",
      path: "*",
    },
    legend: {
      ground: "terreno livre",
      wall: "parede, não pode ser atravessada",
      mud: "lama, entrar nela custa 5",
      start: "início",
      goal: "destino",
      frontier: "fronteira: descoberta, ainda não explorada",
      expanded: "explorada",
      path: "caminho final",
    },
    controlsBand: "Execução",
    step: "avançar",
    run: "executar",
    pause: "pausar",
    resetSearch: "reiniciar busca",
    clear: "limpar grade",
    generate: "gerar",
    compare: "comparar os quatro",
    speedLabel: "Velocidade",
    speedValue: {
      one: "{count} célula por segundo",
      other: "{count} células por segundo",
    },
    reducedMotionNote:
      "O movimento reduzido está ativo: executar termina de uma vez, sem animação. Avançar continua explorando uma célula.",
    statsBand: "Resultado",
    stats: {
      status: "Situação",
      explored: "Exploradas",
      frontier: "Fronteira",
      moves: "Passos do caminho",
      cost: "Custo do caminho",
    },
    statusNames: {
      idle: "não iniciada",
      running: "buscando",
      found: "caminho encontrado",
      unreachable: "sem caminho",
    },
    none: "—",
    cellsExplored: {
      one: "{count} célula explorada",
      other: "{count} células exploradas",
      none: "nenhuma célula explorada",
    },
    movesOnPath: {
      one: "{count} passo",
      other: "{count} passos",
      none: "nenhum passo",
    },
    messages: {
      ready:
        "Desenhe paredes, mova o início e o destino, escolha um algoritmo e depois avance ou execute.",
      started: "{algorithm} iniciado. {explored}.",
      found:
        "{algorithm} encontrou um caminho: {moves}, peso total {cost}. {explored}.",
      unreachable:
        "{algorithm} não encontrou caminho. {explored}; todas as células alcançáveis foram tentadas.",
      algorithmChanged: "{algorithm} selecionado. A busca foi reiniciada.",
      searchReset: "Busca reiniciada. A grade não mudou.",
      cleared: "Grade limpa. O início e o destino continuam onde estavam.",
      generated: "Grade aleatória {seed}. Algumas sementes não têm caminho.",
      sizeChanged: "Grade {size}. A grade foi limpa.",
      painted: "{kind} na linha {row}, coluna {column}.",
      placed: "{which} movido para a linha {row}, coluna {column}.",
      startName: "Início",
      goalName: "Destino",
      rejectedWall: "Uma parede não pode ocupar o início nem o destino.",
      rejectedSame: "O início e o destino precisam de células diferentes.",
      rejectedOther: "Essa célula não pode ser alterada.",
      finished: "A busca terminou. Reinicie-a para executar de novo.",
      unchanged: "Nada mudou: essa célula já é {kind}.",
      editResets: "Editar a grade reiniciou a busca.",
      running: "Executando.",
      paused: "Pausado.",
    },
    compareBand: "Comparação",
    compareCaption: "Os quatro algoritmos na grade atual",
    compareHeaders: [
      "algoritmo",
      "resultado",
      "exploradas",
      "passos",
      "peso",
      "menos passos",
      "menor peso",
    ],
    compareYes: "sim",
    compareNo: "não",
    compareNa: "—",
    compareNote:
      "Menos passos: nenhum caminho tem menos passos. Menor peso: nenhum caminho custa menos. Sem lama, é a mesma coisa. Exploradas conta células, não tempo.",
    conceptsHeading: "O que observar",
    concepts: [
      {
        term: "fronteira e exploradas",
        text: "A fronteira (f) guarda as células descobertas e ainda não exploradas. Explorar uma célula a move para as exploradas (·) e põe os vizinhos novos na fronteira. Os algoritmos só diferem em qual célula da fronteira escolhem em seguida.",
      },
      {
        term: "BFS",
        text: "Pega a célula mais antiga da fronteira, então cresce em anéis. Quando todo passo custa igual, o primeiro caminho que ele acha tem o menor número de passos. Ele não olha a lama: trace uma faixa de lama sobre a rota mais curta e ele passa direto.",
      },
      {
        term: "DFS",
        text: "Pega a célula mais nova da fronteira, então segue numa direção até bater num beco sem saída. Acha um caminho sempre que ele existe, mas não o mais curto: numa grade vazia, costuma dar voltas. Compare o tamanho do caminho com o do BFS.",
      },
      {
        term: "com e sem pesos",
        text: "Algoritmos sem pesos contam passos. Os com pesos somam o custo das células em que entram. Com lama, o menor número de passos e o menor custo podem ser caminhos diferentes, e só Dijkstra e A* otimizam o segundo.",
      },
      {
        term: "Dijkstra",
        text: "Explora sempre a célula de menor custo total até agora, e por isso a primeira vez que chega ao destino o custo é mínimo. Ele não sabe onde o destino está, então se espalha em todas as direções.",
      },
      {
        term: "A*",
        text: "Soma um palpite da distância restante (distância de Manhattan, que aqui nunca passa do custo real porque toda célula custa ao menos 1). Isso mantém o resultado ótimo e empurra a busca para o destino. Use comparar para ver que ele explora menos células.",
      },
      {
        term: "critério de desempate",
        text: "Os vizinhos são tentados na ordem cima, direita, baixo, esquerda. Prioridades iguais vão para a entrada que entrou primeiro; o A* prefere antes a célula mais perto do destino. Por isso a mesma grade sempre dá a mesma busca.",
      },
    ],
    limitsHeading: "Limites",
    limits: [
      "O movimento é só para cima, direita, baixo e esquerda. Não há diagonais.",
      "A lama é o único peso, fixo em 5. Entrar numa célula custa o peso dela; a célula de início nunca é cobrada.",
      "As grades têm no máximo 30 × 16 células, e uma busca ou uma comparação termina rápido nelas.",
      "Células exploradas não são tempo de execução. O desempenho real depende das estruturas de dados, que esta página mantém propositalmente simples.",
      "As grades geradas se repetem pela semente, mas não há garantia de que tenham caminho.",
    ],
    noscript: "A grade precisa de JavaScript para desenhar e executar buscas.",
  },
} satisfies Record<LocaleId, PathfindingCopy>;
