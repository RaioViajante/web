# Content philosophy

## What belongs here

Public documentation on docs.raioviajante.com should be:

- **Factual** — describes what actually exists and how it actually works.
- **Useful** — helps a reader understand or use something, rather than existing for its own sake.
- **Maintainable** — worth the ongoing cost of keeping it accurate.
- **Technical** — about systems, projects, and how they're built, not personal or editorial writing (that belongs on `dump.raioviajante.com`).
- **Intentionally curated** — each page exists because someone decided it should, not because a script generated it.

## What does not belong here

This site does not automatically mirror every `/docs` file from every project repository. A project having internal documentation does not mean that documentation should be republished here. Content is promoted to `docs.raioviajante.com` deliberately, when it's genuinely useful to a public reader.

## Current public information architecture

```
projects/
  sweep/
    cli/

raioviajante/
  design-language/
  repository-conventions/
```

Sweep has a guide and a CLI reference under `projects/sweep/cli/`. The
RaioViajante section contains the design language and repository conventions
pages.

Each English page declares its existing collection entry ID as `contentId`, along
with `locale`, `originalLocale` and its existing public `path`. Every English
document has a Portuguese version under `src/content/docs/pt/`, sharing its
`contentId` and declaring its own localized `path`:

| `contentId` | English | Portuguese |
| --- | --- | --- |
| `projects/sweep` | `/projects/sweep/` | `/pt/projetos/sweep/` |
| `projects/sweep/cli` | `/projects/sweep/cli/` | `/pt/projetos/sweep/cli/` |
| `raioviajante/design-language` | `/raioviajante/design-language/` | `/pt/raioviajante/linguagem-de-design/` |
| `raioviajante/repository-conventions` | `/raioviajante/repository-conventions/` | `/pt/raioviajante/convencoes-de-repositorio/` |

Terms and Privacy also exist in both languages (`/terms/`, `/pt/terms/`,
`/privacy/`, `/pt/privacy/`). A Portuguese document must have its own declared
path and authored body, never an English fallback, and must contain everything
its original does; `tests/translation-parity.test.mjs` compares headings,
callouts, tables, lists, paragraphs, code blocks and links. A work with no public
original retains a nonpublic provenance record before its original is withdrawn.
`src/lib/identity.ts` validates routes and identities at build time. Portuguese
participation in `site/` is on, after production verification of the Portuguese
endpoints. Coverage is complete today (4 of 4 documents), but nothing requires
it: a future document may exist in one language only, and then it is absent from
the other language's navigation and its `LANG` offers the other home.

## Potential future information architecture

Other projects may be added when they meet the publication threshold. Possible future project sections include Orbit, Hum, yanawa, or x86-related material, but none of those projects currently has a public documentation section here. Sections and pages should be created only when there is real, stable content to justify them — never as placeholders.

## Growing this structure

New top-level sections or subsections should be added only when there's concrete content ready to fill them, not speculatively. When in doubt about whether something belongs in `projects/` vs. `raioviajante/`, or whether it belongs here at all, ask rather than guessing.
