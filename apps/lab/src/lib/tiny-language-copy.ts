import type { LocaleId } from "../../../../site/locales.ts";
import type { ExampleId } from "./tiny-language-examples.ts";
import type { DiagnosticCode, Stage, TokenType } from "./tiny-language.ts";
import type { PluralForms } from "./plural-core.ts";

// Strings of the tiny language playground, one complete catalog per registry
// locale. The language itself (keywords, token types, type names, code) is
// technical vocabulary and is shown the same on both pages; the words around it
// are translated. Diagnostics are worded here from a code and arguments.

export type ContextKey =
  | "function-name"
  | "parameters"
  | "function-body"
  | "condition"
  | "else"
  | "loop-variable"
  | "range-bounds"
  | "range"
  | "arguments"
  | "parenthesis"
  | "parameter-name"
  | "let"
  | "const";
export type NameKey =
  "variable" | "function" | "parameter" | "type" | "loop-variable";
export type Panel = "tokens" | "tree" | "run";

export interface TinyLanguageCopy {
  caption: string;
  examplesBand: string;
  examplesAria: string;
  examples: Record<ExampleId, { name: string; hint: string }>;
  sourceBand: string;
  sourceLabel: string;
  sourceHelp: string;
  /** `{count}` and `{max}`, already formatted for the locale. */
  characters: string;
  problemsBand: string;
  noProblems: string;
  /** `{count}` problems. */
  problems: PluralForms;
  severityError: string;
  /** `{line}` and `{column}`. */
  position: string;
  panelsBand: string;
  panelsAria: string;
  panels: Record<Panel, string>;
  previous: string;
  next: string;
  /** Description of the stage shown, one per panel. */
  panelHelp: Record<Panel, string>;
  tokenHeaders: readonly [string, string, string, string];
  /** `{count}` tokens. */
  tokenCount: PluralForms;
  /** `{shown}` of `{total}`. */
  tokensShown: string;
  treeEmpty: string;
  treeBlocked: string;
  run: string;
  step: string;
  resetRun: string;
  runBlocked: string;
  /** `{line}`: the trace's line column. */
  traceHeaders: readonly [string, string, string];
  traceKinds: Record<string, string>;
  outputLabel: string;
  outputEmpty: string;
  traceLabel: string;
  /** `{count}` evaluation steps. */
  steps: PluralForms;
  /** `{count}` output lines. */
  outputLines: PluralForms;
  messages: {
    ready: string;
    exampleLoaded: string;
    /** `{problems}`. */
    analyzed: string;
    analyzedClean: string;
    /** `{output}` and `{steps}`. */
    ran: string;
    ranFailed: string;
    /** `{shown}` and `{total}`. */
    stepped: string;
    stepsDone: string;
    nothingToStep: string;
    traceCut: string;
    reset: string;
    panel: string;
  };
  diagnostics: Record<DiagnosticCode, string>;
  contexts: Record<ContextKey, string>;
  names: Record<NameKey, string>;
  foundNames: { newline: string; eof: string; indent: string; dedent: string };
  stageNames: Record<Stage, string>;
  tokenTypeLang: string;
  conceptsHeading: string;
  concepts: readonly { term: string; text: string }[];
  limitsHeading: string;
  limits: readonly string[];
  noscript: string;
}

// The token types are the lexer's identifiers; they are not translated.
export const tokenTypes: readonly TokenType[] = [
  "keyword",
  "identifier",
  "integer",
  "string",
  "operator",
  "punctuation",
  "newline",
  "indent",
  "dedent",
  "eof",
];

