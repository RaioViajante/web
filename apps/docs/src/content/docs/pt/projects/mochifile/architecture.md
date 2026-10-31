---
contentId: projects/mochifile/architecture
locale: pt-BR
originalLocale: en
path: /pt/projetos/mochifile/architecture/
title: Arquitetura do Mochifile
description: "Como o Mochifile é construído: o contrato de ferramenta, o fluxo do worker, o motor de imagens, o algoritmo de busca do tamanho e os cabeçalhos de segurança."
tagline: O contrato de ferramenta, o fluxo em tempo de execução e o motor de imagens.
label: arquitetura
order: 1.21
sub: true
group: projects
status: pré-lançamento
meta:
  - registro de design
source: https://github.com/mochifile/mochifile
summary: contrato de ferramenta, fluxo do worker e motor de imagens
---

## Escopo

Esta página descreve o repositório público no commit `4efdc8c`. Cobre o código que existe para o site e para a única ferramenta publicada. As decisões são numeradas como nos registros de decisão do repositório.

## Estrutura do repositório

O repositório é um monorepo pnpm e Turborepo de pacotes TypeScript. A tabela lista os principais. Os pacotes internos têm apenas código-fonte e são compilados pelo build do site.

| Pacote | Responsabilidade |
| --- | --- |
| `apps/web` | o site Astro: páginas, registro, metadados de busca, cabeçalhos de segurança, testes ponta a ponta |
| `@mochifile/tool-kit` | o contrato de ferramenta, a validação do manifesto, os wrappers de worker e cliente, auxiliares de arquivo e erros |
| `@mochifile/engine-image` | decodificação, codificação, redimensionamento e busca do tamanho de imagens |
| `@mochifile/tool-compress-image` | a única ferramenta publicada |
| `@mochifile/ui` | componentes React acessíveis e tokens de design |
| `@mochifile/i18n` | lista de idiomas, caminhos localizados e mensagens compiladas |

O site usa Astro com ilhas React: as páginas são HTML estático, e uma página de ferramenta tem exatamente uma ilha interativa carregada sob demanda.

## O contrato de ferramenta

Uma ferramenta é dividida em duas partes para que as páginas fiquem leves. O manifesto é dado puro: um id, uma categoria, um runtime, os tipos MIME aceitos, limites, opções padrão, e títulos, descrições e slugs de URL por idioma. A função de processamento recebe arquivos, opções e um sinal de cancelamento, devolve resultados e não tem acesso à página.

```ts
export const config: ToolRuntimeConfig<CompressImageOptions> = {
  accepts: ['image/jpeg', 'image/png', 'image/webp'],
  limits: {
    maxFiles: 20,
    maxFileSizeBytes: 50_000_000,
  },
  defaults: { targetBytes: 100_000, format: 'original' },
}
```

O campo de runtime é `browser` ou `server`. O navegador é o padrão, e o contrato reserva `server` para trabalho que um navegador não consegue fazer, o que exige uma decisão escrita. Nenhuma ferramenta publicada o declara.

## Fluxo em tempo de execução

1. A interface valida tipo, tamanho e quantidade dos arquivos escolhidos, então o retorno é imediato e nada é enviado a lugar nenhum.
2. Um worker inicia no primeiro uso e valida as mesmas regras de novo.
3. O worker combina as opções com os padrões e executa a função de processamento com um callback de progresso e um sinal de cancelamento.
4. Os resultados voltam como valores `Blob`, que a página transforma em links de download.

O cancelamento aborta o sinal dentro do worker. Os erros cruzam a fronteira do worker como um código e uma mensagem; um erro inesperado vira uma falha genérica de processamento, então detalhes internos não chegam à interface.

## O motor de imagens

O motor codifica com versões WebAssembly do mozjpeg, do libwebp e do oxipng, e redimensiona com um filtro Lanczos com correção gama, então a saída é a mesma em todos os navegadores. Os codificadores nativos dos navegadores foram descartados porque tamanho e qualidade diferem entre os motores, e um dos grandes navegadores não codifica WebP.

A decodificação é escolhida por sessão, por pequenos testes:

1. Se a leitura de pixels de um canvas não é exata, como nas proteções contra identificação por impressão digital, usam-se os decodificadores WebAssembly em tamanho total, até 25 megapixels.
2. Caso contrário, para JPEGs acima de 24 megapixels, usa-se um decodificador de tamanho reduzido onde um teste prova que funciona.
3. Caso contrário, usa-se o decodificador de bitmap do próprio navegador, com a orientação aplicada.

Entradas acima de 100 megapixels são rejeitadas antes da decodificação, e o processamento ocorre em no máximo 16 megapixels. Como as saídas são recodificadas a partir dos pixels, não levam dados EXIF, GPS nem XMP.

## Busca do tamanho

Os codificadores não aceitam um tamanho como pedido, apenas qualidade e dimensões, então o compressor faz uma busca. A busca é uma função pura com um codificador injetado, e por isso é testada com um codec falso além dos reais.

1. Se o arquivo já está abaixo do alvo no mesmo formato, devolve-o com os metadados removidos sem perdas.
2. Caso contrário, parte de uma escala escolhida a partir do alvo e da quantidade de pixels.
3. Codifica com qualidade 90 e depois com qualidade 40. Se a 90 cabe, para. Se a 40 não cabe, reduz a imagem e repete.
4. Entre as duas, interpola sobre o logaritmo do tamanho, recorrendo à bisseção, e para quando o intervalo se fecha, após um número limitado de codificações, ou quando um resultado usa 97% do alvo.
5. Um resultado acima do alvo nunca é devolvido. Se nem o menor tamanho permitido serve, a ferramenta informa que o alvo é inalcançável.

O registro de decisão do repositório mediu de três a sete codificações por foto nas imagens de teste. Isso é uma medição daquelas fotos, não uma garantia para as suas.

## Hospedagem e cabeçalhos de segurança

O site é uma saída estática servida pela Cloudflare apenas como arquivos. Uma política de segurança de conteúdo rígida permite scripts somente da mesma origem, com a compilação de WebAssembly e hashes gerados no build para os scripts inline das ilhas, e não permite estilos nem fontes remotos nem a incorporação do site em quadros. O isolamento entre origens não é ativado globalmente, porque quebraria incorporações de terceiros; uma ferramenta que precise dele deve optar por rota.

## Testes

Os testes unitários cobrem o tool-kit e o motor, incluindo o comportamento de codecs, perfis de cor, metadados e da busca do tamanho. Os testes de integração verificam a saída do build, como os hashes da política de segurança e o sitemap. A suíte ponta a ponta executa o Playwright em Chromium, Firefox e WebKit, com verificações de acessibilidade axe em 16 especificações, incluindo a do compressor. A integração contínua executa lint, verificação de tipos, testes unitários, o build e os blocos de testes ponta a ponta. Essas suítes foram lidas para esta página e não executadas.

## Referências

- [Notas de arquitetura](https://github.com/mochifile/mochifile/blob/4efdc8c/docs/architecture.md)
- [Índice de decisões](https://github.com/mochifile/mochifile/blob/4efdc8c/docs/adr/README.md)
- [Decisão da busca do tamanho](https://github.com/mochifile/mochifile/blob/4efdc8c/docs/adr/0017-size-targeting-algorithm.md)
- [Decisão de processamento no cliente](https://github.com/mochifile/mochifile/blob/4efdc8c/docs/adr/0006-client-side-processing-first.md)
