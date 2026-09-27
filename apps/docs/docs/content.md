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

raioviajante/
  design-language/
  repository-conventions/
```

Sweep currently has one public page. The RaioViajante section contains the design language and repository conventions pages.

## Potential future information architecture

Other projects may be added when they meet the publication threshold. Possible future project sections include Orbit, Hum, yanawa, or x86-related material, but none of those projects currently has a public documentation section here. Sections and pages should be created only when there is real, stable content to justify them — never as placeholders.

## Growing this structure

New top-level sections or subsections should be added only when there's concrete content ready to fill them, not speculatively. When in doubt about whether something belongs in `projects/` vs. `raioviajante/`, or whether it belongs here at all, ask rather than guessing.
