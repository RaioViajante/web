# yanawa: source evidence

Maintenance record for `src/content/docs/projects/yanawa/` and its Portuguese
counterpart. Not published.

- **Source:** `yanawa/yanawa`, public, default branch, commit `7fd082e`
  (16 commits, 2026-09-12 and 2026-09-13; six closed issues, no pull requests).
- **Contents at that commit:** `README.md`, `AGENTS.md`, `CLAUDE.md` and 15
  design documents in `docs/`. No source code, grammar, tests or CI.
- **Policy:** the pages state design only. Nothing may describe a compiler,
  interpreter, command or library as existing until the repository contains it.

| Claim on the pages | Status | Evidence |
| --- | --- | --- |
| No compiler, interpreter, runtime, grammar or packages exist | implemented fact (absence) | `git ls-files` lists only Markdown |
| D001 to D016 are accepted | accepted design | `docs/decisions.md` |
| `let` mutable, `const` immutable, `fn`, `->`, indentation blocks, word operators, interpolation | accepted design | `docs/decisions.md` D002 to D013 |
| `struct` exists as a decision; construction with named fields | accepted (struct) / exploratory (construction) | D014; `docs/syntax.md` "structs" |
| `result<T, E>`, `ok`, `error`, `?`, `match`, `??`, `trait`, `impl`, enums, generics, `async` | exploratory | `docs/syntax.md`, `docs/errors.md`, `docs/type-system.md` |
| `yanawa.toml`, `yanawa.lock`, `yanawa.fs` and the other module names | candidates | `docs/package-system.md`, `docs/standard-library.md` |
| Compiler stages | proposed, nothing built | `docs/compiler-architecture.md` "compilation pipeline" |
| `yanawa` subcommands | intent, not implemented | `README.md` "tooling direction"; `docs/tooling.md` |

## Re-verifying

Pull the repository and check `git ls-files` for source files first. If a
parser or compiler appeared, the pages need a new section and the executable
example must then be run against it. Compare `docs/decisions.md` with the table
on the design page (new decision ids are added there).

## Linked Dump essay

The English page links the Dump essay about starting the language design; the
Portuguese page links its Portuguese post. `tests/translation-parity.test.mjs`
maps the pair, and `build.test.mjs` requires a Portuguese page to link that post.
