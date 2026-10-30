---
contentId: projects/orbit/api
locale: pt-BR
originalLocale: en
path: /pt/projetos/orbit/api/
title: API do Orbit
description: Os endpoints HTTP do servidor Orbit para jobs e execuções, com campos de requisição, códigos de status e exemplos.
tagline: Todos os endpoints implementados, com seus campos e códigos de status.
label: referência da api
order: 1.31
sub: true
group: projects
status: início do desenvolvimento
meta:
  - referência
source: https://github.com/RaioViajante/orbit
summary: endpoints de jobs e execuções
---

## Escopo

Esta página cobre os endpoints que existem no commit `2967494`. A API não tem prefixo de versão, autenticação nem paginação. O servidor usa a porta padrão do Spring Boot porque a configuração não define nenhuma.

## Endpoints

| Método e caminho | Finalidade | Sucesso | Outras respostas |
| --- | --- | --- | --- |
| `POST /jobs` | Criar um job | 201 | falha de validação |
| `GET /jobs` | Listar todos os jobs | 200 | nenhuma |
| `GET /jobs/{id}` | Ler um job | 200 | 404 |
| `PUT /jobs/{id}` | Substituir a configuração de um job | 200 | 404, falha de validação |
| `POST /jobs/{id}/disable` | Desabilitar um job | 200 | 404 |
| `POST /jobs/{id}/enable` | Habilitar um job | 200 | 404 |
| `POST /jobs/{jobId}/executions` | Registrar uma execução de um job | 201 | 404 job desconhecido, 409 job desabilitado |
| `GET /jobs/{jobId}/executions` | Listar as execuções de um job, da mais nova para a mais antiga | 200 | 404 job desconhecido |
| `GET /executions/{id}` | Ler uma execução | 200 | 404 |

Não há endpoint para excluir um job nem para mudar o estado de uma execução. As falhas de validação são produzidas pela validação de requisições do Spring; o repositório não tem teste que fixe o formato da resposta.

## Campos do job

Os corpos de criação e de atualização compartilham os mesmos campos.

| Campo | Tipo | Regra |
| --- | --- | --- |
| `name` | string | obrigatório, no máximo 120 caracteres |
| `command` | string | obrigatório |
| `cronExpression` | string | opcional, não pode estar em branco, no máximo 100 caracteres; guardado sem interpretação |
| `maxRetries` | inteiro | obrigatório, zero ou mais; guardado sem efeito |
| `timeoutSeconds` | inteiro | obrigatório, maior que zero; guardado sem efeito |

```shell title="criar um job"
curl -X POST http://localhost:8080/jobs \
  -H 'Content-Type: application/json' \
  -d '{"name":"database-backup","command":"./backup.sh","cronExpression":"0 3 * * *","maxRetries":0,"timeoutSeconds":300}'
```

A resposta é um job com `id`, `enabled`, `createdAt` e `updatedAt` acrescentados. Um job novo sempre nasce habilitado.

```json
{
  "id": 1,
  "name": "database-backup",
  "command": "./backup.sh",
  "cronExpression": "0 3 * * *",
  "enabled": true,
  "maxRetries": 0,
  "timeoutSeconds": 300,
  "createdAt": "2026-09-15T12:00:00Z",
  "updatedAt": "2026-09-15T12:00:00Z"
}
```

Os valores acima são um exemplo. A expressão cron não é avaliada, então este job não vai rodar às 03:00.

## Execuções

Registrar uma execução copia `command`, `maxRetries` e `timeoutSeconds` do job para o novo registro e define o status como `QUEUED`.

```shell title="registrar uma execução"
curl -X POST http://localhost:8080/jobs/1/executions
```

```json
{
  "id": 1,
  "jobId": 1,
  "status": "QUEUED",
  "command": "./backup.sh",
  "maxRetries": 0,
  "timeoutSeconds": 300,
  "createdAt": "2026-09-15T12:01:00Z",
  "startedAt": null,
  "finishedAt": null,
  "exitCode": null,
  "errorMessage": null
}
```

:::note
A execução permanece `QUEUED`. Os estados `RUNNING`, `SUCCEEDED`, `FAILED` e `CANCELLED` existem no modelo, mas nenhum endpoint nem processo em segundo plano move uma execução para eles ainda.
:::

## Valores de status

| Status | Significado hoje |
| --- | --- |
| `QUEUED` | registrado e em espera; o único estado alcançável pela API |
| `RUNNING` | definido no modelo de domínio |
| `SUCCEEDED` | definido no modelo de domínio |
| `FAILED` | definido no modelo de domínio |
| `CANCELLED` | definido no modelo de domínio |

## Referências

- [Controladores](https://github.com/RaioViajante/orbit/tree/2967494/orbit-server/src/main/java/dev/raioviajante/orbit)
- [Migrações](https://github.com/RaioViajante/orbit/tree/2967494/orbit-server/src/main/resources/db/migration)