export const tinyLanguageCopy = {
  en: {
    caption: "bench · runs in this browser",
    examplesBand: "Examples",
    examplesAria: "Examples",
    examples: {
      hello: {
        name: "hello",
        hint: "Variables, a type annotation, strings and interpolation.",
      },
      arithmetic: {
        name: "arithmetic",
        hint: "Integer math, comparisons and and / or / not.",
      },
      functions: {
        name: "functions",
        hint: "A recursive function and a for loop over 1..6, whose end is excluded.",
      },
      control: {
        name: "control flow",
        hint: "while, if, elif and else, with indentation as the only block marker.",
      },
      "missing-colon": {
        name: "syntax errors",
        hint: "Two mistakes on purpose. The parser reports both and still reads the last line.",
      },
      "bad-indent": {
        name: "bad indentation",
        hint: "Indentation is structure here, so a stray indent is a syntax error.",
      },
      "divide-by-zero": {
        name: "runtime error",
        hint: "The program parses fine and stops at the division. Output before it is kept.",
      },
      forever: {
        name: "infinite loop",
        hint: "Stopped by the step limit instead of hanging the page.",
      },
      "deep-recursion": {
        name: "deep recursion",
        hint: "Stopped by the call depth limit.",
      },
    },
    sourceBand: "Source",
    sourceLabel: "Source code",
    sourceHelp:
      "Spaces only, 4 per level in the examples. Blocks end where the indentation shrinks. Comments start with //.",
    characters: "{count} of {max} characters",
    problemsBand: "Problems",
    noProblems: "No syntax errors.",
    problems: { one: "{count} problem", other: "{count} problems" },
    severityError: "error",
    position: "line {line}, column {column}",
    panelsBand: "Stages",
    panelsAria: "Stage",
    panels: { tokens: "1 · tokens", tree: "2 · syntax tree", run: "3 · run" },
    previous: "previous stage",
    next: "next stage",
    panelHelp: {
      tokens:
        "The lexer cuts the source into tokens and turns indentation into indent and dedent tokens.",
      tree: "The parser turns tokens into a tree. A broken line is skipped so later lines still appear.",
      run: "A tree-walking interpreter runs the tree with limits on steps, calls, output and string size.",
    },
    tokenHeaders: ["type", "text", "line", "column"],
    tokenCount: { one: "{count} token", other: "{count} tokens" },
    tokensShown: "Showing the first {shown} of {total}.",
    treeEmpty: "Nothing parsed yet.",
    treeBlocked: "The source is too large to parse.",
    run: "run",
    step: "step",
    resetRun: "reset run",
    runBlocked:
      "Fix the syntax errors first: a program with errors is not run.",
    traceHeaders: ["line", "event", "detail"],
    traceKinds: {
      let: "declare",
      assign: "assign",
      print: "print",
      call: "call",
      return: "return",
      branch: "branch",
      loop: "loop",
    },
    outputLabel: "Output",
    outputEmpty: "(nothing printed yet)",
    traceLabel: "Trace",
    steps: {
      one: "{count} evaluation step",
      other: "{count} evaluation steps",
    },
    outputLines: {
      one: "{count} line printed",
      other: "{count} lines printed",
    },
    messages: {
      ready: "Pick an example or edit the source. Stages update as you type.",
      exampleLoaded: "Example “{name}” loaded. {hint}",
      analyzed: "{problems}. Details are listed under Problems.",
      analyzedClean: "No syntax errors. {tokens} and a syntax tree are ready.",
      ran: "Finished: {output}, {steps}.",
      ranFailed:
        "Stopped by a runtime error after {output}, {steps}. Details are listed under Problems.",
      stepped: "Step {shown} of {total}.",
      stepsDone: "All {total} trace events shown.",
      nothingToStep: "Run the program first, then step through it.",
      traceCut: "The trace keeps only the first 200 events.",
      reset: "Run reset.",
      panel: "Showing {panel}.",
    },
    diagnostics: {
      "source-too-large":
        "The source is over the limit of {chars} characters or {lines} lines, so it was not processed.",
      "tab-indent": "Tabs are not allowed in indentation; use spaces.",
      "unexpected-character": "Unexpected character `{char}`.",
      "unterminated-string": "This string is missing its closing quote.",
      "number-too-large": "This number is too large for a safe integer.",
      "inconsistent-dedent":
        "This line is indented to a level no enclosing block uses.",
      "indent-too-deep": "Blocks are nested too deeply; this line was ignored.",
      "too-many-tokens": "Too many tokens: reading stopped at {max}.",
      "expected-token": "Expected `{expected}` {context}, found {found}.",
      "expected-expression": "Expected an expression, found {found}.",
      "expected-block": "Expected an indented block after `{context}`.",
      "expected-name": "Expected a name for {what}, found {found}.",
      "expected-end-of-line": "Expected the end of the line, found {found}.",
      "unexpected-indent":
        "Unexpected indentation: nothing opened a block here.",
      "bad-interpolation":
        "A `{…}` inside a string needs one non-empty expression and a closing brace.",
      "nesting-too-deep": "Nested more than {max} levels deep.",
      "too-many-errors": "Too many problems; reporting stopped at {max}.",
      "undefined-variable": "`{name}` is not defined here.",
      "already-declared": "`{name}` is already declared in this block.",
      "assign-const": "`{name}` is a constant and cannot be changed.",
      "undefined-function": "There is no function called `{name}`.",
      "not-a-function": "`{name}` is a variable, not a function.",
      "wrong-arity": "`{name}` takes {expected} argument(s) but got {found}.",
      "type-mismatch": "`{op}` cannot be used with {left} and {right}.",
      "annotation-mismatch": "`{what}` should be {expected} but is {found}.",
      "unknown-type":
        "`{type}` is not a type this playground knows (int, str, bool).",
      "division-by-zero": "Division by zero.",
      "integer-overflow":
        "The result is outside the safe integer range (±{max}).",
      "step-limit":
        "Stopped after {max} evaluation steps: the program may never end.",
      "depth-limit":
        "Stopped at {max} nested calls: the recursion may never end.",
      "output-limit":
        "Stopped: output is limited to {lines} lines or {chars} characters.",
      "string-too-long": "A string grew past {max} characters.",
      "return-outside-function": "`return` is only allowed inside a function.",
      "reserved-name": "`{word}` is a keyword and cannot be used as a name.",
    },
    contexts: {
      "function-name": "after the function name",
      parameters: "after the parameters",
      "function-body": "to start the function body",
      condition: "after the condition",
      else: "after else",
      "loop-variable": "after the loop variable",
      "range-bounds": "between the range bounds",
      range: "after the range",
      arguments: "after the arguments",
      parenthesis: "to close the parenthesis",
      "parameter-name": "after the parameter name",
      let: "after the name in let",
      const: "after the name in const",
    },
    names: {
      variable: "a variable",
      function: "a function",
      parameter: "a parameter",
      type: "a type",
      "loop-variable": "a loop variable",
    },
    foundNames: {
      newline: "the end of the line",
      eof: "the end of the source",
      indent: "an indent",
      dedent: "a dedent",
    },
    stageNames: { lex: "tokenizer", parse: "parser", run: "runtime" },
    tokenTypeLang: "en",
    conceptsHeading: "What to watch",
    concepts: [
      {
        term: "tokens",
        text: "Before anything is understood, the text is cut into tokens: words, numbers, strings, operators. Indentation becomes indent and dedent tokens, which is how a language without braces marks its blocks.",
      },
      {
        term: "syntax tree",
        text: "The parser turns the flat token list into a tree that shows structure: `1 + 2 * 3` puts `*` below `+` because it binds tighter. Precedence is in the tree, not in the text.",
      },
      {
        term: "diagnostics",
        text: "A good message says what was expected, what was found and where. After an error the parser skips the broken line and goes on, so one mistake does not hide the next one.",
      },
      {
        term: "evaluation",
        text: "The interpreter walks the tree. Nothing is compiled and nothing is evaluated as JavaScript: names live in the program’s own scopes, so `process` or `constructor` are just undefined names.",
      },
      {
        term: "limits",
        text: "Every stage has a limit: source size, nesting depth, evaluation steps, call depth, output and string length. An infinite loop ends with a message instead of freezing the tab.",
      },
    ],
    limitsHeading: "Limits",
    limits: [
      "This is not the yanawa compiler. yanawa is in the language-design phase and has no verified compiler yet. The syntax here is a small subset read from its design notes (revision 7fd082e), and the rules the notes leave open were decided on this page.",
      "Included: let, const, fn with typed parameters, if/elif/else, while, for over a range, and/or/not, integers, strings with interpolation, booleans, // comments, print and len.",
      "Not included: structs, enums, traits, nullable types, arrays, switch, floats, imports, errors as values. Type annotations (int, str, bool) are checked when the program runs; yanawa’s static type checking is not implemented.",
      "A range like 1..6 excludes its end, and integer division truncates; the notes do not fix either, so they are choices made here.",
      "Source is limited to 4,000 characters and 200 lines. Nothing is stored or sent anywhere.",
    ],
    noscript:
      "The playground needs JavaScript to tokenize, parse and run the source.",
  },
  "pt-BR": {
    caption: "bancada · executa neste navegador",
    examplesBand: "Exemplos",
    examplesAria: "Exemplos",
    examples: {
      hello: {
        name: "olá",
        hint: "Variáveis, uma anotação de tipo, strings e interpolação.",
      },
      arithmetic: {
        name: "aritmética",
        hint: "Matemática com inteiros, comparações e and / or / not.",
      },
      functions: {
        name: "funções",
        hint: "Uma função recursiva e um for sobre 1..6, cujo fim é excluído.",
      },
      control: {
        name: "controle de fluxo",
        hint: "while, if, elif e else, com a indentação como único marcador de bloco.",
      },
      "missing-colon": {
        name: "erros de sintaxe",
        hint: "Dois erros de propósito. O parser relata os dois e ainda lê a última linha.",
      },
      "bad-indent": {
        name: "indentação errada",
        hint: "Aqui a indentação é estrutura, então uma indentação perdida é um erro de sintaxe.",
      },
      "divide-by-zero": {
        name: "erro em execução",
        hint: "O programa passa no parser e para na divisão. A saída anterior é mantida.",
      },
      forever: {
        name: "laço infinito",
        hint: "Interrompido pelo limite de passos em vez de travar a página.",
      },
      "deep-recursion": {
        name: "recursão profunda",
        hint: "Interrompida pelo limite de profundidade de chamadas.",
      },
    },
    sourceBand: "Código-fonte",
    sourceLabel: "Código-fonte",
    sourceHelp:
      "Apenas espaços, 4 por nível nos exemplos. Os blocos terminam onde a indentação diminui. Comentários começam com //.",
    characters: "{count} de {max} caracteres",
    problemsBand: "Problemas",
    noProblems: "Nenhum erro de sintaxe.",
    problems: {
      one: "{count} problema",
      other: "{count} problemas",
      none: "nenhum problema",
    },
    severityError: "erro",
    position: "linha {line}, coluna {column}",
    panelsBand: "Etapas",
    panelsAria: "Etapa",
    panels: {
      tokens: "1 · tokens",
      tree: "2 · árvore sintática",
      run: "3 · execução",
    },
    previous: "etapa anterior",
    next: "próxima etapa",
    panelHelp: {
      tokens:
        "O lexer corta o código em tokens e transforma a indentação em tokens de indent e dedent.",
      tree: "O parser transforma os tokens numa árvore. Uma linha quebrada é pulada para que as seguintes ainda apareçam.",
      run: "Um interpretador percorre a árvore com limites de passos, chamadas, saída e tamanho de string.",
    },
    tokenHeaders: ["tipo", "texto", "linha", "coluna"],
    tokenCount: {
      one: "{count} token",
      other: "{count} tokens",
      none: "nenhum token",
    },
    tokensShown: "Mostrando os primeiros {shown} de {total}.",
    treeEmpty: "Nada foi analisado ainda.",
    treeBlocked: "O código é grande demais para ser analisado.",
    run: "executar",
    step: "avançar",
    resetRun: "reiniciar execução",
    runBlocked:
      "Corrija antes os erros de sintaxe: um programa com erros não é executado.",
    traceHeaders: ["linha", "evento", "detalhe"],
    traceKinds: {
      let: "declarar",
      assign: "atribuir",
      print: "imprimir",
      call: "chamar",
      return: "retornar",
      branch: "desvio",
      loop: "laço",
    },
    outputLabel: "Saída",
    outputEmpty: "(nada impresso ainda)",
    traceLabel: "Rastro",
    steps: {
      one: "{count} passo de avaliação",
      other: "{count} passos de avaliação",
      none: "nenhum passo de avaliação",
    },
    outputLines: {
      one: "{count} linha impressa",
      other: "{count} linhas impressas",
      none: "nenhuma linha impressa",
    },
    messages: {
      ready:
        "Escolha um exemplo ou edite o código. As etapas se atualizam enquanto você digita.",
      exampleLoaded: "Exemplo “{name}” carregado. {hint}",
      analyzed: "{problems}. Os detalhes estão em Problemas.",
      analyzedClean:
        "Nenhum erro de sintaxe. {tokens} e uma árvore sintática estão prontos.",
      ran: "Terminou: {output}, {steps}.",
      ranFailed:
        "Parou por um erro em execução após {output}, {steps}. Os detalhes estão em Problemas.",
      stepped: "Passo {shown} de {total}.",
      stepsDone: "Todos os {total} eventos do rastro estão à mostra.",
      nothingToStep:
        "Execute o programa primeiro e depois avance passo a passo.",
      traceCut: "O rastro guarda apenas os 200 primeiros eventos.",
      reset: "Execução reiniciada.",
      panel: "Mostrando {panel}.",
    },
    diagnostics: {
      "source-too-large":
        "O código passa do limite de {chars} caracteres ou {lines} linhas, então não foi processado.",
      "tab-indent": "Tabs não são permitidos na indentação; use espaços.",
      "unexpected-character": "Caractere inesperado `{char}`.",
      "unterminated-string": "Falta a aspa de fechamento desta string.",
      "number-too-large": "Este número é grande demais para um inteiro seguro.",
      "inconsistent-dedent":
        "Esta linha tem uma indentação que nenhum bloco ao redor usa.",
      "indent-too-deep":
        "Os blocos estão aninhados fundo demais; esta linha foi ignorada.",
      "too-many-tokens": "Tokens demais: a leitura parou em {max}.",
      "expected-token":
        "Esperava `{expected}` {context}, mas encontrou {found}.",
      "expected-expression": "Esperava uma expressão, mas encontrou {found}.",
      "expected-block": "Esperava um bloco indentado depois de `{context}`.",
      "expected-name": "Esperava um nome para {what}, mas encontrou {found}.",
      "expected-end-of-line": "Esperava o fim da linha, mas encontrou {found}.",
      "unexpected-indent": "Indentação inesperada: nada abriu um bloco aqui.",
      "bad-interpolation":
        "Um `{…}` dentro de uma string precisa de uma expressão não vazia e da chave de fechamento.",
      "nesting-too-deep": "Aninhamento com mais de {max} níveis.",
      "too-many-errors": "Problemas demais; o relatório parou em {max}.",
      "undefined-variable": "`{name}` não está definido aqui.",
      "already-declared": "`{name}` já foi declarado neste bloco.",
      "assign-const": "`{name}` é uma constante e não pode ser alterada.",
      "undefined-function": "Não existe uma função chamada `{name}`.",
      "not-a-function": "`{name}` é uma variável, não uma função.",
      "wrong-arity":
        "`{name}` recebe {expected} argumento(s), mas recebeu {found}.",
      "type-mismatch": "`{op}` não pode ser usado com {left} e {right}.",
      "annotation-mismatch": "`{what}` deveria ser {expected}, mas é {found}.",
      "unknown-type":
        "`{type}` não é um tipo que este playground conhece (int, str, bool).",
      "division-by-zero": "Divisão por zero.",
      "integer-overflow":
        "O resultado está fora da faixa de inteiros seguros (±{max}).",
      "step-limit":
        "Parou após {max} passos de avaliação: o programa pode nunca terminar.",
      "depth-limit":
        "Parou em {max} chamadas aninhadas: a recursão pode nunca terminar.",
      "output-limit":
        "Parou: a saída é limitada a {lines} linhas ou {chars} caracteres.",
      "string-too-long": "Uma string passou de {max} caracteres.",
      "return-outside-function":
        "`return` só é permitido dentro de uma função.",
      "reserved-name":
        "`{word}` é uma palavra-chave e não pode ser usada como nome.",
    },
    contexts: {
      "function-name": "depois do nome da função",
      parameters: "depois dos parâmetros",
      "function-body": "para iniciar o corpo da função",
      condition: "depois da condição",
      else: "depois de else",
      "loop-variable": "depois da variável do laço",
      "range-bounds": "entre os limites do intervalo",
      range: "depois do intervalo",
      arguments: "depois dos argumentos",
      parenthesis: "para fechar o parêntese",
      "parameter-name": "depois do nome do parâmetro",
      let: "depois do nome no let",
      const: "depois do nome no const",
    },
    names: {
      variable: "uma variável",
      function: "uma função",
      parameter: "um parâmetro",
      type: "um tipo",
      "loop-variable": "uma variável de laço",
    },
    foundNames: {
      newline: "o fim da linha",
      eof: "o fim do código",
      indent: "uma indentação",
      dedent: "uma redução de indentação",
    },
    stageNames: { lex: "tokenizador", parse: "parser", run: "execução" },
    tokenTypeLang: "en",
    conceptsHeading: "O que observar",
    concepts: [
      {
        term: "tokens",
        text: "Antes de entender qualquer coisa, o texto é cortado em tokens: palavras, números, strings, operadores. A indentação vira tokens de indent e dedent, que é como uma linguagem sem chaves marca seus blocos.",
      },
      {
        term: "árvore sintática",
        text: "O parser transforma a lista plana de tokens numa árvore que mostra a estrutura: `1 + 2 * 3` põe o `*` abaixo do `+` porque ele liga mais forte. A precedência está na árvore, não no texto.",
      },
      {
        term: "diagnósticos",
        text: "Uma boa mensagem diz o que era esperado, o que foi encontrado e onde. Depois de um erro, o parser pula a linha quebrada e continua, então um engano não esconde o próximo.",
      },
      {
        term: "avaliação",
        text: "O interpretador percorre a árvore. Nada é compilado e nada é avaliado como JavaScript: os nomes vivem nos escopos do próprio programa, então `process` ou `constructor` são apenas nomes indefinidos.",
      },
      {
        term: "limites",
        text: "Cada etapa tem um limite: tamanho do código, profundidade de aninhamento, passos de avaliação, profundidade de chamadas, saída e tamanho de string. Um laço infinito termina com uma mensagem em vez de travar a aba.",
      },
    ],
    limitsHeading: "Limites",
    limits: [
      "Este não é o compilador do yanawa. O yanawa está na fase de design da linguagem e ainda não tem um compilador verificado. A sintaxe aqui é um pequeno subconjunto lido de suas notas de design (revisão 7fd082e), e as regras que as notas deixam em aberto foram decididas nesta página.",
      "Incluído: let, const, fn com parâmetros tipados, if/elif/else, while, for sobre um intervalo, and/or/not, inteiros, strings com interpolação, booleanos, comentários //, print e len.",
      "Não incluído: structs, enums, traits, tipos anuláveis, arrays, switch, floats, imports, erros como valores. As anotações de tipo (int, str, bool) são verificadas quando o programa roda; a verificação estática de tipos do yanawa não está implementada.",
      "Um intervalo como 1..6 exclui o fim, e a divisão de inteiros trunca; as notas não fixam nenhum dos dois, então são escolhas feitas aqui.",
      "O código é limitado a 4.000 caracteres e 200 linhas. Nada é guardado nem enviado a lugar nenhum.",
    ],
    noscript:
      "O playground precisa de JavaScript para tokenizar, analisar e executar o código.",
  },
} satisfies Record<LocaleId, TinyLanguageCopy>;
