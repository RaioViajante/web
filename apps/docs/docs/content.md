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

### Portuguese legal pages and cross-site links

- `/pt/terms/` and `/pt/privacy/` are translations of the English Terms of Use
  and Privacy Policy (`src/components/TermsPage.tsx`, `PrivacyPage.tsx`): same
  sections and facts, no clause added or removed, and no date because the
  English pages show none. The Portuguese footer links them without the "em
  inglês" qualifier. Any change to an English legal text needs the Portuguese
  text reviewed in the same change.
- **Legal status.** The Portuguese texts are an AI translation checked section
  by section against the English; they are not legal advice, and no page states
  or implies that they or the English text prevail. They need the owner's and
  legal review before publication. Open questions, none answered by the pages
  and none added to them: which text controls where the two differ; the English
  sources identify no data controller beyond the operator and CNPJ, state no
  legal basis for processing, no data-subject rights (LGPD), no international
  transfer statement (the host is Vercel) and no last-updated date. Wording to
  read: "operado por … CNPJ", "a fonte definitiva", "o provedor de hospedagem
  (Vercel)", "endereço IP, navegador e a página solicitada", the cookie clause,
  and the `starlight-theme` leftover.
- The Portuguese Sweep guide links Lab's Portuguese experiment
  (`https://lab.raioviajante.com/pt/experiments/classificador-de-arquivos/`),
  which is published on the default branch, so no merge order is involved.
- **Merge order: Dump first.** Four Portuguese links point to the Portuguese
  Dump posts that the Dump localization PR (#99) adds: in the Sweep guide
  `/pt/posts/aparentemente-mover-um-arquivo-tem-casos-de-borda` and
  `/pt/posts/um-arquivo-toml-mudou-o-que-o-sweep-era`, and in the home notes
  `/pt/posts/cansei-de-crud-entao-estou-construindo-um-agendador` (Orbit) and
  `/pt/posts/comecei-a-projetar-uma-linguagem-antes-de-conseguir-compilar-uma`
  (yanawa). They are valid only once #99 is merged: merge Dump #99 first, or
  accept a temporary 404 on those four links. `pnpm links:check` follows links
  between the four apps against the local builds, so it would fail on them;
  `pendingRoutes` in `links/check.mjs` lists exactly those four paths, allows
  only HTTP 404 for them, prints them on every run, and reports a route that
  exists so its entry gets removed (delete the entries when #99 is on `main`).
  Re-check the slugs against `apps/dump/content/posts` if the Dump PR renames
  one.

## Potential future information architecture

Other projects may be added when they meet the publication threshold. Possible future project sections include Orbit, Hum, yanawa, or x86-related material, but none of those projects currently has a public documentation section here. Sections and pages should be created only when there is real, stable content to justify them — never as placeholders.

## Growing this structure

New top-level sections or subsections should be added only when there's concrete content ready to fill them, not speculatively. When in doubt about whether something belongs in `projects/` vs. `raioviajante/`, or whether it belongs here at all, ask rather than guessing.
