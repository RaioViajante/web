# Orbit: source evidence

Maintenance record for `src/content/docs/projects/orbit/` and its Portuguese
counterpart. Not published.

- **Source:** `RaioViajante/orbit`, public, commit `2967494` (21 commits,
  2026-09-06 to 2026-09-15). Module `orbit-server` only; no worker or web module.
- **Not run:** the Java tests were read, not executed, for the pages.
- **Do not link** the retired Dump articles `building-orbit` and
  `an-execution-is-more-than-...`; `build.test.mjs` fails on them.

| Claim on the pages | Status | Evidence |
| --- | --- | --- |
| Job CRUD except delete; enable and disable | implemented | `job/web/JobController.java` |
| `POST /jobs/{id}/executions` creates a `QUEUED` execution, 409 for a disabled job | implemented | `ExecutionService.createForJob`, `ExecutionController` |
| Execution transitions `start`, `succeed`, `fail`, `cancel` | implemented in the domain only | `Execution.java`; `grep` finds no caller outside tests |
| Execution copies `command`, `max_retries`, `timeout_seconds` | implemented | `Execution(Job)` constructor, migration `V2` |
| Cron, scheduler, workers, claiming, timeouts, retries, logs, auth, web UI, packaging | planned | open issues #27 to #59; `docs/architecture.md` "initial scope" |
| `cron_expression` is not parsed | verified absence | `Job.validateCronExpression` checks blankness only |
| No `attempt` column | verified absence | `V2__create_executions_table.sql` |
| Stack: Spring Boot 4.1.1, Java 25, Flyway, JPA, PostgreSQL 17 | implemented | `pom.xml`, `compose.yaml`, `application.properties` |
| 40 `@Test` methods; Testcontainers for repositories | read | `orbit-server/src/test` |
| No controller tests, no CI workflow | verified absence | no `.github`, no `@WebMvcTest` |
| Format of validation failures | not verified | no `@ControllerAdvice`, no web test |

## Re-verifying

Check `git log` after `2967494`. The scheduler, worker, retry and timeout rows
change first; each flips from planned only when code (not an issue state)
implements it. Re-run the grep for callers of the transition methods.
