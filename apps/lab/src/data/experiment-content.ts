import type { LocaleId } from "../../../../site/locales.ts";
import type { ExperimentSurface } from "./experiments.ts";

// Per-locale prose that belongs to an experiment's surface rather than to its
// record: the fidelity rows and the related rows. Both tables are exhaustive
// over the surfaces and the registry locales, so a new surface or locale fails
// type checking until it is written.

export interface FidelityRow {
  label: string;
  value: string;
}

export interface RelatedRow {
  /** The visible name of the destination. */
  label: string;
  /** Language of `label` when it differs from the page, for example an English post title. */
  labelLanguage?: LocaleId;
  value: string;
  href: string;
  /**
   * Language of the destination page when it should be declared and said in
   * words; leave it out where the page never marked it (a source repository).
   */
  language?: LocaleId;
}

const learningNotes =
  "https://github.com/RaioViajante/x86-os-experiment/blob/e966889b56e613d92887338a1bc979674674a115/docs/01-boot-sector.md";

/**
 * Dump posts linked from either locale. The Portuguese printf row uses the
 * Portuguese post (`printfPt`); the English row names the English post.
 */
const dump = {
  printf: {
    label: "There Is No printf Down Here",
    labelLanguage: "en",
    value: "dump ↗",
    href: "https://dump.raioviajante.com/posts/there-is-no-printf-down-here",
    language: "en",
  },
} as const satisfies Record<string, RelatedRow>;

const printfPt = {
  label: "Não existe printf aqui embaixo",
  value: "dump ↗",
  href: "https://dump.raioviajante.com/pt/posts/nao-existe-printf-aqui-embaixo",
  language: "pt-BR",
} as const satisfies RelatedRow;

export const fidelityRows = {
  "filename-classifier": {
    en: [
      { label: "classification rules", value: "as documented in docs" },
      { label: "suffix behavior", value: "Python 3.14 Path.suffix" },
      { label: "file system access", value: "none · nothing moves" },
      { label: "conflict check, size", value: "not reproduced" },
    ],
    "pt-BR": [
      {
        label: "regras de classificação",
        value: "conforme documentadas no Docs",
      },
      { label: "comportamento da extensão", value: "Python 3.14 Path.suffix" },
      {
        label: "acesso ao sistema de arquivos",
        value: "nenhum · nada é movido",
      },
      {
        label: "verificação de conflitos e tamanho",
        value: "não reproduzidas",
      },
    ],
  },
  "execution-states": {
    en: [
      { label: "transition rules", value: "ported from orbit cd97666" },
      { label: "commands, scheduler", value: "none" },
      { label: "persistence", value: "none · reload starts over" },
      {
        label: "retry and timeout",
        value: "configuration only, not exercised",
      },
    ],
    "pt-BR": [
      { label: "regras de transição", value: "reproduzidas do Orbit cd97666" },
      { label: "comandos, agendador", value: "nenhum" },
      {
        label: "persistência",
        value: "nenhuma · recarregar a página recomeça do zero",
      },
      {
        label: "retry e timeout",
        value: "apenas configuração, não exercitados",
      },
    ],
  },
  "boot-sector": {
    en: [
      {
        label: "source",
        value: "real · revision e966889 · comments omitted",
      },
      { label: "execution", value: "none · not booted, not emulated" },
      { label: "result", value: "documented in project notes" },
    ],
    "pt-BR": [
      {
        label: "código-fonte",
        value: "real · revisão e966889 · comentários omitidos",
      },
      { label: "execução", value: "nenhuma · sem boot e sem emulação" },
      { label: "resultado", value: "documentado nas anotações do projeto" },
    ],
  },
  "scheduler-simulator": {
    en: [
      { label: "model", value: "teaching simulation · integer clock" },
      { label: "orbit", value: "job settings only · no scheduler exists yet" },
      {
        label: "background work, persistence",
        value: "none · reload starts over",
      },
      { label: "randomness", value: "none · every run repeats" },
    ],
    "pt-BR": [
      { label: "modelo", value: "simulação didática · relógio de inteiros" },
      {
        label: "orbit",
        value: "apenas as configurações de job · ainda não há agendador",
      },
      {
        label: "trabalho em segundo plano, persistência",
        value: "nenhum · recarregar a página recomeça do zero",
      },
      { label: "aleatoriedade", value: "nenhuma · toda execução se repete" },
    ],
  },
  "pathfinding-playground": {
    en: [
      {
        label: "algorithms",
        value: "written for the Lab · not tied to a project",
      },
      { label: "tie-breaking", value: "fixed · every run repeats" },
      { label: "movement", value: "four directions · mud is the only weight" },
      { label: "persistence", value: "none · reload starts over" },
    ],
    "pt-BR": [
      {
        label: "algoritmos",
        value: "escritos para o Lab · sem ligação com um projeto",
      },
      {
        label: "desempate",
        value: "fixo · toda execução se repete",
      },
      {
        label: "movimento",
        value: "quatro direções · a lama é o único peso",
      },
      {
        label: "persistência",
        value: "nenhuma · recarregar a página recomeça do zero",
      },
    ],
  },
  "tiny-language-playground": {
    en: [
      {
        label: "syntax",
        value: "subset read from yanawa notes · revision 7fd082e",
      },
      { label: "yanawa compiler", value: "none exists yet · this is not it" },
      {
        label: "execution",
        value: "own tree-walking interpreter · bounded · no JavaScript eval",
      },
      { label: "persistence", value: "none · source stays in this tab" },
    ],
    "pt-BR": [
      {
        label: "sintaxe",
        value: "subconjunto lido das notas do yanawa · revisão 7fd082e",
      },
      {
        label: "compilador do yanawa",
        value: "ainda não existe · este não é ele",
      },
      {
        label: "execução",
        value: "interpretador próprio · limitado · sem eval de JavaScript",
      },
      {
        label: "persistência",
        value: "nenhuma · o código fica nesta aba",
      },
    ],
  },
  "image-compression-lab": {
    en: [
      {
        label: "encoding",
        value: "your browser’s own encoders · real, measured bytes",
      },
      {
        label: "mochifile",
        value: "inspiration only · its engine is not used",
      },
      { label: "upload, storage", value: "none · the image stays in this tab" },
      { label: "target sizes", value: "not offered · not guaranteeable" },
    ],
    "pt-BR": [
      {
        label: "codificação",
        value: "codificadores do seu navegador · bytes reais e medidos",
      },
      {
        label: "mochifile",
        value: "apenas inspiração · o motor dele não é usado",
      },
      {
        label: "envio, armazenamento",
        value: "nenhum · a imagem fica nesta aba",
      },
      {
        label: "tamanhos-alvo",
        value: "não oferecidos · não podem ser garantidos",
      },
    ],
  },
} as const satisfies Record<
  ExperimentSurface,
  Record<LocaleId, readonly FidelityRow[]>
