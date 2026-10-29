---
contentId: raioviajante/repository-conventions
locale: pt-BR
originalLocale: en
path: /pt/raioviajante/convencoes-de-repositorio/
title: Convenções de repositório
description: Commits, publicação de mudanças e idioma de trabalho nos repositórios do RaioViajante.
order: 3
group: raioviajante
status: padrão
meta:
  - vale para todo repositório do raioviajante
summary: commits, publicação, idioma
---

Convenções que valem para os repositórios do RaioViajante, incluindo este site.

## Commits

Toda unidade de trabalho relevante resulta em um commit próprio, escrito em inglês seguindo o [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, ...). Uma mudança coerente por commit — trabalho não relacionado nunca é misturado no mesmo commit, e mensagens de commit nunca são vagas. O diff é revisado antes de ser commitado.

## Publicando mudanças

Nada é enviado a um repositório remoto sem permissão explícita. O histórico não é reescrito: nada de `--amend` em trabalho existente, nada de rebase de commits compartilhados e nada de force push.

## Idioma

A documentação do repositório, os nomes técnicos de arquivos, o código, os identificadores, os comentários, as mensagens de commit e a configuração usam inglês. A documentação publicada pode ser escrita em inglês ou em português do Brasil; as traduções são adicionadas aos poucos, e os slugs das URLs localizadas podem ser diferentes.
