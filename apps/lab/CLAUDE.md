# CLAUDE.md

Read [`AGENTS.md`](AGENTS.md) first — it is the primary instruction file for this repository (project purpose, stack, visual identity, experiment content model, Git workflow, and working principles). This file only adds Claude-specific notes.

- Follow the commit rules in `AGENTS.md` exactly: Conventional Commits, one coherent change per commit, no push without explicit permission, no history rewrites.
- Keep implementations simple. Avoid unnecessary abstractions, and do not introduce a UI framework beyond Astro + TypeScript unless an experiment genuinely requires it.
- Preserve the established RaioViajante visual identity (`docs/design.md`) instead of defaulting to generic dashboard or documentation-SaaS patterns.
- `reference/claude-export/` is read-only and git-ignored — never edit, move, format, or commit anything inside it.
- Experiments are real, provenance-backed content. Follow `docs/content.md` for immutable numbering, Lab publication dates, optional public source links, and faithful browser reproductions. Never present planned project functionality as implemented.
- Don't duplicate content already covered in `AGENTS.md` — extend it there if a new agent-wide rule is needed, rather than restating it here.
