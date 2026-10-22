---
contentId: projects/sweep
locale: pt-BR
originalLocale: en
path: /pt/projetos/sweep/
title: Sweep
description: Ferramenta de linha de comando em Python para organizar arquivos em um diretório escolhido.
tagline: Organizador de arquivos para um diretório escolhido.
order: 1
group: projects
status: ativo
meta:
  - cli em python
source: https://github.com/RaioViajante/sweep
summary: organização de arquivos em um diretório escolhido
---

## Visão geral

Sweep é uma ferramenta de linha de comando em Python que organiza arquivos em um diretório escolhido. Ela examina os arquivos diretamente nesse diretório, classifica cada um pela extensão final e calcula um destino por categoria. `preview` mostra os destinos sem mover os arquivos; `run` efetua os movimentos.

## Como funciona

Para o diretório informado, Sweep expande `~`, verifica se o caminho existe e se é um diretório, e examina somente os arquivos diretamente nele. Subdiretórios são ignorados. O destino calculado tem este formato:

```text
<diretório>/<categoria>/<nome do arquivo>
```

O comando mostra nome, categoria, extensão, tamanho e destino de cada arquivo, além de totais e contagens por categoria. `run` também informa quantos arquivos foram movidos ou ignorados.

## Classificação

A classificação usa a extensão final em minúsculas (`Path.suffix`):

| Categoria | Extensões |
| --- | --- |
| Images | `.jpg`, `.png`, `.jpeg`, `.gif`, `.webp` |
| Documents | `.docx`, `.pdf`, `.md`, `.txt` |
| Archives | `.zip`, `.rar`, `.7z`, `.tar`, `.gz` |
| Other | Qualquer outra extensão final, inclusive nenhuma |

Esses nomes de categoria são os valores usados pelo programa. Por exemplo, `REPORT.PDF` vai para `Documents`; `archive.tar.gz` vai para `Archives` porque `.gz` é a extensão final; `README` e `.hidden` vão para `Other`.

## Experimentar sem mover arquivos

```bash
sweep preview ~/Downloads
```

`preview` calcula e mostra a organização planejada, mas não move arquivos. Ele não faz a verificação de conflito que ocorre durante o movimento.

Para efetuar a organização:

```bash
sweep run ~/Downloads
```

`run` cria os diretórios de categoria quando necessários e move os arquivos. Se já houver um arquivo no destino, o movimento é ignorado e o arquivo de origem permanece no lugar. Não há renomeação automática, sobrescrita ou rollback.

## Limitações

Sweep não examina subdiretórios recursivamente, não monitora arquivos, não agenda execuções e não oferece regras de classificação configuráveis. O diretório é informado pelo usuário; `Downloads` é apenas um exemplo.

[Repositório do Sweep](https://github.com/RaioViajante/sweep)
