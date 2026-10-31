---
contentId: projects/yanawa
locale: pt-BR
originalLocale: en
path: /pt/projetos/yanawa/
title: yanawa
description: Uma linguagem experimental, fortemente tipada e voltada a aplicações, ainda em design. O que está decidido, o que é só direção e o que ainda não existe.
tagline: Uma linguagem fortemente tipada para aplicações, ainda no papel.
order: 1.5
group: projects
status: experimental
meta:
  - design de linguagem
source: https://github.com/yanawa/yanawa
summary: linguagem de aplicações fortemente tipada, em design
---

## Visão geral

yanawa é uma linguagem de programação experimental e fortemente tipada para construir aplicações com menos cerimônia. O objetivo declarado é oferecer garantias estáticas fortes sem obrigar quem programa a repetir o que o compilador já sabe, e uma cadeia de ferramentas própria que trata formatação, testes, diagnósticos e dependências como um só sistema.

O nome é escrito em minúsculas em todo lugar: `yanawa`.

:::important
yanawa não tem compilador, interpretador, runtime, arquivo de gramática nem ecossistema de pacotes. O repositório de código contém documentos de design e mais nada, então nenhum programa em yanawa pode ser executado hoje.
:::

## Estado atual

Cada afirmação desta página vem dos documentos de design do repositório de código, conferidos no commit `7fd082e`. O repositório tem 16 commits, todos de documentação, e seis issues fechadas que definem a identidade da linguagem.

| Área | Estado | Evidência |
| --- | --- | --- |
| Identidade e princípios da linguagem | princípios declarados, não uma especificação | `docs/language-identity.md`, `docs/philosophy.md` |
| Dezesseis decisões de sintaxe e semântica | aceitas, ainda podem mudar | `docs/decisions.md` (D001 a D016) |
| Tipos, erros, objetos, módulos | direção, com perguntas em aberto | `docs/type-system.md`, `docs/errors.md`, `docs/object-model.md`, `docs/modules.md` |
| Memória, concorrência, biblioteca padrão, pacotes | direção, em grande parte indefinida | `docs/memory-model.md`, `docs/concurrency.md`, `docs/standard-library.md`, `docs/package-system.md` |
| Pipeline do compilador e cadeia de ferramentas | arquitetura proposta, nada construído | `docs/compiler-architecture.md`, `docs/tooling.md` |
| Lexer, parser, verificador de tipos, gerador de código | não iniciados no repositório | não há arquivos de código |
| Comando `yanawa` | não implementado | não há arquivos de código |

Uma decisão marcada como aceita registra uma direção pretendida. O próprio projeto diz que ela ainda pode evoluir enquanto a linguagem for experimental.

## Filosofia

Os documentos descrevem alguns princípios pelos quais as novas propostas são medidas:

- Clareza antes de esperteza: o código deve ser compreensível antes de ser impressionante.
- Tipagem forte sem sintaxe excessiva: a inferência pode esconder o que é derivável, nunca o que é significativo.
- Familiar antes de novo: sintaxe nova exige um ganho claro de clareza, segurança ou consistência.
- Seguro por padrão: o código comum deve levar a um comportamento previsível.
- As ferramentas fazem parte da linguagem: uma cadeia de ferramentas, um fluxo óbvio.
- Frameworks são arquitetura opcional, não infraestrutura obrigatória.

O projeto também se interessa pela fronteira entre o código tipado da aplicação e o mundo externo: HTTP, JSON, configuração, bancos de dados e rotas. Se isso vira sintaxe da linguagem, desenho da biblioteca padrão, pacotes oficiais ou ferramentas do compilador é uma decisão explicitamente em aberto.

## Como é a sintaxe aceita

O exemplo a seguir usa apenas construções que `docs/decisions.md` aceita: blocos por indentação, `let`, `const`, `fn`, anotações depois dos nomes, interpolação e operadores em palavras.

```yanawa
const MAX_RETRIES = 3

fn describe(name: str, attempts: int) -> str:
    if attempts >= MAX_RETRIES and name == "Morgan":
        return "{name} has no attempts left"
    return "{name} can try again"

fn main():
    let attempts = 1
    print(describe("Morgan", attempts))
```

:::note
Isto é sintaxe de design, não um programa executável. Nenhuma ferramenta a aceita ainda, e o repositório não contém uma gramática formal. As decisões aceitas não cobrem todas as construções do exemplo, como `print`, então trate-o como uma ilustração da direção.
:::

A página de [design da linguagem](/pt/projetos/yanawa/design/) lista cada decisão aceita, as propostas ainda exploratórias e as perguntas em aberto.

## O que fica deliberadamente em aberto

O documento de decisões lista como não resolvidos: retorno explícito ou implícito, o conjunto de tipos primitivos, a visibilidade padrão, `self` dentro de métodos, o modelo de objetos, traits, herança, `switch` e correspondência de padrões, tratamento de erros, genéricos, os sistemas de módulos e de pacotes, concorrência, gerenciamento de memória, a linguagem de implementação do compilador, o modelo de runtime, os alvos de compilação e os limites da biblioteca padrão.

Escolhas de implementação como a linguagem do compilador, a estratégia de memória e o backend de produção não foram feitas de propósito. Espera-se que a primeira implementação priorize experimentação e correção da linguagem em vez de otimização.

## Referências

- [Repositório do yanawa](https://github.com/yanawa/yanawa) e seus [documentos de design](https://github.com/yanawa/yanawa/tree/7fd082e/docs).
- [Decisões de design D001 a D016](https://github.com/yanawa/yanawa/blob/7fd082e/docs/decisions.md).
- [Comecei a projetar uma linguagem antes de conseguir compilar uma](https://dump.raioviajante.com/pt/posts/comecei-a-projetar-uma-linguagem-antes-de-conseguir-compilar-uma), um ensaio no Dump.
