---
contentId: raioviajante/design-language
locale: pt-BR
originalLocale: en
path: /pt/raioviajante/linguagem-de-design/
title: Linguagem de design
description: Tokens, tipografia e sobriedade compartilhados em todo o ecossistema RaioViajante.
tagline: Um sistema, quatro sites, quatro funções.
order: 2
group: raioviajante
status: estável
meta:
  - padrão
  - vale para todos os sites do raioviajante
summary: tokens, tipografia e sobriedade compartilhados
---

## Visão geral

raioviajante.com, dump, docs e lab compartilham uma só identidade visual, mas cada um tem uma função diferente. A moldura nunca muda de um para o outro: cabeçalho, navegação, numeração, rodapé. Só muda o que vive dentro dela.

| Site | Função |
| --- | --- |
| raioviajante.com | índice: quem, o quê, onde |
| dump | leitura: textos, séries, comentários |
| docs | referência: guias, CLI, busca |
| lab | executar coisas: bancadas, fidelidade |

## Tokens

Três cinzas sustentam a página. Duas superfícies existem apenas para código e bancadas. Mais nada.

```css title="tokens.css"
:root {
  --bg: #191919; /* page */
  --fg: #edf1f6; /* text, titles, active */
  --fg-2: #8792a1; /* secondary, status */
  --fg-3: #8792a1; /* numbers, labels */
  --line: rgba(215, 223, 234, 0.3); /* rules, frames */
  --dots: rgba(215, 223, 234, 0.3); /* leaders */
  --block: #212121; /* code, notes, tables, benches */
  --block-inner: #262626; /* inline code, tabs */
  --radius: 10px; /* blocks; 6px controls, 5px inline */
  --font: "Noto Sans Mono", ui-monospace, monospace;
  --measure: 739.2px; /* content column */
}
```

Os valores são os que o raioviajante.com já usava; os outros sites os herdam de `@raioviajante/design`, o único lugar onde uma cor é escrita.

## Tipografia

Uma só fonte. A hierarquia vem do tamanho, do peso e da posição.

A Noto Sans Mono compõe tudo: nomes, caminhos, prosa e código. As maiúsculas são reservadas a rótulos pequenos: o rótulo da página acima de um título, os nomes de grupo da barra lateral e os cabeçalhos de tabela.

| Papel | Tamanho e peso |
| --- | --- |
| Título da página | fluido, até 45,76px, peso 650 |
| Número e título da seção | 17,95px, peso 650, o número em `--fg-3` |
| Texto do corpo | 16,5px, peso 500, altura de linha 1,82 |
| Código e tabelas | 13 a 13,5px, altura de linha de 1,6 a 1,75 |
| Rótulo da página | 13,7px em maiúsculas, espaçamento entre letras de 0,08em |

## Cor

A página é cinza. A cor aparece apenas dentro do código e da saída das bancadas, onde identifica tokens. Status, avisos e seleção são expressos com palavras, linhas e posição, nunca com matiz.

```css title="tokens de sintaxe"
:root {
  --syn-keyword: #d8bd84;
  --syn-type: #bfa6d9;
  --syn-function: #8fb8d6;
  --syn-string: #a8c791;
  --syn-number: #de9f8c;
  --syn-comment: #9aa3af;
}
```

A seleção de texto e o anel de foco do teclado usam um único violeta suave, `#b9a1d2`. Ele nunca é usado em links.

## Estrutura

Toda página é montada com as mesmas peças.

| Peça | Regra |
| --- | --- |
| Cabeçalho da página | Centralizado: rótulo em maiúsculas (ou breadcrumb), título, uma linha e uma linha de metadados separada por pontos médios. O primeiro item de metadados é a palavra de status. |
| Barra lateral | PÁGINAS, numeradas 00., 01. A página atual tem uma linha de 1px à esquerda. NESTA PÁGINA fica logo abaixo, quando ajuda. Não há grupo de sites: o rodapé liga os sites. |
| Seções numeradas | O número em `--fg-3`, o título em `--fg`. As subseções seguem 01.1, 01.2. Os mesmos números aparecem em "nesta página". |
| Linha pontilhada | `nome ····· valor`: listas, metadados, status, links relacionados, tags. |
| Bloco suave | Código, terminais, notas, tabelas, bancadas: uma só superfície, cantos de 10px, sem borda, rótulo acima. Avisos são o único bloco com contorno. Citações mantêm uma linha à esquerda. |
| Palavra de status | ativo, explorando, concluído, estável, obsoleto: texto simples no fim de uma linha pontilhada. |
| Rodapé | Idêntico em todo lugar: os quatro sites, e-mail, CNPJ e os Termos de Uso e a Política de Privacidade daquele site. Nenhum site é marcado como atual. |
| Som | SOM LIGADO no topo, centralizado na coluna de conteúdo, não na página. Os mesmos sons e a mesma preferência em todos os sites. |

## Sobriedade

O espaço em branco faz a organização. Tudo o que interrompe a prosa (código, terminais, notas, tabelas, bancadas do lab) fica em uma única superfície suave. Só os avisos ganham contorno. As seções em si nunca são encaixotadas: sem cards, sem sombras.

:::warning
Nunca use gradientes, brilho, sombras, bento grids, selos coloridos, ícones onde uma palavra resolve, emoji, uma segunda fonte ou uma cor de destaque nos links.
:::

Há uma exceção a "sem sombras": as peças da galeria do root mantêm as suas, porque são obras presas a um mural.

## Peças compartilhadas

Cada peça abaixo existe uma só vez, em `@raioviajante/design`, e todo site a importa.

- o shell: barra lateral, botão de som, coluna de conteúdo e rodapé
- o cabeçalho da página, as seções numeradas, as linhas pontilhadas e o anterior/próximo
- blocos de código, terminais, diffs, callouts e tabelas, com o destaque de sintaxe aplicado no build
- a página de busca e o item de busca na barra lateral
- os modelos das páginas 404 e das páginas legais
- as ilustrações e os sons, que são sintetizados no navegador
