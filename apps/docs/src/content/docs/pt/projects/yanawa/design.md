---
contentId: projects/yanawa/design
locale: pt-BR
originalLocale: en
path: /pt/projetos/yanawa/design/
title: Design da linguagem yanawa
description: As decisões aceitas do yanawa, as propostas ainda em exploração e as perguntas em aberto, área por área.
tagline: O que está aceito, o que é explorado, o que está em aberto.
label: design da linguagem
order: 1.51
sub: true
group: projects
status: experimental
meta:
  - registro de design
source: https://github.com/yanawa/yanawa
summary: decisões aceitas, sintaxe exploratória e perguntas em aberto
---

## Como ler esta página

O yanawa está documentado apenas como design. Cada afirmação abaixo é marcada pela origem no repositório de código, no commit `7fd082e`:

- Aceito: registrado em `docs/decisions.md` como decisão, com a ressalva de que ainda pode evoluir.
- Exploratório: descrito nos demais documentos de design como direção possível ou preferida.
- Em aberto: listado pelos documentos como não resolvido.

Nada aqui está implementado. Não existe compilador nem interpretador contra o qual conferir qualquer item.

## Decisões aceitas

| Id | Decisão | Exemplo |
| --- | --- | --- |
| D001 | Tipagem estática forte, com inferência que nunca enfraquece as garantias | `let age = 27` é um `int` |
| D002 | Blocos por indentação, introduzidos por dois-pontos | `if active:` |
| D003 | Sem ponto e vírgula obrigatório | `let name = "Alex"` |
| D004 | `let` declara uma variável mutável | `let score = 0` |
| D005 | `const` declara uma constante imutável; `const let` é evitado | `const MAX_RETRIES = 3` |
| D006 | O tipo escrito vem depois do nome | `let name: str = "Morgan"` |
| D007 | O tipo é inferido quando óbvio | `let active = true` |
| D008 | Tipos comuns não aceitam nulo; a ausência é explícita | `let nickname: str? = none` |
| D009 | A igualdade comum usa `==` | `if name == "Riley":` |
| D010 | Os operadores lógicos são as palavras `and`, `or`, `not` | `if not banned:` |
| D011 | Strings interpolam expressões com chaves | `"Hello, {name}"` |
| D012 | Funções usam `fn`, com o tipo de retorno depois de `->` | `fn add(a: int, b: int) -> int:` |
| D013 | Condições dispensam parênteses ao redor | `while running:` |
| D014 | `struct` declara dados estruturados simples | `struct User:` |
| D015 | Prefere-se a sintaxe familiar à novidade | sem exemplo |
| D016 | A clareza vale mais que o número de caracteres | sem exemplo |

Juntas, essas decisões dão o formato da linguagem: uma sintaxe pequena, baseada em indentação, em que mutabilidade, nulidade e tipos ficam visíveis onde importam.

## Direções exploratórias

Estas aparecem nos documentos de design como direções possíveis ou preferidas, não como decisões.

### Tipos, nulidade e resultados

Os documentos de tipos preferem inferência local, um conjunto de primitivos ainda não final (`str`, `int`, `float`, `bool` e `char` são candidatos) e `str` e `str?` como tipos diferentes. Propõem-se um operador de valor padrão `??` e um tipo `result<T, E>` com os construtores `ok` e `error`. A grafia exata, a análise de fluxo para valores anuláveis e as regras de conversão numérica estão em aberto.

```yanawa
fn divide(a: int, b: int) -> result<int, str>:
    if b == 0:
        return error("Division by zero")
    return ok(a / b)
```

### Structs, enums e traits

Structs são a construção principal de dados. A criação com campos nomeados, métodos declarados dentro do struct, composição em vez de herança, e `trait` com um `impl` separado são a direção preferida. Enums para variantes fechadas, possivelmente com valores associados, estão em consideração.

```yanawa
struct User:
    id: int
    name: str
    active: bool = true

trait Printable:
    fn display() -> str
```

### Tratamento de erros

Falhas esperadas devem ser valores tipados, tratados com correspondência de padrões, tendo `?` como possível operador de propagação. Ausência (valores anuláveis) e falha (resultados) ficam separadas. Asserções expressam suposições de quem programa, o pânico é reservado a estados irrecuperáveis, e exceções não são o modelo padrão.

### Fluxo de controle

Condições usam `if`, `elif` e `else`. Laços percorrem coleções e intervalos, com `while` para condições. Um `switch` pode produzir um valor, e propõe-se um `match` separado para padrões. Se os dois devem existir é algo indefinido.

### Concorrência, memória e módulos

`async` e `await` com concorrência estruturada são a direção preferida: tarefas filhas terminam com o escopo do pai, o cancelamento se propaga, e trabalho desacoplado exige intenção explícita. O código comum deve ser seguro quanto à memória sem alocação manual, mas a estratégia (coleta de lixo, posse, contagem de referências ou um modelo híbrido) está deliberadamente indefinida. Os módulos são orientados a arquivos, com caminhos de módulo estáveis em vez de longos imports relativos, e `fn main()` é o candidato a ponto de entrada.

### Biblioteca padrão e pacotes

A biblioteca padrão deve continuar pequena e coerente, organizada em módulos importáveis como `yanawa.fs`, `yanawa.http`, `yanawa.json` e `yanawa.time`. O candidato a sistema de pacotes é um único manifesto, `yanawa.toml`, com um arquivo `yanawa.lock`, dependências por caminho local e versionamento semântico. Um registro não é necessário para um primeiro compilador.

## Direção do compilador e das ferramentas

O documento de arquitetura do compilador propõe etapas separadas, com fronteiras claras:

```text
source code
  -> lexer -> tokens
  -> parser -> syntax tree
  -> name resolution
  -> type checking
  -> semantic representation
  -> lowering -> intermediate representation
  -> code generation -> target output
```

O mesmo documento diz que nem toda etapa precisa ser um subsistema separado, e que a linguagem de implementação, o alvo de execução, o runtime e as representações intermediárias estão indefinidos. O documento de ferramentas descreve um único comando `yanawa` com subcomandos como `run`, `build`, `check`, `test`, `fmt`, `lint`, `add`, `remove` e `docs`. O README afirma que eles descrevem intenção e que nem todos estão implementados, e o repositório não contém implementação de nenhum deles.

## Perguntas em aberto

Os documentos deixam sem resolução, entre outras:

- Retorno explícito ou implícito da expressão final.
- O conjunto final de tipos primitivos e as regras de conversão numérica.
- Mutabilidade de structs, regras de `self` e o alcance de `private`.
- Sintaxe e restrições de genéricos.
- A semântica exata de resultados e propagação.
- A estratégia de memória e o modelo de runtime.
- A linguagem de implementação do compilador e os alvos de compilação.
- Quanto de HTTP, JSON, rotas e configuração pertence à linguagem, à biblioteca ou às ferramentas.

## Referências

- [Decisões de design](https://github.com/yanawa/yanawa/blob/7fd082e/docs/decisions.md)
- [Sintaxe](https://github.com/yanawa/yanawa/blob/7fd082e/docs/syntax.md)
- [Sistema de tipos](https://github.com/yanawa/yanawa/blob/7fd082e/docs/type-system.md)
- [Tratamento de erros](https://github.com/yanawa/yanawa/blob/7fd082e/docs/errors.md)
- [Arquitetura do compilador](https://github.com/yanawa/yanawa/blob/7fd082e/docs/compiler-architecture.md)
- [Ferramentas](https://github.com/yanawa/yanawa/blob/7fd082e/docs/tooling.md)
