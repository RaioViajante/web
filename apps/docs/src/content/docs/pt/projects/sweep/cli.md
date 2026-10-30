---
contentId: projects/sweep/cli
locale: pt-BR
originalLocale: en
path: /pt/projetos/sweep/cli/
title: Sweep CLI
description: Todos os comandos, argumentos e campos de saída do Sweep em um só lugar.
tagline: Todos os comandos, argumentos e campos de saída, em um só lugar.
label: referência da cli
order: 1.1
sub: true
group: projects
status: ativo
meta:
  - referência
source: https://github.com/RaioViajante/sweep
summary: comandos, argumentos e saída
---

## Sinopse

```shell title="uso"
sweep <command> <directory>
```

## Comandos

`sweep preview <directory>` examina e classifica os arquivos, calcula seus destinos e mostra a organização planejada. Ele não move arquivos.

`sweep run <directory>` executa a organização. Ele cria os diretórios de categoria quando necessário e move os arquivos para os destinos calculados.

| Comportamento | Preview | Run |
| --- | --- | --- |
| examina e classifica arquivos | sim | sim |
| mostra os destinos calculados | sim | sim |
| cria diretórios de categoria | não | sim |
| move arquivos | não | sim |
| verificação de conflito no momento do movimento | não | sim |
| informa quantos foram movidos e ignorados | não | sim |

## Argumentos

`directory` é obrigatório. É o diretório a organizar. A notação de diretório pessoal, como `~`, é expandida. O caminho precisa existir e ser um diretório. Apenas os arquivos diretamente dentro dele são considerados; subdiretórios são ignorados.

:::note
O guia não documenta nenhuma flag. As opções ganharão a sua própria tabela aqui quando existirem.
:::

## Saída

Para cada arquivo, o Sweep imprime:

| Campo | Valor |
| --- | --- |
| nome | nome do arquivo |
| categoria | Images, Documents, Archives ou Other |
| sufixo | sufixo final em minúsculas |
| tamanho | tamanho do arquivo |
| destino | caminho de destino calculado |

Depois dos arquivos, ele imprime um resumo:

| Campo | Impresso por |
| --- | --- |
| totais | preview e run |
| contagens por categoria | preview e run |
| movidos | somente run |
| ignorados | somente run |