>;

export const relatedRows = {
  "filename-classifier": {
    en: [
      {
        label: "Sweep · classification",
        value: "docs ↗",
        href: "https://docs.raioviajante.com/projects/sweep/#classification",
        language: "en",
      },
      {
        label: "Sweep source code",
        value: "github ↗",
        href: "https://github.com/RaioViajante/sweep",
      },
    ],
    "pt-BR": [
      {
        label: "Sweep · classificação",
        value: "docs ↗",
        href: "https://docs.raioviajante.com/pt/projetos/sweep/#classificação",
        language: "pt-BR",
      },
      // Both rows are the ones the published page has always listed.
      {
        label: "código-fonte do Sweep",
        value: "github ↗",
        href: "https://github.com/RaioViajante/sweep",
      },
    ],
  },
  "execution-states": {
    en: [
      {
        label: "Orbit source code",
        value: "github ↗",
        href: "https://github.com/RaioViajante/orbit",
      },
    ],
    "pt-BR": [
      {
        label: "código-fonte do Orbit",
        value: "github ↗",
        href: "https://github.com/RaioViajante/orbit",
      },
    ],
  },
  "boot-sector": {
    en: [
      dump.printf,
      {
        label: "learning notes",
        value: "github ↗",
        href: learningNotes,
        language: "en",
      },
    ],
    "pt-BR": [
      printfPt,
      {
        label: "anotações de aprendizado",
        value: "github ↗",
        href: learningNotes,
        language: "en",
      },
    ],
  },
  "scheduler-simulator": {
    en: [
      {
        label: "execution states",
        value: "lab · 002",
        href: "/experiments/execution-states/",
      },
      {
        label: "Orbit architecture notes",
        value: "github ↗",
        href: "https://github.com/RaioViajante/orbit/blob/2967494085ec5f66085e09ee9cc15c9d5be368e0/docs/architecture.md",
        language: "en",
      },
      {
        label: "Orbit source code",
        value: "github ↗",
        href: "https://github.com/RaioViajante/orbit",
      },
    ],
    "pt-BR": [
      {
        label: "estados de execução",
        value: "lab · 002",
        href: "/pt/experiments/estados-de-execucao/",
      },
      {
        label: "notas de arquitetura do Orbit",
        value: "github ↗",
        href: "https://github.com/RaioViajante/orbit/blob/2967494085ec5f66085e09ee9cc15c9d5be368e0/docs/architecture.md",
        language: "en",
      },
      {
        label: "código-fonte do Orbit",
        value: "github ↗",
        href: "https://github.com/RaioViajante/orbit",
      },
    ],
  },
  "pathfinding-playground": {
    en: [
      {
        label: "Dijkstra's algorithm",
        value: "wikipedia ↗",
        href: "https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm",
        language: "en",
      },
      {
        label: "A* search algorithm",
        value: "wikipedia ↗",
        href: "https://en.wikipedia.org/wiki/A*_search_algorithm",
        language: "en",
      },
    ],
    "pt-BR": [
      {
        label: "algoritmo de Dijkstra",
        value: "wikipedia ↗",
        href: "https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm",
        language: "en",
      },
      {
        label: "algoritmo A*",
        value: "wikipedia ↗",
        href: "https://en.wikipedia.org/wiki/A*_search_algorithm",
        language: "en",
      },
    ],
  },
  "tiny-language-playground": {
    en: [
      {
        label: "yanawa syntax notes",
        value: "github ↗",
        href: "https://github.com/yanawa/yanawa/blob/7fd082e806d55f293c81281f9acee1c02a683744/docs/syntax.md",
        language: "en",
      },
      {
        label: "yanawa compiler architecture notes",
        value: "github ↗",
        href: "https://github.com/yanawa/yanawa/blob/7fd082e806d55f293c81281f9acee1c02a683744/docs/compiler-architecture.md",
        language: "en",
      },
      {
        label: "yanawa repository",
        value: "github ↗",
        href: "https://github.com/yanawa/yanawa",
      },
    ],
    "pt-BR": [
      {
        label: "notas de sintaxe do yanawa",
        value: "github ↗",
        href: "https://github.com/yanawa/yanawa/blob/7fd082e806d55f293c81281f9acee1c02a683744/docs/syntax.md",
        language: "en",
      },
      {
        label: "notas de arquitetura do compilador do yanawa",
        value: "github ↗",
        href: "https://github.com/yanawa/yanawa/blob/7fd082e806d55f293c81281f9acee1c02a683744/docs/compiler-architecture.md",
        language: "en",
      },
      {
        label: "repositório do yanawa",
        value: "github ↗",
        href: "https://github.com/yanawa/yanawa",
      },
    ],
  },
  "image-compression-lab": {
    en: [
      {
        label: "Mochifile · image engine notes",
        value: "github ↗",
        href: "https://github.com/mochifile/mochifile/blob/f674bf16f7ffee4ad8094bf079567ccf1bc001c2/docs/adr/0016-image-engine-jsquash-with-native-decoding.md",
        language: "en",
      },
      {
        label: "Mochifile · size-targeting notes",
        value: "github ↗",
        href: "https://github.com/mochifile/mochifile/blob/f674bf16f7ffee4ad8094bf079567ccf1bc001c2/docs/adr/0017-size-targeting-algorithm.md",
        language: "en",
      },
      {
        label: "Mochifile source code",
        value: "github ↗",
        href: "https://github.com/mochifile/mochifile",
      },
    ],
    "pt-BR": [
      {
        label: "Mochifile · notas do motor de imagens",
        value: "github ↗",
        href: "https://github.com/mochifile/mochifile/blob/f674bf16f7ffee4ad8094bf079567ccf1bc001c2/docs/adr/0016-image-engine-jsquash-with-native-decoding.md",
        language: "en",
      },
      {
        label: "Mochifile · notas sobre tamanho-alvo",
        value: "github ↗",
        href: "https://github.com/mochifile/mochifile/blob/f674bf16f7ffee4ad8094bf079567ccf1bc001c2/docs/adr/0017-size-targeting-algorithm.md",
        language: "en",
      },
      {
        label: "código-fonte do Mochifile",
        value: "github ↗",
        href: "https://github.com/mochifile/mochifile",
      },
    ],
  },
} as const satisfies Record<
  ExperimentSurface,
  Record<LocaleId, readonly RelatedRow[]>
>;
