---
contentId: projects/orbit/api
locale: en
originalLocale: en
path: /projects/orbit/api/
title: Orbit API
description: The Orbit server's HTTP endpoints for jobs and executions, with request fields, status codes and examples.
tagline: Every implemented endpoint, with its fields and status codes.
label: api reference
order: 1.31
sub: true
group: projects
status: early development
meta:
  - reference
source: https://github.com/RaioViajante/orbit
summary: job and execution endpoints
---

## Scope

This page covers the endpoints that exist at commit `2967494`. The API has no version prefix, no authentication and no pagination. The server runs on Spring Boot's default port because the configuration sets none.

## Endpoints

| Method and path | Purpose | Success | Other answers |
| --- | --- | --- | --- |
| `POST /jobs` | Create a job | 201 | validation failure |
| `GET /jobs` | List all jobs | 200 | none |
| `GET /jobs/{id}` | Read one job | 200 | 404 |
| `PUT /jobs/{id}` | Replace a job's configuration | 200 | 404, validation failure |
| `POST /jobs/{id}/disable` | Disable a job | 200 | 404 |
| `POST /jobs/{id}/enable` | Enable a job | 200 | 404 |
| `POST /jobs/{jobId}/executions` | Record an execution of a job | 201 | 404 unknown job, 409 disabled job |
| `GET /jobs/{jobId}/executions` | List a job's executions, newest first | 200 | 404 unknown job |
| `GET /executions/{id}` | Read one execution | 200 | 404 |

There is no endpoint to delete a job or to change an execution's state. Validation failures are produced by Spring's request validation; the repository has no test that fixes their response format.

## Job fields

The create and update bodies share the same fields.

| Field | Type | Rule |
| --- | --- | --- |
| `name` | string | required, at most 120 characters |
| `command` | string | required |
| `cronExpression` | string | optional, not blank, at most 100 characters; stored without interpretation |
| `maxRetries` | integer | required, zero or more; stored without effect |
| `timeoutSeconds` | integer | required, greater than zero; stored without effect |

```shell title="create a job"
curl -X POST http://localhost:8080/jobs \
  -H 'Content-Type: application/json' \
  -d '{"name":"database-backup","command":"./backup.sh","cronExpression":"0 3 * * *","maxRetries":0,"timeoutSeconds":300}'
```

The response is a job with `id`, `enabled`, `createdAt` and `updatedAt` added. A new job is always enabled.

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

The values above are an example. The cron expression is not evaluated, so this job will not run at 03:00.

## Executions

Recording an execution copies the job's `command`, `maxRetries` and `timeoutSeconds` into the new record and sets its status to `QUEUED`.

```shell title="record an execution"
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
The execution stays `QUEUED`. The states `RUNNING`, `SUCCEEDED`, `FAILED` and `CANCELLED` exist in the model, but no endpoint or background process moves an execution into them yet.
:::

## Status values

| Status | Meaning today |
| --- | --- |
| `QUEUED` | recorded and waiting; the only state reachable through the API |
| `RUNNING` | defined in the domain model |
| `SUCCEEDED` | defined in the domain model |
| `FAILED` | defined in the domain model |
| `CANCELLED` | defined in the domain model |

## References

- [Controllers](https://github.com/RaioViajante/orbit/tree/2967494/orbit-server/src/main/java/dev/raioviajante/orbit)
- [Migrations](https://github.com/RaioViajante/orbit/tree/2967494/orbit-server/src/main/resources/db/migration)
