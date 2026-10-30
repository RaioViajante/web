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

Sweep é uma pequena ferramenta de linha de comando em Python que organiza arquivos em um diretório escolhido. Ela examina os arquivos que estão diretamente nesse diretório, classifica cada um pela extensão final e calcula um destino por categoria. `preview` mostra esses destinos sem mover os arquivos; `run` efetua os movimentos.

## O que o Sweep faz hoje

Para um diretório escolhido, o Sweep:

1. expande a notação de diretório pessoal, como `~`;
2. verifica se o caminho existe e se é um diretório;
3. examina os arquivos que estão diretamente no diretório;
4. ignora subdiretórios;
5. classifica cada arquivo pelo sufixo final, em minúsculas;
6. calcula um destino neste formato:

   ```text
   <diretório>/<categoria>/<nome do arquivo>
   ```

Com `preview`, o Sweep mostra a classificação e o destino calculado. Com `run`, ele move cada arquivo para esse destino. O diretório de destino é criado quando um movimento precisa dele.

O comando imprime informações de cada arquivo, incluindo nome, categoria, sufixo, tamanho e destino. Também imprime totais e contagens por categoria. `run` informa ainda quantos arquivos foram movidos e quantos foram ignorados.

## Classificação

A classificação usa o valor final de `Path.suffix`, em minúsculas. As categorias atuais são:

| Categoria | Extensões |
| --- | --- |
| Images | `.jpg`, `.png`, `.jpeg`, `.gif`, `.webp` |
| Documents | `.docx`, `.pdf`, `.md`, `.txt` |
| Archives | `.zip`, `.rar`, `.7z`, `.tar`, `.gz` |
| Other | Qualquer outro sufixo final, inclusive nenhum |

Por exemplo:

```text
photo.png     → Images
REPORT.PDF    → Documents
archive.tar.gz → Archives
README        → Other
.hidden       → Other
```

:::note
`archive.tar.gz` é classificado em `Archives` porque `.gz` é o seu sufixo final. `.hidden` não tem sufixo, segundo o comportamento de `Path.suffix` do Python.
:::

## Preview e run

### Preview

```bash
sweep preview ~/Downloads
```

`preview` examina e classifica os arquivos, calcula seus destinos e mostra a organização planejada. Ele não move arquivos.

:::important
O preview não faz a verificação de conflito de destino que acontece no momento do movimento.
:::

### Run

```bash
sweep run ~/Downloads
```

`run` executa a organização. Ele cria os diretórios de categoria quando necessário e move os arquivos para os destinos calculados.

## Comportamento em conflitos

O Sweep não sobrescreve um arquivo que já exista no destino. Quando o destino já existe, o movimento é ignorado e o arquivo de origem permanece onde está.

:::warning
Não há renomeação automática, opção de sobrescrita, estratégia de resolução de conflitos, transação nem rollback.
:::

## Limitações atuais

A implementação atual não oferece:

- varredura recursiva;
- monitoramento de arquivos ou automação em segundo plano;
- agendamento;
- regras de classificação configuráveis;
- detecção de arquivos pelo conteúdo;
- renomeação automática em conflitos;
- tratamento de sobrescrita;
- rollback;
- organização ampla de todo o sistema de arquivos.

O diretório alvo é informado pelo usuário. Downloads é apenas um exemplo; ele não está fixo no código.

## Experimente e leia mais

- [001 classificador de arquivos](https://lab.raioviajante.com/pt/experiments/classificador-de-arquivos/): classifique nomes no seu navegador (lab)
- [Aparentemente mover um arquivo tem casos de borda](https://dump.raioviajante.com/pt/posts/aparentemente-mover-um-arquivo-tem-casos-de-borda) (dump)
- [Um arquivo TOML mudou o que o Sweep era](https://dump.raioviajante.com/pt/posts/um-arquivo-toml-mudou-o-que-o-sweep-era) (dump)
- [Repositório de código-fonte](https://github.com/RaioViajante/sweep)
